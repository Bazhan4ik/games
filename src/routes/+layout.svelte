<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Wordle · B vs S</title>
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

{@render children()}

<style>
	:global(:root) {
		color-scheme: light;
		--bg: #ffffff;
		--text: #1a1a1b;
		--muted: #787c7e;
		--correct: #6aaa64;
		--present: #c9b458;
		--absent: #787c7e;
		--lost: #d9534f;
		--key-bg: #d3d6da;
		--tile-border: #d3d6da;
		--tile-border-filled: #878a8c;
	}
	:global(html, body) {
		margin: 0;
		background: var(--bg);
		color: var(--text);
		font-family: 'Helvetica Neue', Arial, sans-serif;
		-webkit-text-size-adjust: 100%;
	}
</style>
