# ADR 0006: M4 – air and space

Date: 2026-11-11

War now has three layers: ground, air, space. Each layer has its own defense.

## Layers and weapons

- `sim/layers.ts`: `layerOf(e)` is `ground`, `air` (units with `air: true`) or `space` (war ships with an `orbit`).
- A weapon says what it hits (`hits` on the unit or building weapon): `ground` (default), `air`, `all` or `space`.
  - Command dome: `all` (small laser, also against early planes).
  - Turret, infantry, tank: ground only. Flak tower and flak tank: air only. Fighter: all. Bomber: ground,
    1.5× against buildings and it picks buildings first (`prefersBuildings`). Orbital cannon: space.
- Air units fly over walls (`flying`). They are drawn at `AIR_HEIGHT` with a shadow on the ground.
- Transport ships carry planes, not war ships.

## Fuel

- Planes burn gas from the wallet while they move or fight (`gasPerMinute`, `sim/systems/fuel.ts`).
- Gas below 1 → gas is 0, planes stop, one message. Move and attack orders for planes fail without gas.
- Every solar system now has at least one gas planet (`ensureGasPlanet`, no extra random numbers, so old seeds
  keep their planets except for the one changed body).

## War ships

- Space fighter and cruiser are built in the spaceport. They do not land: an `orbit` component says where they wait
  (`at`: a planet id or the belt) or where they fly (`to`, `departAt`, `arriveAt`). They have no position.
- Flight time = distance × 4 s / speed (like mining ships). Ships that start at the same place fly together at the
  speed of the slowest ship, so a fleet arrives as one.
- Command `fleet` (button „Flotte hierher schicken“ in the planet window) sends all waiting ships.
- `spaceCombatSystem`: at each place, war ships and orbital cannons shoot enemy war ships first, then enemy mining
  ships that are mining there.

## Blockade

- When a mining ship arrives at a place with enemy war ships, each enemy ship fires once. A ship that survives flies
  home empty. A transport is shot at the same way before it lands.
- While the game is closed and „Angriffe, auch wenn keiner spielt“ is off, there is no blockade against the player.

## Orbital attack

- Cruisers of a side with the research „Orbitallaser“ shoot a building every 4 s, but only if no enemy war ships
  are at that planet. Damage goes through `dealDamage`, so shields catch it. The orbital cannon is hit first.
- Counter: own fleet in orbit, orbital cannon, shields. The player gets one alarm at most every 60 s.

## Computer enemy

- New plan steps: flak, flak towers, three mining ships, aviation, airfield, war ships, more flak, orbital cannon,
  orbital laser. It still follows the level matching from ADR 0005.
- It sends a mining ship to the nearest free gas planet when it has 2 or more miners.
- Army mix: flak tanks when the player has many planes, planes when its air share is low, then tanks and infantry.
- Fleet: at most 12 ships and `armyShare` × the player's fleet and cannons. It goes home when weak (< 40 % life) or
  when its home is blocked, breaks blockades of its mining, and raids (enemy home with the orbital laser, else the
  enemy mining place) only when it is 1.3× stronger.

## Not done in M4

- No manual control of single war ships in a battle (they fight by themselves).
- No separate fuel tanks or refuel at the airfield: gas is taken from the wallet directly.
