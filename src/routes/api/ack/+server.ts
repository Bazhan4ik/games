import { error } from '@sveltejs/kit';
import { requirePlayer } from '#lib/server/player.ts';
import { acknowledgeResult } from '#lib/server/matches.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const player = requirePlayer(cookies);
	const { matchId } = await request.json().catch(() => ({}));
	if (typeof matchId !== 'string') error(400, 'Bad request');
	await acknowledgeResult(player, matchId);
	return new Response(null, { status: 204 });
};
