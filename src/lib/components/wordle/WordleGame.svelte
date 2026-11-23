<!--
	Mode-agnostic Wordle game: renders the board + keyboard and handles input.
	Guess evaluation is delegated to `onGuess`, so the same component works for
	multiplayer (server-evaluated) or solo (evaluate locally with `evaluateGuess`).
	Re-mount it (e.g. `{#key gameId}`) to start a new game.
-->
<script lang="ts">
	import { untrack } from 'svelte';
	import Board from './Board.svelte';
	import Keyboard from './Keyboard.svelte';
	import Toast from '../Toast.svelte';
	import { isSolved, keyboardStates } from '#lib/wordle/evaluate.ts';
	import { DEFAULT_MAX_GUESSES, DEFAULT_WORD_LENGTH } from '#lib/wordle/config.ts';
	import type { EvaluatedGuess, GuessHandler } from '#lib/wordle/types.ts';

	interface Props {
		onGuess: GuessHandler;
		length?: number;
		maxGuesses?: number;
		/** Guesses already made (e.g. when resuming a game). Only read on mount. */
		initialGuesses?: EvaluatedGuess[];
		/** Stop accepting input, e.g. when the game was ended externally. */
		disabled?: boolean;
		/** Called once the player solves it or runs out of guesses, after the reveal animation. */
		onFinish?: (solved: boolean, guesses: EvaluatedGuess[]) => void;
	}

	let {
		onGuess,
		length = DEFAULT_WORD_LENGTH,
		maxGuesses = DEFAULT_MAX_GUESSES,
		initialGuesses = [],
		disabled = false,
		onFinish
	}: Props = $props();

	const REVEAL_MS = $derived(250 * length + 250);

	let guesses = $state<EvaluatedGuess[]>(untrack(() => [...initialGuesses]));
	let current = $state('');
	let busy = $state(false);
	let revealRow = $state(-1);
	let shakeRow = $state(-1);
	/** Keyboard colours lag behind until the tiles finish flipping. */
	let revealedCount = $state(untrack(() => initialGuesses.length));
	let toast = $state<string | null>(null);
	let toastTimer: ReturnType<typeof setTimeout>;

	const solved = $derived(guesses.length > 0 && isSolved(guesses[guesses.length - 1].result));
	const over = $derived(solved || guesses.length >= maxGuesses);
	const locked = $derived(disabled || busy || over);
	const keyStates = $derived(keyboardStates(guesses.slice(0, revealedCount)));

	function showToast(message: string, ms = 1500) {
		clearTimeout(toastTimer);
		toast = message;
		toastTimer = setTimeout(() => (toast = null), ms);
	}

	function reject(message: string) {
		showToast(message);
		shakeRow = guesses.length;
		setTimeout(() => (shakeRow = -1), 400);
	}

	async function submit() {
		if (current.length < length) return reject('Not enough letters');

		busy = true;
		const word = current;
		const res = await onGuess(word);
		busy = false;
		if (!res.ok) return reject(res.error);

		guesses.push({ word, result: res.result });
		current = '';
		revealRow = guesses.length - 1;

		setTimeout(() => {
			revealedCount = guesses.length;
			if (over) onFinish?.(solved, guesses);
		}, REVEAL_MS);
	}

	export function handleKey(key: string) {
		if (locked) return;
		if (key === 'enter') submit();
		else if (key === 'backspace') current = current.slice(0, -1);
		else if (/^[a-z]$/.test(key) && current.length < length) current += key;
	}

	function onkeydown(e: KeyboardEvent) {
		if (disabled || over || e.ctrlKey || e.metaKey || e.altKey) return;
		if (e.target instanceof Element && e.target.closest('input, textarea, [contenteditable]')) return;

		const key = e.key.toLowerCase();
		if (key === 'enter' || key === 'backspace' || /^[a-z]$/.test(key)) {
			e.preventDefault();
			// Keep Enter from also "clicking" a focused on-screen key.
			(document.activeElement as HTMLElement | null)?.blur();
			handleKey(key);
		}
	}
</script>

<svelte:window {onkeydown} />

<div class="game">
	<Toast message={toast} />
	<Board {length} {maxGuesses} {guesses} {current} {revealRow} {shakeRow} />
	<Keyboard states={keyStates} onKey={handleKey} disabled={disabled || over} />
</div>

<style>
	.game {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
</style>
