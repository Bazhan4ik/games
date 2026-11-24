<!-- Read-only board of past guesses, sized to its container (e.g. for match history). -->
<script lang="ts">
	import Tile from './Tile.svelte';
	import type { EvaluatedGuess } from '#lib/wordle/types.ts';

	interface Props {
		guesses: EvaluatedGuess[];
		length: number;
		maxGuesses: number;
	}

	let { guesses, length, maxGuesses }: Props = $props();
</script>

<div class="wrap">
	<div class="grid" style:--cols={length}>
		{#each { length: maxGuesses }, row (row)}
			{#each { length }, col (col)}
				<Tile letter={guesses[row]?.word[col]} state={guesses[row]?.result[col]} />
			{/each}
		{/each}
	</div>
</div>

<style>
	.wrap {
		container-type: inline-size;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		gap: 4px;
		max-width: calc(var(--cols) * 52px);
		margin: 0 auto;
		--tile-font: min(1.6rem, calc(100cqw / var(--cols) * 0.5));
	}
</style>
