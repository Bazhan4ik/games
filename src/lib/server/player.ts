import { error, type Cookies } from '@sveltejs/kit';
import { PLAYER_COOKIE, isPlayer, type Player } from '#lib/players.ts';

// Browsers cap cookie lifetime at ~400 days; it's refreshed on every visit.
const MAX_AGE = 60 * 60 * 24 * 400;

export function getPlayer(cookies: Cookies): Player | null {
	const value = cookies.get(PLAYER_COOKIE);
	return isPlayer(value) ? value : null;
}

export function requirePlayer(cookies: Cookies): Player {
	const player = getPlayer(cookies);
	if (!player) error(401, 'Pick a player first');
	return player;
}

export function setPlayer(cookies: Cookies, player: Player) {
	cookies.set(PLAYER_COOKIE, player, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: MAX_AGE });
}

export function clearPlayer(cookies: Cookies) {
	cookies.delete(PLAYER_COOKIE, { path: '/' });
}
