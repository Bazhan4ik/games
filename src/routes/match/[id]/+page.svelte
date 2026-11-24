<script lang="ts">
	import GuessGrid from '#lib/components/wordle/GuessGrid.svelte';
	import { PLAYERS } from '#lib/players.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const match = $derived(data.match);

	const finishedAt = $derived(
		new Date(match.finishedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
	);

	function outcome(player: string) {
		if (!match.winner) return 'draw';
		return match.winner === player ? 'won' : 'lost';
	}
</script>

<svelte:head>
	<title>{match.word.toUpperCase()} · Wordle · B vs S</title>
</svelte:head>

<div class="detail">
	<a class="back" href="/">‹ Back</a>

	<div class="summary">
		<p class="headline">
			{#if match.winner}{match.winner} won{:else}Nobody got it{/if}
		</p>
		<p class="word">{match.word}</p>
		<p class="date">{finishedAt}</p>
	</div>

	<div class="boards">
		{#each PLAYERS as player (player)}
			{@const guesses = match.guesses[player]}
			<section aria-label="{player}'s guesses">
				<h2 class={outcome(player)}>
					{player}
					<span class="count">{guesses.length}/{match.maxGuesses}</span>
				</h2>
				<GuessGrid {guesses} length={match.length} maxGuesses={match.maxGuesses} />
			</section>
		{/each}
	</div>
</div>

<style>
	.detail {
		padding: 16px 16px 40px;
	}
	.back {
		display: inline-block;
		padding: 4px 0;
		color: var(--muted);
		font-size: 0.95rem;
		text-decoration: none;
	}
	.back:hover {
		color: var(--text);
	}
	.summary {
		margin: 24px 0 32px;
		text-align: center;
	}
	.headline {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}
	.word {
		margin: 8px 0 0;
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}
	.date {
		margin: 6px 0 0;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.boards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	h2 {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 8px;
		margin: 0 0 12px;
		font-size: 1.25rem;
	}
	.won {
		color: var(--correct);
	}
	.lost {
		color: var(--lost);
	}
	.draw {
		color: var(--muted);
	}
	.count {
		font-size: 0.85rem;
		font-weight: 400;
		color: var(--muted);
	}
</style>
