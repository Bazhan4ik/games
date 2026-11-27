import { error, redirect } from '@sveltejs/kit';
import { getPlayer } from '#lib/server/player.ts';
import { matchDetail } from '#lib/server/matches.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const player = getPlayer(cookies);
	if (!player) redirect(303, '/');

	const match = await matchDetail(params.id);
	if (!match) error(404, 'Match not found');

	return { player, match };
};
