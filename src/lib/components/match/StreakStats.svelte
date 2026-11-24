<script lang="ts">
	import type { Streak } from '#lib/multiplayer/types.ts';

	let { streak }: { streak: Streak } = $props();
</script>

<section aria-label="Daily streak">
	<div class="stat">
		<span class="value">{streak.current}</span>
		<span class="label">Day streak</span>
	</div>
	<div class="stat">
		<span class="value">{streak.best}</span>
		<span class="label">Best streak</span>
	</div>
</section>

<style>
	section {
		display: flex;
		justify-content: center;
		gap: 32px;
		padding: 0 16px 28px;
	}
	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 72px;
	}
	.value {
		font-size: 2.25rem;
		font-weight: 400;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}
	.label {
		font-size: 0.75rem;
		color: var(--muted);
	}
</style>
