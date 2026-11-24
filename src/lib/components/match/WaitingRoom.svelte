<script lang="ts">
	interface Props {
		opponent: string;
		opponentOnline: boolean;
		onCancel: () => void;
	}

	let { opponent, opponentOnline, onCancel }: Props = $props();
</script>

<div class="waiting">
	<div class="dots" aria-hidden="true"><span></span><span></span><span></span></div>
	<p role="status">
		{#if opponentOnline}
			Waiting for <strong>{opponent}</strong> to enter the match…
		{:else}
			Waiting for <strong>{opponent}</strong> to join…
		{/if}
	</p>
	<button onclick={onCancel}>Cancel</button>
</div>

<style>
	.waiting {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		text-align: center;
		padding: 0 16px;
	}
	p {
		margin: 0;
		font-size: 1.1rem;
	}
	button {
		padding: 4px 8px;
		border: 0;
		background: none;
		color: var(--muted);
		font: inherit;
		font-size: 0.9rem;
		text-decoration: underline;
		cursor: pointer;
	}
	.dots {
		display: inline-flex;
		gap: 6px;
	}
	.dots span {
		width: 16px;
		height: 16px;
		background: var(--tile-border);
		animation: blink 1.2s infinite;
	}
	.dots span:nth-child(1) {
		background: var(--correct);
	}
	.dots span:nth-child(2) {
		background: var(--present);
		animation-delay: 0.2s;
	}
	.dots span:nth-child(3) {
		background: var(--absent);
		animation-delay: 0.4s;
	}
	@keyframes blink {
		0%, 100% { opacity: 0.25; }
		50% { opacity: 1; }
	}
</style>
