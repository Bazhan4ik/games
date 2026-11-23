import { json } from '@sveltejs/kit';
import { requirePlayer } from '#lib/server/player.ts';
import { pollLobby } from '#lib/server/matches.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const player = requirePlayer(cookies);
	return json(await pollLobby(player, url.searchParams.has('enter')));
};
