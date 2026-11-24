<script lang="ts">
	import Flame from './Flame.svelte';
	import type { Streak } from '#lib/multiplayer/types.ts';

	let { streak }: { streak: Streak } = $props();
</script>

<section
	aria-label="Day streak {streak.current}{streak.playedToday ? ', played today' : ', no game finished today yet'}"
>
	<div class="row">
		<Flame lit={streak.playedToday} size={36} />
		<span class="value">{streak.current}</span>
	</div>
	<span class="label">Day streak</span>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 16px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.value {
		font-size: 2.25rem;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
	}
	.label {
		margin-top: 2px;
		font-size: 0.75rem;
		color: var(--muted);
	}
</style>
