<script lang="ts">
	interface Props {
		/** Orange/red when lit, grey otherwise. */
		lit: boolean;
		size?: number;
	}

	let { lit, size = 32 }: Props = $props();

	const gradientId = $props.id();
</script>

<svg class:lit viewBox="0 0 24 32" width={size * 0.75} height={size} aria-hidden="true">
	<defs>
		<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="var(--flame-top)" />
			<stop offset="1" stop-color="var(--flame-bottom)" />
		</linearGradient>
	</defs>
	<path
		fill="url(#{gradientId})"
		d="M12 31C6 31 2.5 26.5 3 21C3.5 15.5 7.5 13 8.5 7.5C10.5 9.5 11 11.5 11 13.5C13 11 14 6 12.5 1C17.5 4.5 21 11 21 19C21 26 17 31 12 31Z"
	/>
	<path
		fill="var(--flame-core)"
		d="M12 30C9 30 7 27.5 7.5 24.5C8 21.5 10.5 20 11 17C13.5 19 16.5 21.5 16.5 25C16.5 28 14.5 30 12 30Z"
	/>
</svg>

<style>
	svg {
		--flame-top: #c9cbcd;
		--flame-bottom: #b4b6b8;
		--flame-core: #dfe1e3;
		flex-shrink: 0;
	}
	.lit {
		--flame-top: #e2311d;
		--flame-bottom: #f4511e;
		--flame-core: #ff9f1c;
	}
</style>
