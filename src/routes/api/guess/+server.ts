import { error, json } from '@sveltejs/kit';
import { requirePlayer } from '#lib/server/player.ts';
import { submitGuess } from '#lib/server/matches.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const player = requirePlayer(cookies);
	const { matchId, word } = await request.json().catch(() => ({}));
	if (typeof matchId !== 'string' || typeof word !== 'string') error(400, 'Bad request');
	return json(await submitGuess(player, matchId, word));
};
