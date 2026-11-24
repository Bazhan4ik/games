<script lang="ts">
	import { PLAYERS } from '#lib/players.ts';
	import type { MatchSummary } from '#lib/multiplayer/types.ts';

	let { history }: { history: MatchSummary[] } = $props();

	const wins = $derived(
		Object.fromEntries(PLAYERS.map((p) => [p, history.filter((m) => m.winner === p).length]))
	);
</script>

<section>
	<h3>Previous matches</h3>
	{#if history.length === 0}
		<p class="empty">No matches yet.</p>
	{:else}
		<p class="tally">
			{#each PLAYERS as p, i (p)}{#if i > 0}<span class="dash">–</span>{/if}{p} {wins[p]}{/each}
		</p>
		<ol>
			{#each history as m (m.id)}
				<li>
					<a href="/match/{m.id}">
						{#if m.winner && m.loser}
							<span class="won">{m.winner}</span>
							<span class="lost">{m.loser}</span>
						{:else}
							<span class="draw">{PLAYERS[0]}</span>
							<span class="draw">{PLAYERS[1]}</span>
						{/if}
						<span class="word">{m.word}</span>
						<span class="chevron" aria-hidden="true">›</span>
					</a>
				</li>
			{/each}
		</ol>
	{/if}
</section>

<style>
	section {
		padding: 0 16px;
	}
	h3 {
		margin: 0 0 8px;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.tally {
		margin: 0 0 12px;
		font-weight: 700;
	}
	.dash {
		margin: 0 8px;
		color: var(--muted);
	}
	.empty {
		color: var(--muted);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		border-bottom: 1px solid var(--tile-border);
	}
	a {
		display: grid;
		grid-template-columns: 3rem 3rem 1fr auto;
		align-items: center;
		padding: 10px 4px;
		color: inherit;
		font-weight: 700;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	a:hover,
	a:focus-visible {
		background: #f6f7f8;
	}
	.chevron {
		color: var(--muted);
		font-size: 1.25rem;
		line-height: 1;
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
	.word {
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
</style>
