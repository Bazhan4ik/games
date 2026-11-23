<script lang="ts">
	import { enhance } from '$app/forms';
	import { PLAYERS } from '#lib/players.ts';
</script>

<div class="picker">
	<h2>Who are you?</h2>
	<p>This device will remember you.</p>
	<form method="POST" action="?/pick" use:enhance>
		{#each PLAYERS as player (player)}
			<button name="player" value={player}>{player}</button>
		{/each}
	</form>
</div>

<style>
	.picker {
		text-align: center;
		padding: 48px 16px;
	}
	h2 {
		margin: 0 0 8px;
	}
	p {
		margin: 0 0 32px;
		color: var(--muted);
	}
	form {
		display: flex;
		gap: 16px;
		justify-content: center;
	}
	button {
		width: 112px;
		height: 112px;
		border: 2px solid var(--tile-border-filled);
		border-radius: 8px;
		background: var(--bg);
		color: var(--text);
		font: inherit;
		font-size: 3rem;
		font-weight: 700;
		cursor: pointer;
		touch-action: manipulation;
	}
	button:hover,
	button:focus-visible {
		background: var(--key-bg);
	}
</style>
