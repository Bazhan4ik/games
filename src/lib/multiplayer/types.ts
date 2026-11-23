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
}

export type LobbyState =
	| { phase: 'waiting'; opponentOnline: boolean; /** Opponent is still looking at the last result. */ opponentReady: boolean }
	| { phase: 'playing'; match: MatchView }
	| { phase: 'result'; match: MatchView };

export interface MatchSummary {
	id: string;
	word: string;
	winner: Player | null;
	loser: Player | null;
	finishedAt: string;
}
