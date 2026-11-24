import type { Player } from '#lib/players.ts';
import type { EvaluatedGuess, LetterState } from '#lib/wordle/types.ts';

/** What a single player is allowed to see of a match (no answer until it's over, no opponent letters). */
export interface MatchView {
	id: string;
	length: number;
	maxGuesses: number;
	status: 'active' | 'finished';
	myGuesses: EvaluatedGuess[];
	/** Opponent's colour pattern only — letters stay hidden. */
	opponentResults: LetterState[][];
	opponentDone: boolean;
	winner: Player | null;
	word?: string;
	/** Set while the opponent is away: seconds until the match is cancelled. */
	cancelsInSec: number | null;
}

export type LobbyState =
	/** On the home page; `opponentQueued` means they've pressed "Enter match" and are waiting. */
	| { phase: 'home'; opponentQueued: boolean }
	/** In matchmaking, waiting for the opponent to enter too. */
	| { phase: 'queued'; opponentOnline: boolean }
	| { phase: 'playing'; match: MatchView }
	| { phase: 'result'; match: MatchView };

/** A finished match with both players' full guesses, for the match detail page. */
export interface MatchDetail {
	id: string;
	word: string;
	length: number;
	maxGuesses: number;
	winner: Player | null;
	finishedAt: string;
	guesses: Record<Player, EvaluatedGuess[]>;
}

export interface Streak {
	current: number;
	/** A match was finished today, so today already counts towards the streak. */
	playedToday: boolean;
}

export interface MatchSummary {
	id: string;
	word: string;
	winner: Player | null;
	loser: Player | null;
	finishedAt: string;
}
