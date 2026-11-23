<script lang="ts">
	import type { LetterState } from '#lib/wordle/types.ts';

	interface Props {
		letter?: string;
		state?: LetterState;
		/** Flip into its colour (with `delay` ms stagger) instead of appearing coloured immediately. */
		animate?: boolean;
		delay?: number;
	}

	let { letter = '', state, animate = false, delay = 0 }: Props = $props();
</script>

<div
	class="tile {state ?? ''}"
	class:filled={!!letter}
	class:flip={animate && !!state}
	style:--delay="{delay}ms"
	aria-label={state ? `${letter} ${state}` : letter}
>
	{letter}
</div>

<style>
	.tile {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1;
		width: 100%;
		box-sizing: border-box;
		border: 2px solid var(--tile-border);
		background: var(--bg);
		color: var(--text);
		font-size: var(--tile-font, 2rem);
		font-weight: 700;
		text-transform: uppercase;
		user-select: none;
	}

	.filled {
		border-color: var(--tile-border-filled);
		animation: pop 100ms ease-out;
	}

	.correct,
	.present,
	.absent {
		--color: var(--absent);
		background: var(--color);
		border-color: var(--color);
		color: #fff;
		animation: none;
	}
	.correct {
		--color: var(--correct);
	}
	.present {
		--color: var(--present);
	}

	.flip {
		animation: flip 500ms ease-in-out var(--delay) both;
	}

	@keyframes pop {
		50% {
			transform: scale(1.1);
		}
	}

	@keyframes flip {
		0% {
			transform: rotateX(0);
			background: var(--bg);
			border-color: var(--tile-border-filled);
			color: var(--text);
		}
		49.9% {
			background: var(--bg);
			border-color: var(--tile-border-filled);
			color: var(--text);
		}
		50% {
			transform: rotateX(-90deg);
			background: var(--color);
			border-color: var(--color);
			color: #fff;
		}
		100% {
			transform: rotateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.filled,
		.flip {
			animation: none;
		}
	}
</style>
