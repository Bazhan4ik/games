import { fail, redirect } from '@sveltejs/kit';
import { getPlayer, requirePlayer } from '#lib/server/player.ts';
import { react, submitDrawing, today } from '#lib/server/pictionary.ts';
import { getStreak } from '#lib/server/streak.ts';
import { decodeStrokes } from '#lib/pictionary/strokes.ts';
import { isReaction } from '#lib/pictionary/types.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, depends }) => {
	depends('app:pictionary');
	const player = getPlayer(cookies);
	if (!player) redirect(303, '/');

	const [todayView, streak] = await Promise.all([today(player), getStreak('pictionary')]);
	return { player, today: todayView, streak };
};

export const actions: Actions = {
	draw: async ({ cookies, request }) => {
		const player = requirePlayer(cookies);
		const form = await request.formData();
		const strokes = form.get('strokes');
		const day = form.get('day');
		if (typeof strokes !== 'string' || typeof day !== 'string' || !decodeStrokes(strokes)) {
			return fail(400, { error: 'Invalid drawing' });
		}
		const result = await submitDrawing(player, day, strokes);
		if (!result.ok) return fail(409, { error: result.error });
	},
	react: async ({ cookies, request }) => {
		const player = requirePlayer(cookies);
		const reaction = (await request.formData()).get('reaction');
		if (!isReaction(reaction)) return fail(400, { error: 'Unknown reaction' });
		const result = await react(player, reaction);
		if (!result.ok) return fail(409, { error: result.error });
	}
};
