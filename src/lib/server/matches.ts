import { ObjectId, type Collection } from 'mongodb';
import { getDb } from './db.ts';
import { randomAnswer, isValidWord } from './words/index.ts';
import { PLAYERS, opponentOf, type Player } from '#lib/players.ts';
import { evaluateGuess, isSolved } from '#lib/wordle/evaluate.ts';
import { DEFAULT_MAX_GUESSES, DEFAULT_WORD_LENGTH } from '#lib/wordle/config.ts';
import type { EvaluatedGuess, GuessResponse } from '#lib/wordle/types.ts';
import type { LobbyState, MatchSummary, MatchView } from '#lib/multiplayer/types.ts';

/** A player counts as online if they polled within this window. */
const ONLINE_WINDOW_MS = 8_000;

interface MatchDoc {
	_id: ObjectId;
	word: string;
	length: number;
	maxGuesses: number;
	status: 'active' | 'finished';
	guesses: Record<Player, EvaluatedGuess[]>;
	/** null on a finished match means nobody solved it. */
	winner: Player | null;
	/** Players who have dismissed the result screen; next match starts once both have. */
	acked: Player[];
	createdAt: Date;
	finishedAt?: Date;
}

interface PresenceDoc {
	_id: Player;
	lastSeen: Date;
}

async function collections() {
	const db = await getDb();
	return {
		matches: db.collection<MatchDoc>('matches'),
		presence: db.collection<PresenceDoc>('presence')
	};
}

const isDone = (m: MatchDoc, p: Player) => {
	const g = m.guesses[p];
	return g.length >= m.maxGuesses || (g.length > 0 && isSolved(g[g.length - 1].result));
};

function toView(m: MatchDoc, p: Player): MatchView {
	const opp = opponentOf(p);
	return {
		id: m._id.toHexString(),
		length: m.length,
		maxGuesses: m.maxGuesses,
		status: m.status,
		myGuesses: m.guesses[p],
		opponentResults: m.guesses[opp].map((g) => g.result),
		opponentDone: isDone(m, opp),
		winner: m.winner,
		word: m.status === 'finished' ? m.word : undefined
	};
}

async function createMatch(matches: Collection<MatchDoc>) {
	const length = DEFAULT_WORD_LENGTH;
	try {
		await matches.insertOne({
			_id: new ObjectId(),
			word: randomAnswer(length),
			length,
			maxGuesses: DEFAULT_MAX_GUESSES,
			status: 'active',
			guesses: Object.fromEntries(PLAYERS.map((p) => [p, []])) as unknown as MatchDoc['guesses'],
			winner: null,
			acked: [],
			createdAt: new Date()
		});
	} catch (err) {
		// The other player created it at the same moment — the unique index kept only one.
		if ((err as { code?: number }).code !== 11000) throw err;
	}
	return matches.findOne({ status: 'active' });
}

/**
 * Heartbeat + matchmaking. Called by each client on a short poll.
 * `entering` marks a fresh page visit: any unseen result is dismissed and the player goes straight to matchmaking.
 */
export async function pollLobby(player: Player, entering: boolean): Promise<LobbyState> {
	const { matches, presence } = await collections();
	const now = new Date();
	const opp = opponentOf(player);

	await presence.updateOne({ _id: player }, { $set: { lastSeen: now } }, { upsert: true });

	let active = await matches.findOne({ status: 'active' });
	if (active) return { phase: 'playing', match: toView(active, player) };

	const latest = await matches.findOne({}, { sort: { createdAt: -1 } });
	if (latest && !latest.acked.includes(player)) {
		if (!entering) return { phase: 'result', match: toView(latest, player) };
		await matches.updateOne({ _id: latest._id }, { $addToSet: { acked: player } });
		latest.acked.push(player);
	}

	const oppPresence = await presence.findOne({ _id: opp });
	const opponentOnline = !!oppPresence && now.getTime() - oppPresence.lastSeen.getTime() < ONLINE_WINDOW_MS;
	const opponentReady = !latest || latest.acked.includes(opp);

	if (opponentOnline && opponentReady) {
		active = await createMatch(matches);
		if (active) return { phase: 'playing', match: toView(active, player) };
	}

	return { phase: 'waiting', opponentOnline, opponentReady };
}

export async function acknowledgeResult(player: Player, matchId: string) {
	if (!ObjectId.isValid(matchId)) return;
	const { matches } = await collections();
	await matches.updateOne(
		{ _id: new ObjectId(matchId), status: 'finished' },
		{ $addToSet: { acked: player } }
	);
}

/** Marks the player offline right away (e.g. when the tab closes) instead of waiting for the window to lapse. */
export async function leaveLobby(player: Player) {
	const { presence } = await collections();
	await presence.updateOne({ _id: player }, { $set: { lastSeen: new Date(0) } });
}

export async function submitGuess(player: Player, matchId: string, raw: string): Promise<GuessResponse> {
	if (!ObjectId.isValid(matchId)) return { ok: false, error: 'Unknown match' };
	const { matches } = await collections();
	const _id = new ObjectId(matchId);
	const match = await matches.findOne({ _id });

	if (!match || match.status !== 'active') return { ok: false, error: 'Match is over' };
	if (isDone(match, player)) return { ok: false, error: 'No guesses left' };

	const word = raw.toLowerCase();
	if (word.length !== match.length) return { ok: false, error: 'Not enough letters' };
	if (!/^[a-z]+$/.test(word) || !isValidWord(word)) return { ok: false, error: 'Not in word list' };

	const result = evaluateGuess(word, match.word);
	const guessesPath = `guesses.${player}` as const;

	// Guarded push: only applies while the match is active and this player still has guesses left.
	const updated = await matches.findOneAndUpdate(
		{ _id, status: 'active', [`${guessesPath}.${match.maxGuesses - 1}`]: { $exists: false } },
		{ $push: { [guessesPath]: { word, result } } },
		{ returnDocument: 'after' }
	);
	if (!updated) return { ok: false, error: 'Match is over' };

	if (isSolved(result)) {
		// First solver wins; the status filter makes this a no-op for whoever is second.
		await matches.updateOne(
			{ _id, status: 'active' },
			{ $set: { status: 'finished', winner: player, finishedAt: new Date() } }
		);
	} else if (PLAYERS.every((p) => isDone(updated, p))) {
		await matches.updateOne(
			{ _id, status: 'active' },
			{ $set: { status: 'finished', winner: null, finishedAt: new Date() } }
		);
	}

	return { ok: true, result };
}

export async function matchHistory(limit = 50): Promise<MatchSummary[]> {
	const { matches } = await collections();
	const docs = await matches
		.find({ status: 'finished' }, { sort: { finishedAt: -1 }, limit, projection: { guesses: 0 } })
		.toArray();
	return docs.map((m) => ({
		id: m._id.toHexString(),
		word: m.word,
		winner: m.winner,
		loser: m.winner ? opponentOf(m.winner) : null,
		finishedAt: (m.finishedAt ?? m.createdAt).toISOString()
	}));
}
