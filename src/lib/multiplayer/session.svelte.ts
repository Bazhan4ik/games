import type { GuessHandler } from '#lib/wordle/types.ts';
import type { LobbyState } from './types.ts';

const POLL_MS = 1500;

/**
 * Keeps the two-player lobby in sync with the server by polling.
 * (Vercel functions can't hold websockets, and polling is plenty for two people.)
 */
export class MultiplayerSession {
	state = $state<LobbyState | null>(null);
	error = $state<string | null>(null);
	/** Set when a match disappears mid-game because someone was away too long. */
	cancelled = $state(false);

	#timer: ReturnType<typeof setTimeout> | undefined;
	#running = false;
	#entering = true;

	start() {
		if (this.#running) return;
		this.#running = true;
		document.addEventListener('visibilitychange', this.#onVisibility);
		window.addEventListener('pagehide', this.#leave);
		this.#tick();
	}

	stop() {
		this.#running = false;
		clearTimeout(this.#timer);
		document.removeEventListener('visibilitychange', this.#onVisibility);
		window.removeEventListener('pagehide', this.#leave);
	}

	/** Fetch the latest state now instead of waiting for the next poll. */
	refresh = async () => {
		try {
			const res = await fetch(`/api/state${this.#entering ? '?enter' : ''}`);
			if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? res.statusText);
			this.#entering = false;
			const next: LobbyState = await res.json();
			if (next.phase !== 'waiting') this.cancelled = false;
			else if (this.state?.phase === 'playing') this.cancelled = true;
			this.state = next;
			this.error = null;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Connection problem';
		}
	};

	submitGuess: GuessHandler = async (word) => {
		const matchId = this.state?.phase === 'playing' ? this.state.match.id : null;
		if (!matchId) return { ok: false, error: 'No active match' };
		try {
			const res = await fetch('/api/guess', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ matchId, word })
			});
			if (!res.ok) return { ok: false, error: 'Something went wrong' };
			return await res.json();
		} catch {
			return { ok: false, error: 'Connection problem' };
		} finally {
			this.refresh();
		}
	};

	/** Dismiss the result screen and go back to matchmaking. */
	playAgain = async () => {
		if (this.state?.phase !== 'result') return;
		const matchId = this.state.match.id;
		this.state = { phase: 'waiting', opponentOnline: false, opponentReady: false };
		await fetch('/api/ack', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ matchId })
		});
		await this.refresh();
	};

	#tick = async () => {
		await this.refresh();
		if (this.#running && document.visibilityState !== 'hidden') {
			this.#timer = setTimeout(this.#tick, POLL_MS);
		}
	};

	#onVisibility = () => {
		clearTimeout(this.#timer);
		if (document.visibilityState === 'hidden') this.#leave();
		else if (this.#running) this.#tick();
	};

	#leave = () => {
		navigator.sendBeacon('/api/leave');
	};
}
