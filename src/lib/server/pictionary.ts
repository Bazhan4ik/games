import { MongoServerError } from 'mongodb';
import { getDb } from './db.ts';
import { dayOf, recordStreakDay } from './streak.ts';
import drawWords from './words/draw-words.ts';
import { opponentOf, type Player } from '#lib/players.ts';
import type { DrawingView, Reaction, TodayView } from '#lib/pictionary/types.ts';

/** One drawing per player per day. Never deleted; only today's are ever shown. */
interface DrawingDoc {
	/** `${day}:${player}` — the unique id is what stops a second drawing on the same day. */
	_id: string;
	day: string;
	player: Player;
	word: string;
	strokes: string;
	createdAt: Date;
	/** Reaction the other player gave this drawing. */
	reaction?: Reaction;
}

const drawings = async () => (await getDb()).collection<DrawingDoc>('drawings');
const idOf = (day: string, player: Player) => `${day}:${player}`;

/** Word for a day: walks the list in order, one word per calendar day. */
export function wordOf(day: string) {
	const days = Math.round(Date.parse(day) / 86_400_000);
	return drawWords[((days % drawWords.length) + drawWords.length) % drawWords.length];
}

const view = (doc: DrawingDoc): DrawingView => ({
	player: doc.player,
	strokes: doc.strokes,
	reaction: doc.reaction ?? null
});

export async function today(player: Player): Promise<TodayView> {
	const day = dayOf(new Date());
	const docs = await (await drawings()).find({ day }).toArray();
	const mine = docs.find((d) => d.player === player);
	const theirs = docs.find((d) => d.player === opponentOf(player));
	return {
		day,
		word: wordOf(day),
		mine: mine ? view(mine) : null,
		theirs: mine && theirs ? view(theirs) : null,
		opponentDone: !!theirs
	};
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

/** `day` is the day the drawing was started, so a drawing that spans midnight isn't misfiled. */
export async function submitDrawing(player: Player, day: string, strokes: string): Promise<SubmitResult> {
	const now = new Date();
	if (day !== dayOf(now)) return { ok: false, error: 'A new day has started — reload for the new word' };

	const col = await drawings();
	try {
		await col.insertOne({ _id: idOf(day, player), day, player, word: wordOf(day), strokes, createdAt: now });
	} catch (err) {
		if (err instanceof MongoServerError && err.code === 11000) return { ok: false, error: 'Already drawn today' };
		throw err;
	}
	// Both drawn → today counts. Recording is idempotent per day, so a race between the two is harmless.
	if (await col.countDocuments({ _id: idOf(day, opponentOf(player)) })) await recordStreakDay('pictionary', now);
	return { ok: true };
}

/** React to the opponent's drawing of today. Only allowed once both have drawn. */
export async function react(player: Player, reaction: Reaction): Promise<SubmitResult> {
	const day = dayOf(new Date());
	const col = await drawings();
	if (!(await col.countDocuments({ _id: idOf(day, player) }))) return { ok: false, error: 'Draw yours first' };
	const { matchedCount } = await col.updateOne({ _id: idOf(day, opponentOf(player)) }, { $set: { reaction } });
	return matchedCount ? { ok: true } : { ok: false, error: 'Nothing to react to yet' };
}
