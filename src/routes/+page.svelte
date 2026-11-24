<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import PlayerPicker from '#lib/components/match/PlayerPicker.svelte';
	import EnterMatch from '#lib/components/match/EnterMatch.svelte';
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

<svelte:head>
	<title>Wordle · B vs S</title>
</svelte:head>

{#if !data.player}
	<PlayerPicker />
{:else}
	{@const me = data.player}
	{@const opponent = opponentOf(me)}

	{#if session.error}
		<p class="error">{session.error}</p>
	{/if}

	{#if state && (state.phase === 'playing' || state.phase === 'result')}
		<div class="fill">
			<MultiplayerMatch
				match={state.match}
				{me}
				{opponent}
				onGuess={session.submitGuess}
				onHome={session.goHome}
				streak={data.streak?.current}
			/>
		</div>
	{:else}
		<div class="home">
			<div class="action">
				{#if session.cancelled}
					<p class="cancelled">Match cancelled — a player was away for over a minute.</p>
				{/if}
				{#if state?.phase === 'queued'}
					<WaitingRoom {opponent} opponentOnline={state.opponentOnline} onCancel={session.leaveQueue} />
				{:else}
					<EnterMatch
						{opponent}
						opponentQueued={state?.phase === 'home' && state.opponentQueued}
						onEnter={session.enterQueue}
					/>
				{/if}
			</div>
			<div class="stats">
				{#if data.streak}
					<StreakStats streak={data.streak} />
				{/if}
				<MatchHistory history={data.history} />
			</div>
		</div>
	{/if}
{/if}

<style>
	.fill {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.home {
		display: flex;
		flex-direction: column;
		gap: 56px;
		padding: 56px 0 32px;
	}
	/* Fixed height so swapping the button for the loader doesn't shift the page. */
	.action {
		min-height: 124px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.stats {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}
	.cancelled {
		margin: 0 16px 24px;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--lost);
		text-align: center;
	}
	.error {
		margin: 8px 16px 0;
		color: var(--lost);
		font-size: 0.85rem;
		text-align: center;
	}
</style>
