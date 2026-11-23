<!-- Tiny colour-only board, e.g. to show an opponent's progress without revealing letters. -->
<script lang="ts">
	import type { LetterState } from '#lib/wordle/types.ts';

	interface Props {
		results: LetterState[][];
		length: number;
		maxGuesses: number;
	}

	let { results, length, maxGuesses }: Props = $props();
</script>

<div class="mini" style:--cols={length} aria-label="{results.length} of {maxGuesses} guesses used">
	{#each { length: maxGuesses }, row (row)}
		{#each { length }, col (col)}
			<span class="cell {results[row]?.[col] ?? ''}"></span>
		{/each}
	{/each}
</div>

<style>
	.mini {
		display: grid;
		grid-template-columns: repeat(var(--cols), 8px);
		gap: 2px;
	}
	.cell {
		width: 8px;
		height: 8px;
		box-sizing: border-box;
		border: 1px solid var(--tile-border);
	}
	.correct {
		background: var(--correct);
		border-color: var(--correct);
	}
	.present {
		background: var(--present);
		border-color: var(--present);
	}
	.absent {
		background: var(--absent);
		border-color: var(--absent);
	}
</style>
