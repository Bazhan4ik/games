<script lang="ts">
	interface Props {
		opponent: string;
		/** The opponent is already in matchmaking. */
		opponentQueued: boolean;
		onEnter: () => void;
	}

	let { opponent, opponentQueued, onEnter }: Props = $props();
</script>

<div class="enter">
	<button onclick={onEnter}>Enter match</button>
	<p class:ready={opponentQueued}>
		{#if opponentQueued}
			{opponent} is waiting for you
		{:else}
			&nbsp;
		{/if}
	</p>
</div>

<style>
	.enter {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	button {
		padding: 14px 40px;
		border: 0;
		border-radius: 28px;
		background: var(--correct);
		color: #fff;
		font: inherit;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		touch-action: manipulation;
	}
	button:hover {
		filter: brightness(0.95);
	}
	button:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 3px;
	}
	p {
		margin: 0;
		font-size: 0.9rem;
	}
	.ready {
		color: var(--correct);
		font-weight: 700;
	}
</style>
