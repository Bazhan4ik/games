import { fail } from '@sveltejs/kit';
import { isPlayer } from '#lib/players.ts';
import { getPlayer, setPlayer } from '#lib/server/player.ts';
import { getStreak } from '#lib/server/streak.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const player = getPlayer(cookies);
	if (!player) return { player: null, streaks: null };

	const [wordle, pictionary] = await Promise.all([getStreak('wordle'), getStreak('pictionary')]);
	return { player, streaks: { wordle, pictionary } };
};

export const actions: Actions = {
	pick: async ({ cookies, request }) => {
		// No switching: a device that already picked keeps its player until the cookie expires.
		if (getPlayer(cookies)) return fail(403, { error: 'Player already chosen on this device' });

		const player = (await request.formData()).get('player');
		if (!isPlayer(player)) return fail(400, { error: 'Unknown player' });
		setPlayer(cookies, player);
	}
};
