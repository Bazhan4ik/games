<script lang="ts">
	let { message }: { message: string | null } = $props();
</script>

{#if message}
	<div class="toast" role="status">{message}</div>
{/if}

<style>
	.toast {
		position: fixed;
		top: 72px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		padding: 12px 16px;
		border-radius: 4px;
		background: var(--text);
		color: var(--bg);
		font-weight: 700;
		font-size: 0.9rem;
		pointer-events: none;
	}
</style>
