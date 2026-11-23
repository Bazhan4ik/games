export const PLAYERS = ['B', 'S'] as const;
export type Player = (typeof PLAYERS)[number];

export const PLAYER_COOKIE = 'player';

export const isPlayer = (value: unknown): value is Player =>
	typeof value === 'string' && (PLAYERS as readonly string[]).includes(value);

export const opponentOf = (p: Player): Player => (p === 'B' ? 'S' : 'B');
