<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import DrawCanvas from '#lib/components/pictionary/DrawCanvas.svelte';
	import Drawing from '#lib/components/pictionary/Drawing.svelte';
	import StreakStats from '#lib/components/StreakStats.svelte';
	import { encodeStrokes, type Stroke } from '#lib/pictionary/strokes.ts';
	import { REACTIONS, type Reaction } from '#lib/pictionary/types.ts';
	import { opponentOf } from '#lib/players.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const today = $derived(data.today);
	const opponent = $derived(opponentOf(data.player));

	let strokes = $state<Stroke[]>([]);
	let submitting = $state(false);

	// Waiting on the opponent's drawing or reaction: check back now and then.
	onMount(() => {
		const timer = setInterval(() => {
			const waiting = today.mine && (!today.theirs || !today.mine.reaction);
			if (waiting && document.visibilityState === 'visible') invalidate('app:pictionary');
		}, 10_000);
		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<title>Pictionary · B vs S</title>
</svelte:head>

{#snippet reactionBadge(reaction: Reaction | null)}
	<p class="received">{reaction ? REACTIONS[reaction] : ' '}</p>
{/snippet}

{#if !today.mine}
	<div class="fill draw">
		<p class="word">{today.word}</p>
		<div class="canvas">
			<DrawCanvas bind:strokes />
		</div>
		<form
			method="POST"
			action="?/draw"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<input type="hidden" name="day" value={today.day} />
			<input type="hidden" name="strokes" value={encodeStrokes(strokes)} />
			<button type="button" class="undo" disabled={!strokes.length} onclick={() => (strokes = strokes.slice(0, -1))}>
				Undo
			</button>
			<button class="submit" disabled={!strokes.length || submitting}>Submit</button>
		</form>
		{#if form?.error}<p class="error">{form.error}</p>{/if}
	</div>
{:else}
	<div class="done">
		<p class="word">{today.word}</p>
		<div class="drawings">
			<section>
				<h2>{data.player}</h2>
				<Drawing strokes={today.mine.strokes} label="Your drawing" />
				{@render reactionBadge(today.mine.reaction)}
			</section>
			<section>
				<h2>{opponent}</h2>
				{#if today.theirs}
					<Drawing strokes={today.theirs.strokes} label="{opponent}'s drawing" />
					<form method="POST" action="?/react" use:enhance class="reactions">
						{#each Object.entries(REACTIONS) as [key, emoji] (key)}
							<button name="reaction" value={key} class:picked={today.theirs.reaction === key} aria-label={key}>
								{emoji}
							</button>
						{/each}
					</form>
				{:else}
					<div class="pending">Waiting for {opponent}…</div>
				{/if}
			</section>
		</div>
		{#if form?.error}<p class="error">{form.error}</p>{/if}
		<StreakStats streak={data.streak} />
	</div>
{/if}

<style>
	.fill {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.draw {
		padding: 16px;
		gap: 16px;
	}
	.word {
		margin: 0;
		text-align: center;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	/* The canvas is the largest square that fits the remaining space. */
	.canvas {
		flex: 1;
		min-height: 0;
		container-type: size;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.canvas > :global(canvas) {
		width: min(100cqw, 100cqh);
	}
	.draw form {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 16px;
	}
	button {
		font: inherit;
		cursor: pointer;
		touch-action: manipulation;
	}
	button:disabled {
		cursor: default;
		opacity: 0.4;
	}
	.undo {
		padding: 14px 16px;
		border: 0;
		background: none;
		color: var(--muted);
		font-weight: 700;
	}
	.submit {
		padding: 14px 40px;
		border: 0;
		border-radius: 28px;
		background: var(--correct);
		color: #fff;
		font-size: 1.1rem;
		font-weight: 700;
	}
	.done {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 32px 16px;
	}
	.drawings {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	h2 {
		margin: 0 0 8px;
		text-align: center;
		font-size: 1.25rem;
	}
	.pending {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1;
		border: 1px dashed var(--tile-border-filled);
		border-radius: 4px;
		color: var(--muted);
		font-size: 0.9rem;
	}
	.received {
		margin: 8px 0 0;
		text-align: center;
		font-size: 1.75rem;
		line-height: 44px;
	}
	.reactions {
		display: flex;
		justify-content: center;
		gap: 4px;
		margin-top: 8px;
	}
	.reactions button {
		width: 44px;
		height: 44px;
		border: 2px solid transparent;
		border-radius: 50%;
		background: none;
		font-size: 1.5rem;
		filter: grayscale(1);
		opacity: 0.6;
	}
	.reactions button.picked,
	.reactions button:hover {
		filter: none;
		opacity: 1;
	}
	.reactions button.picked {
		border-color: var(--tile-border-filled);
	}
	.error {
		margin: 0;
		color: var(--lost);
		font-size: 0.85rem;
		text-align: center;
	}
</style>
