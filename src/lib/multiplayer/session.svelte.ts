import type { GuessHandler } from '#lib/wordle/types.ts';
import type { LobbyState } from './types.ts';

const POLL_MS = 1500;

const postJson = (url: string, body: unknown, init?: RequestInit) =>
	fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
		...init
	});

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
	/** Poll responses from requests sent before the latest user action are stale and dropped. */
	#requestSeq = 0;
	#minSeq = 0;

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
		// Navigating away (e.g. to a match's details) shouldn't leave us matchable.
		if (this.state?.phase === 'queued') postJson('/api/queue', { queued: false }, { keepalive: true });
	}

	/** Fetch the latest state now instead of waiting for the next poll. */
	refresh = async () => {
		const seq = ++this.#requestSeq;
		try {
			const res = await fetch(`/api/state${this.#entering ? '?enter' : ''}`);
			if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? res.statusText);
			this.#entering = false;
			const next: LobbyState = await res.json();
			if (seq < this.#minSeq) return;

			if (next.phase === 'playing' || next.phase === 'result') this.cancelled = false;
			else if (this.state?.phase === 'playing') this.cancelled = true;
			this.state = next;
			this.error = null;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Connection problem';
		}
	};

	/** "Enter match": join matchmaking. */
	enterQueue = () => this.#act({ phase: 'queued', opponentOnline: false }, () => postJson('/api/queue', { queued: true }));

	/** Leave matchmaking and return to the home page. */
	leaveQueue = () => this.#act({ phase: 'home', opponentQueued: false }, () => postJson('/api/queue', { queued: false }));

	/** Dismiss the result card and return to the home page. */
	goHome = () => {
		if (this.state?.phase !== 'result') return;
		const matchId = this.state.match.id;
		return this.#act({ phase: 'home', opponentQueued: false }, () => postJson('/api/ack', { matchId }));
	};

	submitGuess: GuessHandler = async (word) => {
		const matchId = this.state?.phase === 'playing' ? this.state.match.id : null;
		if (!matchId) return { ok: false, error: 'No active match' };
		try {
			const res = await postJson('/api/guess', { matchId, word });
			if (!res.ok) return { ok: false, error: 'Something went wrong' };
			return await res.json();
		} catch {
			return { ok: false, error: 'Connection problem' };
		} finally {
			this.refresh();
		}
	};

	/** Show the expected state immediately, tell the server, then sync. */
	async #act(optimistic: LobbyState, request: () => Promise<Response>) {
		this.#minSeq = this.#requestSeq + 1;
		this.cancelled = false;
		this.state = optimistic;
		try {
			await request();
		} catch {
			this.error = 'Connection problem';
		}
		// Polls sent while the request was in flight may predate it too.
		this.#minSeq = this.#requestSeq + 1;
		await this.refresh();
	}

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
