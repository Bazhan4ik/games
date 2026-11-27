/**
 * Drawings are stored as vector strokes, not pixels, so they replay exactly at any size.
 *
 * Points live on a square 0..GRID integer grid. Encoded form (what's saved in the db):
 * strokes separated by `;`, each `x,y,dx,dy,dx,dy,...` — the first point absolute, the rest
 * deltas from the previous point, which keeps most numbers to one or two digits.
 * e.g. two strokes: "120,340,3,1,4,0;500,500"
 */
export const GRID = 1000;
/** Pen width in grid units. */
export const LINE_WIDTH = 9;
/** Points closer than this (grid units) to the previous one are dropped while drawing. */
export const MIN_STEP = 3;
/** Upper bound on an encoded drawing, far above anything drawn by hand. */
export const MAX_ENCODED_LENGTH = 400_000;

export type Point = [x: number, y: number];
export type Stroke = Point[];

export function encodeStrokes(strokes: Stroke[]): string {
	return strokes
		.filter((s) => s.length > 0)
		.map((stroke) => {
			const out: number[] = [];
			let [px, py] = [0, 0];
			for (const [x, y] of stroke) {
				out.push(x - px, y - py);
				[px, py] = [x, y];
			}
			return out.join(',');
		})
		.join(';');
}

const STROKE_RE = /^-?\d{1,4}(,-?\d{1,4})*$/;

/** Returns null when `encoded` isn't a well-formed drawing (so the server can reject it). */
export function decodeStrokes(encoded: string): Stroke[] | null {
	if (encoded.length === 0 || encoded.length > MAX_ENCODED_LENGTH) return null;
	const strokes: Stroke[] = [];
	for (const part of encoded.split(';')) {
		if (!STROKE_RE.test(part)) return null;
		const nums = part.split(',').map(Number);
		if (nums.length % 2) return null;
		const stroke: Stroke = [];
		let [x, y] = [0, 0];
		for (let i = 0; i < nums.length; i += 2) {
			x += nums[i];
			y += nums[i + 1];
			if (x < 0 || y < 0 || x > GRID || y > GRID) return null;
			stroke.push([x, y]);
		}
		strokes.push(stroke);
	}
	return strokes;
}

/** Clears a square canvas and maps the grid onto its full pixel size. */
export function preparePen(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const ctx = canvas.getContext('2d')!;
	const scale = canvas.width / GRID;
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.setTransform(scale, 0, 0, scale, 0, 0);
	ctx.strokeStyle = ctx.fillStyle = '#000';
	ctx.lineWidth = LINE_WIDTH;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	return ctx;
}

/** Sizes `canvas` to its on-screen size (at device resolution) and draws `strokes` on it. */
export function renderDrawing(canvas: HTMLCanvasElement, strokes: Stroke[]): CanvasRenderingContext2D {
	canvas.width = canvas.height = Math.round(canvas.clientWidth * (window.devicePixelRatio || 1));
	const ctx = preparePen(canvas);
	for (const stroke of strokes) drawStroke(ctx, stroke);
	return ctx;
}

/** Draws the part of `stroke` from point `from` on (used both for live drawing and replay). */
export function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, from = 0) {
	if (stroke.length === 1) {
		const [x, y] = stroke[0];
		ctx.beginPath();
		ctx.arc(x, y, LINE_WIDTH / 2, 0, Math.PI * 2);
		ctx.fill();
		return;
	}
	const start = Math.max(0, from - 1);
	ctx.beginPath();
	ctx.moveTo(...stroke[start]);
	for (let i = start + 1; i < stroke.length; i++) ctx.lineTo(...stroke[i]);
	ctx.stroke();
}
