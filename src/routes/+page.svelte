<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import PlayerPicker from '#lib/components/match/PlayerPicker.svelte';
	import WaitingRoom from '#lib/components/match/WaitingRoom.svelte';
	import MultiplayerMatch from '#lib/components/match/MultiplayerMatch.svelte';
	import MatchHistory from '#lib/components/match/MatchHistory.svelte';
	import StreakStats from '#lib/components/match/StreakStats.svelte';
	import { MultiplayerSession } from '#lib/multiplayer/session.svelte.ts';
	import { opponentOf } from '#lib/players.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const session = new MultiplayerSession();
	const state = $derived(session.state);
	const inMatch = $derived(state?.phase === 'playing' || state?.phase === 'result');

	onMount(() => () => session.stop());

	// Start polling once a player is known (also right after picking one).
	$effect(() => {
		if (data.player) session.start();
	});

	// Refresh the match list whenever a match ends.
	let lastPhase: string | undefined;
	$effect(() => {
		const phase = state?.phase;
		if (phase === 'result' && lastPhase === 'playing') invalidate('app:history');
		lastPhase = phase;
	});
</script>

<div class="app" class:fill={inMatch}>
	<header>
		<h1>Wordle</h1>
		{#if data.player}
			<span class="me">You are <strong>{data.player}</strong></span>
		{/if}
	</header>

	{#if !data.player}
		<PlayerPicker />
	{:else}
		{@const me = data.player}
		{@const opponent = opponentOf(me)}

		{#if session.error}
			<p class="error">{session.error}</p>
		{/if}

		{#if state && (state.phase === 'playing' || state.phase === 'result')}
			<MultiplayerMatch
				match={state.match}
				{me}
				{opponent}
				onGuess={session.submitGuess}
				onPlayAgain={session.playAgain}
				streak={data.streak?.current}
			/>
		{:else}
			<WaitingRoom
				{opponent}
				opponentOnline={state?.phase === 'waiting' && state.opponentOnline}
				opponentReady={state?.phase === 'waiting' && state.opponentReady}
				cancelled={session.cancelled}
			/>
			{#if data.streak}
				<StreakStats streak={data.streak} />
			{/if}
			<MatchHistory history={data.history} />
		{/if}
	{/if}
</div>

<style>
	.app {
		max-width: 500px;
		margin: 0 auto;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}
	.app.fill {
		height: 100dvh;
		overflow: hidden;
	}
	header {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 52px;
		flex-shrink: 0;
		border-bottom: 1px solid var(--tile-border);
	}
	h1 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.75rem;
		letter-spacing: 0.02em;
	}
	.me {
		position: absolute;
		right: 16px;
		font-size: 0.8rem;
		color: var(--muted);
	}
	.me strong {
		color: var(--text);
	}
	.error {
		margin: 8px 16px 0;
		color: var(--lost);
		font-size: 0.85rem;
		text-align: center;
	}
	@media (max-width: 380px) {
		header {
			justify-content: flex-start;
			padding-left: 16px;
		}
	}
</style>
