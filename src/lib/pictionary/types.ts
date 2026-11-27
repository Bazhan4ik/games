import type { Player } from '#lib/players.ts';

export const REACTIONS = { thinking: '🤔', puking: '🤮', eyebrow: '🤨' } as const;
export type Reaction = keyof typeof REACTIONS;

export const isReaction = (value: unknown): value is Reaction =>
	typeof value === 'string' && Object.hasOwn(REACTIONS, value);

export interface DrawingView {
	player: Player;
	/** Encoded strokes, see strokes.ts. */
	strokes: string;
	/** What the other player reacted to this drawing with. */
	reaction: Reaction | null;
}

export interface TodayView {
	day: string;
	word: string;
	mine: DrawingView | null;
	/** Only sent once `mine` exists, so nobody can peek before drawing. */
	theirs: DrawingView | null;
	/** The opponent has drawn (even if `theirs` is withheld). */
	opponentDone: boolean;
}
