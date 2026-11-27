import { redirect } from '@sveltejs/kit';
import { getPlayer } from '#lib/server/player.ts';
import { matchHistory } from '#lib/server/matches.ts';
import { getStreak } from '#lib/server/streak.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends }) => {
	depends('app:history');
	const player = getPlayer(cookies);
	if (!player) redirect(303, '/');

	const [history, streak] = await Promise.all([matchHistory(), getStreak('wordle')]);
	return { player, history, streak };
};
