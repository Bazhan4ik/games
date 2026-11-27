<script lang="ts">
	import { onMount } from 'svelte';
	import { decodeStrokes, renderDrawing } from '#lib/pictionary/strokes.ts';

	let { strokes, label }: { strokes: string; label: string } = $props();

	let canvas: HTMLCanvasElement;
	const decoded = $derived(decodeStrokes(strokes) ?? []);

	onMount(() => {
		const observer = new ResizeObserver(() => renderDrawing(canvas, decoded));
		observer.observe(canvas);
		return () => observer.disconnect();
	});
</script>

<div role="img" aria-label={label}><canvas bind:this={canvas}></canvas></div>

<style>
	canvas {
		display: block;
		width: 100%;
		aspect-ratio: 1;
		border: 1px solid var(--tile-border);
		border-radius: 4px;
		background: #fff;
	}
</style>
