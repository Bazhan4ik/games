<script lang="ts">
	import Tile from './Tile.svelte';
	import type { EvaluatedGuess } from '#lib/wordle/types.ts';

	interface Props {
		length: number;
		maxGuesses: number;
		guesses: EvaluatedGuess[];
		current?: string;
		/** Index of the row that should flip-reveal (the guess just submitted). */
		revealRow?: number;
		/** Index of the row to shake (invalid guess). */
		shakeRow?: number;
	}

	let { length, maxGuesses, guesses, current = '', revealRow = -1, shakeRow = -1 }: Props = $props();

	const FLIP_STAGGER = 250;
</script>

<div class="board-wrap">
	<div class="board" style:--cols={length} style:--rows={maxGuesses}>
		{#each { length: maxGuesses }, row (row)}
			{@const guess = guesses[row]}
			{@const letters = guess ? guess.word : row === guesses.length ? current : ''}
			<div class="row" class:shake={row === shakeRow}>
				{#each { length }, col (col)}
					<Tile
						letter={letters[col]}
						state={guess?.result[col]}
						animate={row === revealRow}
						delay={col * FLIP_STAGGER}
					/>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.board-wrap {
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		container-type: size;
		padding: 8px 0;
	}

	.board {
		--gap: 5px;
		display: grid;
		grid-template-rows: repeat(var(--rows), 1fr);
		gap: var(--gap);
		/* Fit the grid into the available space whichever dimension is the constraint. */
		width: min(100cqw, calc(100cqh * var(--cols) / var(--rows)), calc(var(--cols) * 62px));
		--tile-font: calc(min(100cqw, calc(100cqh * var(--cols) / var(--rows)), calc(var(--cols) * 62px)) / var(--cols) * 0.5);
	}

	.row {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		gap: var(--gap);
	}

	.shake {
		animation: shake 400ms;
	}

	@keyframes shake {
		10%, 90% { transform: translateX(-1px); }
		20%, 80% { transform: translateX(2px); }
		30%, 50%, 70% { transform: translateX(-4px); }
		40%, 60% { transform: translateX(4px); }
	}
</style>
