export type LetterState = 'correct' | 'present' | 'absent';

/** A submitted guess together with its per-letter evaluation. */
export interface EvaluatedGuess {
	word: string;
	result: LetterState[];
}

export type GuessResponse =
	| { ok: true; result: LetterState[] }
	| { ok: false; error: string };

/** Evaluates a guess. Mode-specific: local for solo, server round-trip for multiplayer. */
export type GuessHandler = (word: string) => Promise<GuessResponse>;
