<script lang="ts">
	import type { LetterState } from '#lib/wordle/types.ts';

	interface Props {
		states: Record<string, LetterState>;
		onKey: (key: string) => void;
		disabled?: boolean;
	}

	let { states, onKey, disabled = false }: Props = $props();

	const rows = [
		['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
		['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
		['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
	];
</script>

<div class="keyboard" aria-label="Keyboard">
	{#each rows as row, i (i)}
		<div class="row">
			{#if i === 1}<span class="spacer"></span>{/if}
			{#each row as key (key)}
				<button
					type="button"
					class="key {states[key] ?? ''}"
					class:wide={key.length > 1}
					{disabled}
					onclick={() => onKey(key)}
					aria-label={key}
				>
					{#if key === 'backspace'}
						<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
							<path
								fill="currentColor"
								d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"
							/>
						</svg>
					{:else}
						{key}
					{/if}
				</button>
			{/each}
			{#if i === 1}<span class="spacer"></span>{/if}
		</div>
	{/each}
</div>

<style>
	.keyboard {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 0 8px 8px;
		user-select: none;
	}

	.row {
		display: flex;
		gap: 6px;
	}

	.spacer {
		flex: 0.5;
	}

	.key {
		flex: 1;
		height: 58px;
		padding: 0;
		border: 0;
		border-radius: 4px;
		background: var(--key-bg);
		color: var(--text);
		font: inherit;
		font-size: 1.25rem;
		font-weight: 700;
		text-transform: uppercase;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.wide {
		flex: 1.5;
		font-size: 0.75rem;
	}

	.key:disabled {
		cursor: default;
	}

	.correct,
	.present,
	.absent {
		color: #fff;
	}
	.correct {
		background: var(--correct);
	}
	.present {
		background: var(--present);
	}
	.absent {
		background: var(--absent);
	}

	@media (max-height: 640px) {
		.key {
			height: 48px;
		}
	}
</style>
