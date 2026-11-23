import type { EvaluatedGuess, LetterState } from './types.ts';

/** Standard Wordle scoring, handling repeated letters correctly. Works for any word length. */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
	const g = guess.toLowerCase();
	const a = answer.toLowerCase();
	const result: LetterState[] = Array(g.length).fill('absent');
	const remaining = new Map<string, number>();

	for (let i = 0; i < a.length; i++) {
		if (g[i] === a[i]) result[i] = 'correct';
		else remaining.set(a[i], (remaining.get(a[i]) ?? 0) + 1);
	}

	for (let i = 0; i < g.length; i++) {
		if (result[i] === 'correct') continue;
		const left = remaining.get(g[i]) ?? 0;
		if (left > 0) {
			result[i] = 'present';
			remaining.set(g[i], left - 1);
		}
	}

	return result;
}

export const isSolved = (result: LetterState[]) => result.every((s) => s === 'correct');

const rank: Record<LetterState, number> = { absent: 0, present: 1, correct: 2 };

/** Best known state per letter, for colouring the on-screen keyboard. */
export function keyboardStates(guesses: EvaluatedGuess[]): Record<string, LetterState> {
	const states: Record<string, LetterState> = {};
	for (const { word, result } of guesses) {
		for (let i = 0; i < word.length; i++) {
			const prev = states[word[i]];
			if (!prev || rank[result[i]] > rank[prev]) states[word[i]] = result[i];
		}
	}
	return states;
}
