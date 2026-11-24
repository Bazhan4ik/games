# Wordle — B vs S

Two-player race Wordle. Both players get the same word; first to solve it wins.

## Setup

```sh
nvm use            # Node 24 (SvelteKit 3 needs >= 22.17)
npm install
cp .env.example .env   # then fill in MONGODB_URI
npm run dev
```

### MongoDB

Set `MONGODB_URI` (and optionally `MONGODB_DB`, default `wordle`, and `STREAK_TIMEZONE`, default `America/Toronto`). Collections and indexes are created automatically on first request:

- `matches` — one document per match (answer, both players' guesses, winner). A unique partial index ensures only one active match exists at a time; a TTL index removes abandoned ones.
- `presence` — last heartbeat per player, used for matchmaking.
- `stats` — the daily streak (`current`, `lastDay`).

For MongoDB Atlas + Vercel, allow access from anywhere (`0.0.0.0/0`) under Network Access, since Vercel functions don't have fixed IPs.

### Deploying to Vercel

Import the repo in Vercel and add `MONGODB_URI` (and `MONGODB_DB` if needed) under Project → Settings → Environment Variables. The project uses `@sveltejs/adapter-vercel`; no extra config needed.

## How it works

- **Player identity**: first visit asks "B or S?" and stores it in an httpOnly cookie that expires after 7 days (it isn't refreshed, so the device picks again weekly). There's no way to switch: the server refuses a new pick while the cookie exists.
- **Matchmaking**: the home page has an "Enter match" button. Pressing it puts the player in a server-side queue (`presence.queued`, via `POST /api/queue`) and shows the loader (with Cancel). Each client polls `GET /api/state` every 1.5s (Vercel functions can't hold websockets); the poll doubles as a heartbeat. When both players are queued and online, a match is created and both leave the queue. A player on the home page sees "S is waiting for you" when the other is already queued. A fresh page load always starts on the home page, out of the queue.
- **After a match**: the result card's "Back to home" returns to the home page; entering again starts the next match.
- **Match details**: every guess of both players is stored on the match. Each row in the home page's match list links to `/match/[id]`, which shows both players' boards. Only finished matches are viewable, so the answer of a live match can't be peeked at.
- **Guesses** are validated and scored on the server (`POST /api/guess`), so the answer never reaches the browser until the match ends. The opponent's progress is shown as colours only.
- **Ending**: first correct guess wins. If both run out of guesses it's recorded as a draw (shown grey in the history).
- **Daily streak**: one shared streak — consecutive days (in `STREAK_TIMEZONE`) with at least one finished match. It only updates when a match finishes: same day → unchanged, day after the last one → +1, any gap → back to 1. Draws count; cancelled matches don't. Because it only changes on a finish, a missed day shows up as a reset the next time a match finishes. Shown in the lobby next to a flame that's grey until a match has been finished today, then orange/red; also on the result card. Logic lives in `src/lib/server/streak.ts`.
- **Abandoned matches**: each poll is also a heartbeat on the active match (`seen.B` / `seen.S`), and `expiresAt` = least-recent heartbeat + 60s. Once a player has been away for a minute (tab closed, or hidden — polling pauses while the tab is in the background), the match is deleted outright, so it never shows up in history. The remaining player sees a countdown, then a "match cancelled" notice. If both players leave, a MongoDB TTL index on `expiresAt` deletes it (Mongo's TTL sweep runs every ~60s, so it can take up to an extra minute).

## Project layout

```
src/lib/
  wordle/                 pure game logic — no UI, no server
    evaluate.ts           scoring (handles repeated letters), keyboard colours
    types.ts, config.ts
  components/wordle/      reusable, mode-agnostic UI
    WordleGame.svelte     board + keyboard + input; evaluation delegated via `onGuess`
    Board / Tile / Keyboard / MiniBoard / GuessGrid (read-only board)
  components/match/       two-player screens (picker, enter button, waiting room, match, streak, history)
  multiplayer/            client polling session + shared API types
  server/                 MongoDB, match logic, word lists, player cookie
routes/
  +layout.svelte          shared header
  +page.*                 home page (picker, Enter match, matchmaking, match, history)
  match/[id]/             one finished match: both players' guesses
  api/state|queue|guess|ack|leave
```

### Adding a solo mode

`WordleGame` doesn't know about multiplayer. A solo mode just supplies a local `onGuess`:

```svelte
<script lang="ts">
	import WordleGame from '#lib/components/wordle/WordleGame.svelte';
	import { evaluateGuess } from '#lib/wordle/evaluate.ts';

	let { answer }: { answer: string } = $props(); // e.g. from randomAnswer() in a +page.server.ts

	// Add dictionary validation by calling a small endpoint that uses isValidWord().
	const onGuess = async (word: string) => ({ ok: true as const, result: evaluateGuess(word, answer) });
</script>

<WordleGame {onGuess} length={answer.length} onFinish={(solved) => console.log(solved)} />
```

### Other word lengths

Everything (scoring, board, server validation) is length-agnostic. To add 6- or 7-letter words, create `src/lib/server/words/answers-6.ts` and register it in `src/lib/server/words/index.ts`; guess validation already covers all lengths via the dictionary. Then pass the length into `createMatch` in `src/lib/server/matches.ts` (currently `DEFAULT_WORD_LENGTH`).
