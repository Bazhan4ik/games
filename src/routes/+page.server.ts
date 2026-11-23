import { fail } from '@sveltejs/kit';
import { isPlayer } from '#lib/players.ts';
import { clearPlayer, getPlayer, setPlayer } from '#lib/server/player.ts';
import { matchHistory } from '#lib/server/matches.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends }) => {
	depends('app:history');
	const player = getPlayer(cookies);
	if (!player) return { player: null, history: [] };

	setPlayer(cookies, player); // keep the cookie fresh
	return { player, history: await matchHistory() };
};

export const actions: Actions = {
	pick: async ({ cookies, request }) => {
		const player = (await request.formData()).get('player');
		if (!isPlayer(player)) return fail(400, { error: 'Unknown player' });
		setPlayer(cookies, player);
	},
	forget: async ({ cookies }) => {
		clearPlayer(cookies);
	}
};
