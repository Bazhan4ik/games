import { getPlayer } from '#lib/server/player.ts';
import { leaveLobby } from '#lib/server/matches.ts';
import type { RequestHandler } from './$types';

// Hit via navigator.sendBeacon when the tab is hidden or closed.
export const POST: RequestHandler = async ({ cookies }) => {
	const player = getPlayer(cookies);
	if (player) await leaveLobby(player);
	return new Response(null, { status: 204 });
};
