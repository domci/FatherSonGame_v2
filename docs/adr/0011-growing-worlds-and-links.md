# ADR 0011: Growing online worlds and world links

Date: 2026-11-15

Dom's wish: share a link to a world; everybody with the link can join at any time; when the planets are
all taken, new planets come into the solar system.

## World links

- Link = page address + `#welt=CODE` (`src/ui/share-world.ts`). Opening it goes straight to that world:
  pick a name if there is no account yet, pick the people, play (`src/main.ts`, `OnlineFlow.pending`).
- Lobby: "Einladen" on your own worlds. In the game: pause menu → "Freunde einladen".
  Both show the link, a copy button and (phones, tablets) the system share button.
- Kid safety stays: hint "only give it to people you know"; beginner shield, strength rule and
  chat checks are unchanged. "Offen für alle" still decides only if the world is in the public list.

## Worlds grow

- New world: you choose only the computers (0..2). All other start places are for people.
- When all places are taken, the next person gets a new seat `s<N>` (N = place in the side order and index in
  `system.homes`) and a new home planet (`addHomePlanet`, `src/sim/generation/home-planets.ts`).
  Up to `ONLINE.maxGrownSides` (12) sides; a seat that was left is free again (its planet stays).
- The new planet shares the orbit of the home planet with the fewest planets (same sunlight and year,
  so it is fair), at another place on that orbit (golden angle). Same system → same result.
- The save keeps only the number (`settings.extraHomes`); `buildSystem` rebuilds the planets from the seed.
- The join is a server command like before, so all browsers add the same planet in the same step.
- The space view adds new planets and changes a planet's look when people come or go (`space-homes.ts`).

## New version while somebody plays

- The server says "reload" when the page is older. The page now loads fresh (`?v=…`, no cached page)
  with `#welt=CODE`, so the person lands in the same world again, not in the main menu.
