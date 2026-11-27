import { STREAK_TIMEZONE } from '$app/env/private';
import { getDb } from './db.ts';
import type { Streak } from '#lib/multiplayer/types.ts';

/**
 * Shared daily streak per game: consecutive days that counted (Wordle: at least one
 * finished match; Pictionary: both players drew). Only changes when a day is recorded,
 * so a missed day shows up as a reset the next time one is.
 */
export type StreakGame = 'wordle' | 'pictionary';

// Wordle keeps the original `streak` id so existing streaks carry over.
const STREAK_IDS: Record<StreakGame, string> = { wordle: 'streak', pictionary: 'pictionary-streak' };

interface StreakDoc {
	_id: string;
	current: number;
	/** YYYY-MM-DD in STREAK_TIMEZONE of the last day that counted. */
	lastDay: string;
}

const dayFormat = new Intl.DateTimeFormat('en-CA', {
	timeZone: STREAK_TIMEZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

/** Calendar day (YYYY-MM-DD) in the streak timezone. */
export const dayOf = (date: Date) => dayFormat.format(date);

function previousDay(day: string) {
	const [y, m, d] = day.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

const stats = async () => (await getDb()).collection<StreakDoc>('stats');

export async function recordStreakDay(game: StreakGame, at: Date) {
	const today = dayOf(at);
	const yesterday = previousDay(today);

	// Single atomic pipeline update, so two near-simultaneous finishes can't double count.
	await (await stats()).updateOne(
		{ _id: STREAK_IDS[game] },
		[
			{
				$set: {
					current: {
						$switch: {
							branches: [
								{ case: { $eq: ['$lastDay', today] }, then: '$current' },
								{ case: { $eq: ['$lastDay', yesterday] }, then: { $add: ['$current', 1] } }
							],
							default: 1
						}
					},
					lastDay: today
				}
			}
		],
		{ upsert: true }
	);
}

export async function getStreak(game: StreakGame): Promise<Streak> {
	const doc = await (await stats()).findOne({ _id: STREAK_IDS[game] });
	return { current: doc?.current ?? 0, playedToday: doc?.lastDay === dayOf(new Date()) };
}
