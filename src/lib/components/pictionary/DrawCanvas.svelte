<script lang="ts">
	import { onMount } from 'svelte';
	import { GRID, MIN_STEP, drawStroke, renderDrawing, type Stroke } from '#lib/pictionary/strokes.ts';

	/** Finished and in-progress strokes, in grid units. Bindable so the parent can submit/undo. */
	let { strokes = $bindable([]) }: { strokes?: Stroke[] } = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let current: Stroke | null = null;
	let pointerId: number | null = null;

	const redraw = () => (ctx = renderDrawing(canvas, strokes));

	onMount(() => {
		const observer = new ResizeObserver(redraw);
		observer.observe(canvas);
		return () => observer.disconnect();
	});

	// Re-render when strokes are removed from outside (undo).
	$effect(() => {
		strokes.length;
		if (ctx && !current) redraw();
	});

	function toGrid(e: PointerEvent): [number, number] {
		const rect = canvas.getBoundingClientRect();
		const clamp = (v: number) => Math.min(GRID, Math.max(0, Math.round(v)));
		return [clamp(((e.clientX - rect.left) / rect.width) * GRID), clamp(((e.clientY - rect.top) / rect.height) * GRID)];
	}

	function down(e: PointerEvent) {
		if (pointerId !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
		pointerId = e.pointerId;
		canvas.setPointerCapture(e.pointerId);
		current = [toGrid(e)];
		drawStroke(ctx, current);
	}

	function move(e: PointerEvent) {
		if (e.pointerId !== pointerId || !current) return;
		const from = current.length;
		for (const ev of e.getCoalescedEvents?.() ?? [e]) {
			const p = toGrid(ev);
			const [lx, ly] = current[current.length - 1];
			if (Math.hypot(p[0] - lx, p[1] - ly) >= MIN_STEP) current.push(p);
		}
		if (current.length > from) drawStroke(ctx, current, from);
	}

	function up(e: PointerEvent) {
		if (e.pointerId !== pointerId || !current) return;
		const done = current;
		current = null;
		pointerId = null;
		strokes = [...strokes, done];
	}
</script>

<canvas
	bind:this={canvas}
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	aria-label="Drawing canvas"
></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		aspect-ratio: 1;
		border: 1px solid var(--tile-border-filled);
		border-radius: 4px;
		background: #fff;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		cursor: crosshair;
	}
</style>
