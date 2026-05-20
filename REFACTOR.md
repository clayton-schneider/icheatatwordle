# Refactor `main.ts` into Core / UI / Connection layers

## Context

`src/main.ts` is currently a single IIFE that mixes app state, DOM rendering, and event wiring. As features grow (filtering, search mode, virtual scrolling, keyboard handling) the boundaries blur — for example `setSearchMode` mutates state *and* writes to the DOM, and `handleKey` decides both what the next state is *and* when to re-render. The refactor splits these concerns so each layer has one job, making future features (virtual scrolling, click-to-add, dark mode) easier to slot in without touching unrelated code.

## Target structure

Three modules, all under `src/`:

```
src/
  core.ts        # state + pure-ish mutators, no DOM
  ui.ts          # render functions that take state as input, no state ownership
  main.ts        # wires DOM events to core mutators and calls ui renderers
```

**Chosen shape:**
- **Modules with explicit re-render** — `main.ts` is responsible for calling the right `ui.*` function after each mutation. No subscribe/notify plumbing in core.
- **State passed into render fns** — `ui.ts` functions take whatever slice of state they need as arguments. Core exports its state object directly to `main.ts`, which forwards it to `ui.ts`.

## `src/core.ts`

Owns mutable state and the functions that change it. No `document`, no `querySelector`, no DOM types.

Exports:
- `Guess` interface (moved from `main.ts:27-30`).
- `state` — a single object holding `words: string[]`, `curGuess: Guess`, `searchMode: boolean`. Exported so `main.ts` can read it; mutated only via the functions below.
- `resetGuess()` — sets `curGuess` to `{ word: "", correctness: [0,0,0,0,0] }`. Replaces the inline reset in `main.ts:104-107` (also fixes the existing bug where reset fills correctness with `5` instead of `0`).
- `appendLetter(letter: string)` — guards length 5, appends to `curGuess.word`. From `main.ts:114-118`.
- `deleteLetter()` — pops last char. From `main.ts:110-113`.
- `cycleCorrectness(idx: number)` — `(curGuess.correctness[idx] + 1) % 3`. From `main.ts:66`.
- `filterWords()` — runs the current `filterWords` logic in `main.ts:147-166` against `state.curGuess`, mutating `state.words`.
- `searchFilter(query: string): string[]` — pure; returns `state.words.filter(w => w.includes(query))`. From `main.ts:55-59`. Does **not** mutate `state.words` (search is a view, not a filter commit).
- `setSearchMode(val: boolean)` — sets `state.searchMode`. The DOM side-effects (button text, focus/blur) move to `ui.ts`.

## `src/ui.ts`

Pure rendering. Takes state (or slices) as arguments, writes to the DOM. Holds DOM element references but no app state.

Exports:
- `initElements()` — runs the `document.querySelector` calls currently at `main.ts:40-44` and returns/caches the elements (`boxes`, `resultsDiv`, `modeBtn`, `searchBox`, `wordCt`). Called once from `main.ts`.
- `renderGuess(guess: Guess)` — writes letters into boxes and updates each box's `data-correctness`. Merges `updateGuess` (`main.ts:135-145`) with the per-box `setAttribute` logic from `main.ts:67` and `main.ts:108`.
- `renderWords(words: string[])` — same as today (`main.ts:168-177`).
- `renderSearchMode(searchMode: boolean)` — DOM side of `setSearchMode`: button text, `data-mode` attribute, focus/blur on `searchBox`. From `main.ts:122-133`.

## `src/main.ts`

Pure wiring. Imports `core` and `ui`, attaches DOM event listeners, and after each core mutation calls the matching `ui.render*`.

Skeleton:
```ts
import './style.css';
import * as core from './core';
import * as ui from './ui';

const els = ui.initElements();

ui.renderWords(core.state.words);
ui.renderGuess(core.state.curGuess);

els.modeBtn.addEventListener('click', () => {
  core.setSearchMode(!core.state.searchMode);
  ui.renderSearchMode(core.state.searchMode);
});

// search input → core.searchFilter → ui.renderWords (does NOT mutate core.state.words)
// box click → core.cycleCorrectness → ui.renderGuess
// keydown / keyboard button → handleKey → core mutators → ui.render*
// enter → core.filterWords + core.resetGuess → ui.renderWords + ui.renderGuess
```

`handleKey` stays in `main.ts` because it's a translation from input events to core calls — that's connection-layer work, not core logic.

## Critical files

- `src/main.ts` — gutted down to wiring.
- `src/core.ts` — new file.
- `src/ui.ts` — new file.
- `src/words.json`, `src/style.css`, `index.html` — unchanged.

## Notes / small fixes folded in

- The reset at `main.ts:106` uses `new Array(5).fill(5)`, which is almost certainly a typo for `0`. `core.resetGuess()` will use `0`.
- `setSearchMode` currently calls `search_box.blur()` even when the user clicked elsewhere; behaviour preserved as-is in `ui.renderSearchMode` to keep the refactor behaviour-neutral.

## Verification

1. `npm run dev` (or whatever the project's dev script is — check `package.json`) and open the app.
2. Golden path:
   - Type a 5-letter word with the physical keyboard → letters appear in boxes.
   - Click boxes → correctness cycles grey → yellow → green → grey.
   - Press Enter → results list filters; word count updates; boxes clear; correctness resets to grey.
3. Search mode:
   - Click the mode button → button text flips to "Search Mode", input focuses.
   - Type in the search box → results filter live without consuming the committed `state.words`.
   - Shift+Tab toggles mode.
4. On-screen keyboard buttons trigger the same handlers as physical keys.
5. No TypeScript errors: `npx tsc --noEmit` (or the project's typecheck script).
