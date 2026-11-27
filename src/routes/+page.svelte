<script lang="ts">
	import PlayerPicker from '#lib/components/match/PlayerPicker.svelte';
	import Flame from '#lib/components/Flame.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>B vs S</title>
</svelte:head>

{#if !data.player || !data.streaks}
	<PlayerPicker />
{:else}
	<nav aria-label="Games">
		{#each [{ href: '/wordle', name: 'Wordle', streak: data.streaks.wordle }, { href: '/pictionary', name: 'Pictionary', streak: data.streaks.pictionary }] as game (game.href)}
			<a href={game.href}>
				<span class="name">{game.name}</span>
				<span class="streak" aria-label="Day streak {game.streak.current}">
					<Flame lit={game.streak.playedToday} size={22} />
					{game.streak.current}
				</span>
			</a>
		{/each}
	</nav>
{/if}

<style>
	nav {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 56px 16px 32px;
	}
	a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px;
		border: 2px solid var(--tile-border-filled);
		border-radius: 8px;
		color: inherit;
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
	}
	a:hover,
	a:focus-visible {
		background: #f6f7f8;
	}
	.name {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.75rem;
		font-weight: 700;
	}
	.streak {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 1.25rem;
		font-variant-numeric: tabular-nums;
	}
</style>
