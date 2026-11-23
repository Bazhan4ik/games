<script lang="ts">
	interface Props {
		opponent: string;
		opponentOnline: boolean;
		opponentReady: boolean;
	}

	let { opponent, opponentOnline, opponentReady }: Props = $props();
</script>

<div class="waiting">
	<div class="dots" aria-hidden="true"><span></span><span></span><span></span></div>
	{#if opponentOnline && opponentReady}
		<p>{opponent} is here — starting…</p>
	{:else if opponentOnline}
		<p>Waiting for <strong>{opponent}</strong> to press Play again…</p>
	{:else}
		<p>Waiting for <strong>{opponent}</strong> to join…</p>
	{/if}
</div>

<style>
	.waiting {
		text-align: center;
		padding: 40px 16px;
	}
	p {
		margin: 16px 0 0;
		font-size: 1.1rem;
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
