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

Set `MONGODB_URI` (and optionally `MONGODB_DB`, default `wordle`). Collections and indexes are created automatically on first request:

- `matches` — one document per match (answer, both players' guesses, winner). A unique partial index ensures only one active match exists at a time; a TTL index removes abandoned ones.
- `presence` — last heartbeat per player, used for matchmaking.

For MongoDB Atlas + Vercel, allow access from anywhere (`0.0.0.0/0`) under Network Access, since Vercel functions don't have fixed IPs.

### Deploying to Vercel

Import the repo in Vercel and add `MONGODB_URI` (and `MONGODB_DB` if needed) under Project → Settings → Environment Variables. The project uses `@sveltejs/adapter-vercel`; no extra config needed.

## How it works

- **Player identity**: first visit asks "B or S?" and stores it in an httpOnly cookie that expires after 7 days (it isn't refreshed, so the device picks again weekly). There's no way to switch: the server refuses a new pick while the cookie exists.
- **Matchmaking**: each client polls `GET /api/state` every 1.5s (Vercel functions can't hold websockets). The poll doubles as a heartbeat; when both players are online and both have dismissed the previous result, a match is created.
- **Guesses** are validated and scored on the server (`POST /api/guess`), so the answer never reaches the browser until the match ends. The opponent's progress is shown as colours only.
- **Ending**: first correct guess wins. If both run out of guesses it's recorded as a draw (shown grey in the history).
- **Abandoned matches**: each poll is also a heartbeat on the active match (`seen.B` / `seen.S`), and `expiresAt` = least-recent heartbeat + 60s. Once a player has been away for a minute (tab closed, or hidden — polling pauses while the tab is in the background), the match is deleted outright, so it never shows up in history. The remaining player sees a countdown, then a "match cancelled" notice. If both players leave, a MongoDB TTL index on `expiresAt` deletes it (Mongo's TTL sweep runs every ~60s, so it can take up to an extra minute).

## Project layout

```
src/lib/
  wordle/                 pure game logic — no UI, no server
    evaluate.ts           scoring (handles repeated letters), keyboard colours
    types.ts, config.ts
  components/wordle/      reusable, mode-agnostic UI
    WordleGame.svelte     board + keyboard + input; evaluation delegated via `onGuess`
    Board / Tile / Keyboard / MiniBoard
  components/match/       two-player screens (picker, waiting room, match, history)
  multiplayer/            client polling session + shared API types
  server/                 MongoDB, match logic, word lists, player cookie
routes/
  +page.*                 the single page
  api/state|guess|ack|leave
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
