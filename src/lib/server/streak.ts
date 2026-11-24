import { STREAK_TIMEZONE } from '$app/env/private';
import { getDb } from './db.ts';
import type { Streak } from '#lib/multiplayer/types.ts';

/**
 * Shared daily streak: consecutive days with at least one finished match.
 * Only changes when a match finishes (cancelled matches never count), so a
 * missed day shows up as a reset the next time a match is finished.
 */
interface StreakDoc {
	_id: 'streak';
	current: number;
	best: number;
	/** YYYY-MM-DD in STREAK_TIMEZONE of the last finished match. */
	lastDay: string;
}

const dayFormat = new Intl.DateTimeFormat('en-CA', {
	timeZone: STREAK_TIMEZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

/** Calendar day (YYYY-MM-DD) in the streak timezone. */
const dayOf = (date: Date) => dayFormat.format(date);

function previousDay(day: string) {
	const [y, m, d] = day.split('-').map(Number);
	return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

const stats = async () => (await getDb()).collection<StreakDoc>('stats');

export async function recordFinishedMatch(finishedAt: Date) {
	const today = dayOf(finishedAt);
	const yesterday = previousDay(today);

	// Single atomic pipeline update, so two near-simultaneous finishes can't double count.
	await (await stats()).updateOne(
		{ _id: 'streak' },
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
			},
			{ $set: { best: { $max: ['$best', '$current'] } } }
		],
		{ upsert: true }
	);
}

export async function getStreak(): Promise<Streak> {
	const doc = await (await stats()).findOne({ _id: 'streak' });
	return { current: doc?.current ?? 0, best: doc?.best ?? 0 };
}
