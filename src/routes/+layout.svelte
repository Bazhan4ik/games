<script lang="ts">
	import { page } from '$app/state';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const title = $derived(
		page.url.pathname.startsWith('/wordle')
			? 'Wordle'
			: page.url.pathname.startsWith('/pictionary')
				? 'Pictionary'
				: 'B vs S'
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>B vs S</title>
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

<div class="shell">
	<header>
		<a href="/"><h1>{title}</h1></a>
	</header>
	{@render children()}
</div>

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

	.shell {
		max-width: 500px;
		margin: 0 auto;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}
	/* During a match (or while drawing) the game fills the screen exactly, with no page scroll. */
	.shell:has(:global(.fill)) {
		height: 100dvh;
		overflow: hidden;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 52px;
		flex-shrink: 0;
		border-bottom: 1px solid var(--tile-border);
	}
	header a {
		color: inherit;
		text-decoration: none;
	}
	h1 {
		margin: 0;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.75rem;
		letter-spacing: 0.02em;
	}
</style>
