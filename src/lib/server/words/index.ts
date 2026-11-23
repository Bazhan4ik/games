import dictionary from 'an-array-of-english-words' with { type: 'json' };
import answers5 from './answers-5.ts';

/**
 * Answer pools per word length. To support 6/7-letter games, add an
 * `answers-6.ts` / `answers-7.ts` list and register it here.
 */
const answerPools: Record<number, string[]> = {
	5: answers5
};

const validByLength = new Map<number, Set<string>>();

function validWords(length: number): Set<string> {
	let set = validByLength.get(length);
	if (!set) {
		set = new Set((dictionary as string[]).filter((w) => w.length === length && /^[a-z]+$/.test(w)));
		for (const w of answerPools[length] ?? []) set.add(w);
		validByLength.set(length, set);
	}
	return set;
}

export const supportedLengths = () => Object.keys(answerPools).map(Number);

export function randomAnswer(length: number): string {
	const pool = answerPools[length];
	if (!pool?.length) throw new Error(`No answer list for ${length}-letter words`);
	return pool[Math.floor(Math.random() * pool.length)];
}

export const isValidWord = (word: string) => validWords(word.length).has(word.toLowerCase());
