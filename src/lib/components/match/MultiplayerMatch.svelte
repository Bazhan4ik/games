<!-- A two-player match: the shared WordleGame plus opponent progress and the result banner. -->
<script lang="ts">
	import WordleGame from '../wordle/WordleGame.svelte';
	import MiniBoard from '../wordle/MiniBoard.svelte';
	import type { Player } from '#lib/players.ts';
	import type { GuessHandler } from '#lib/wordle/types.ts';
	import type { MatchView } from '#lib/multiplayer/types.ts';

	interface Props {
		match: MatchView;
		me: Player;
		opponent: Player;
		onGuess: GuessHandler;
		onHome: () => void;
		/** Daily streak to show on the result card. */
		streak?: number;
	}

	let { match, me, opponent, onGuess, onHome, streak }: Props = $props();

	const finished = $derived(match.status === 'finished');
	const iAmDone = $derived(
		match.myGuesses.length >= match.maxGuesses ||
			match.myGuesses.at(-1)?.result.every((s) => s === 'correct')
	);
</script>

<div class="match">
	<div class="status">
		<div class="me">
			{#if finished}
				&nbsp;
			{:else if match.cancelsInSec !== null}
				<span class="away">{opponent} left — match cancels in {match.cancelsInSec}s</span>
			{:else if iAmDone}
				Out of guesses — waiting for {opponent}
			{:else if match.opponentDone}
				{opponent} ran out of guesses!
			{:else}
				First to solve wins
			{/if}
		</div>
		<div class="opponent">
			<span>{opponent}</span>
			<MiniBoard results={match.opponentResults} length={match.length} maxGuesses={match.maxGuesses} />
		</div>
	</div>

	{#key match.id}
		<WordleGame
			{onGuess}
			length={match.length}
			maxGuesses={match.maxGuesses}
			initialGuesses={match.myGuesses}
			disabled={finished}
		/>
	{/key}

	{#if finished}
		<div class="result" role="dialog" aria-label="Match result">
			<p class="headline">
				{#if match.winner === me}
					You won!
				{:else if match.winner}
					{match.winner} won
				{:else}
					Nobody got it
				{/if}
			</p>
			<p class="word">{match.word}</p>
			{#if streak}
				<p class="streak">Day streak: <strong>{streak}</strong></p>
			{/if}
			<button onclick={onHome}>Back to home</button>
		</div>
	{/if}
</div>

<style>
	.match {
		position: relative;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 16px 0;
		font-size: 0.85rem;
		color: var(--muted);
	}
	.away {
		color: var(--lost);
		font-weight: 700;
	}
	.opponent {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 700;
		color: var(--text);
	}
	.result {
		position: absolute;
		top: 30%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 5;
		min-width: 220px;
		padding: 24px;
		border-radius: 8px;
		background: var(--bg);
		box-shadow: 0 4px 23px rgba(0, 0, 0, 0.2);
		text-align: center;
		/* Let the final row finish flipping first. */
		animation: appear 250ms ease-out 1.5s both;
	}
	.headline {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
	}
	.word {
		margin: 8px 0 20px;
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}
	.word:has(+ .streak) {
		margin-bottom: 8px;
	}
	.streak {
		margin: 0 0 20px;
		font-size: 0.9rem;
		color: var(--muted);
	}
	.streak strong {
		color: var(--text);
	}
	button {
		padding: 12px 28px;
		border: 0;
		border-radius: 24px;
		background: var(--correct);
		color: #fff;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
		touch-action: manipulation;
	}
	@keyframes appear {
		from {
			opacity: 0;
			transform: translate(-50%, -40%);
		}
	}
</style>
