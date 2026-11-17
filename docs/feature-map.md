# Feature map (P0 flows)

P0 flows of Bruchlandung / Crashlanded (https://crashlanded.dom-builds.com). Specs: `tests/e2e` (local build) and `tests/live` (`bunx playwright test -c tests/live/live.config.ts`). Kids play here: no real personal data, test worlds only. Update when a P0 flow changes.

## G1 new-game

- role: player
- start: /
- steps:
  1. Open the menu, press "New game" / "Neues Spiel".
  2. Look at the base on the planet.
- expected: the base is rendered, no page errors; the English browser gets English, the language switch changes to German.

## G2 build-and-save

- role: player
- start: /
- steps:
  1. Start a game, build a solar field.
  2. Reload and continue.
- expected: the building is placed and powered; the game saves (IndexedDB) and continues where it stopped.

## G3 zoom-views

- role: player
- start: /
- steps:
  1. Switch to planet and solar-system view; zoom out with the wheel and back.
- expected: smooth zoom without cuts; no render errors.

## G4 mission-quiz

- role: player
- start: /
- steps:
  1. Open the colony window, start the first mission, answer the knowledge quiz.
- expected: story text, mission progress and quiz answers work in both languages.

## G5 online-world

- role: player (two)
- start: /
- steps:
  1. One player makes a world; a second joins by code or link.
  2. Both send a chat message.
- expected: both in the same world, chat delivered through moderation; report and parents page (`/#eltern`, password field) are reachable.

## G6 legal

- role: anon
- start: /
- steps:
  1. Open the privacy page (`/#datenschutz`) and the legal notice from the start screen.
- expected: both show their text; the page has a link preview for X.
