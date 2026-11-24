import { error } from '@sveltejs/kit';
import { requirePlayer } from '#lib/server/player.ts';
import { setQueued } from '#lib/server/matches.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const player = requirePlayer(cookies);
	const { queued } = await request.json().catch(() => ({}));
	if (typeof queued !== 'boolean') error(400, 'Bad request');
	await setQueued(player, queued);
	return new Response(null, { status: 204 });
};
