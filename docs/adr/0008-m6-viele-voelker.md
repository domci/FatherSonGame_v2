# ADR 0008: M6 – many peoples

Date: 2026-11-12

Up to three computer peoples in one game. They also fight each other. Peace and alliances are possible,
also between humans and aliens. More peoples = a bigger solar system.

## Sides (`sim/entity.ts`, `content/sides.ts`, `sim/setup.ts`)

- Side ids: `player`, `ai`, `ai2`, `ai3` (`SideId`); `wild` stays the owner of spiders and nests.
  Old saves only have `ai`, so the first computer keeps that id.
- Each side has a `name` and a `color`. Computer peoples: the first one is the other people, then they alternate
  (player human → aliens, humans, aliens). Names by people: „Schwarm Xar“, „Kolonie Nova“, „Brut der Zyl“, …
  Colors: you blue-ish, `ai` red, `ai2` orange, `ai3` purple.
- `settings.opponents` (1..3). A new game sets it in the „Neues Spiel“ dialog. First attacks come 10 minutes apart.

## Bigger systems (`sim/generation/solar-system.ts`)

- `generateSolarSystem(seed, sides)`. For 2 sides the random numbers are used exactly as before, so old saves and
  the old tests give the same system. For 3–4 sides: one more rocky planet per side inside the belt.
- `system.homes = [player, ai, ai2, ai3]`. The player gets the last rocky planet (as before), computers the others
  from the sun out. `alienBodyId` stays (= `homes[1]`).
- The save does not store the system; it is made again with `homeCount(settings)`.

## Relations (`sim/relations.ts`, `sim/diplomacy.ts`)

- `state.relations[pairKey(a, b)] = { kind: 'war' | 'peace' | 'alliance', since }`. No entry = war: at the start
  everybody fights everybody (also the old 1-vs-1 games without changes).
- `hostile(state, a, b)` replaces "not mine = enemy" everywhere: targeting, the guard, AI defense, the attack
  command, space combat, blockades, orbit strikes, transports, catch-up battles, battle music.
- Allies share sight (fog, explored map, looking at allied planets) and win together.
- Rules for everybody (same for the computer, checked in `whyNot`):
  - Peace only from war, and only 5 minutes after the war started (`warCooldownMs`).
  - Alliance only from peace that lasted 5 minutes (`allianceAfterMs`).
  - War only from peace. An alliance must end first (it becomes peace).
- Command `diplomacy` (`peace`, `alliance`, `war`, `endAlliance`, `decline`). An offer to a computer is answered at
  once (a „no“ is a failed command with the reason as text). An offer to the player waits 3 minutes in
  `state.offers`; the player says yes with the same command, or `decline`.

## Defeat and victory (`sim/defeat.ts`)

- Losing the main dome = defeated (`players[id].defeated`). A computer's things fall apart in the next step
  (explosions). Open offers with it are gone.
- You win when only you and your allies are left. A side at peace must still be beaten (or become an ally).
- When the player loses the main dome, the side that destroyed it wins.

## Computer diplomacy (`sim/ai/answer.ts`, `sim/ai/diplomacy.ts`)

- Answers: peace when the other side is strong enough (easy: always with the player; normal: ≥ 0.8 × own army;
  hard: ≥ 1.2 ×), or when both have a dangerous common enemy (at least as strong). Alliance only against such a
  common enemy, and never with a side that declared war on it or ended an alliance with it (`distrust`).
- Own steps, once a minute, only after the first attack time of its level (nobody fights before):
  ask the strongest enemy for peace when it has 2+ enemies and that one is 1.5 × stronger; ask a side at peace for
  an alliance against a common danger; declare war when it has no enemy left, or on a side at peace that is less than
  half as strong (only after 10 minutes of peace). It never breaks an alliance. On easy it never declares war on
  the player, and computers never team up against the player.
- After an offer to the player it waits 8 minutes before the next step (no flood of offers).

## Computer targets (`sim/ai/targets.ts`)

- Attack waves and fleet raids go to the sides at war with it, **in turns** (wave number mod enemies). With three
  computers the pressure on the player is about the same as with one, and computers weaken each other.
- Limits still follow the human player (`rivalOf`): progress lead, army and fleet size.
- While the game is closed computers only attack the player (and only with offline attacks on), because fights
  between computers far away are not simulated offline.

## Fix found by the balancing run

- `trainArmy` stopped when the home army had `defenders + waveSize` housing, but the wave picks whole units:
  with only tanks (3 housing) free, a wave of 5 never got full and the computer waited forever. Now it trains until
  a full wave can really be picked (still inside the army limit).

## UI

- HUD button „Völker“ (handshake) opens the peoples window: one card per people with color, people, strength word,
  relation, relations to the others, buttons, and open offers (accept / decline). The button glows while an offer
  waits. Only with a computer enemy.
- Colors by relation: selection rings and health-bar frames (own green, ally blue, peace yellow, enemy red).
- Space: each home of a computer people has a thin ring in its color and its name in the label; base lights with
  the radar or as an ally.
- Planet window: who lives there and how you stand. Transports offer „Angriff“ only to peoples at war.
- End screen names the winner (or your allies).

## Save

- `SAVE_VERSION` 4. Migration 3 → 4: `settings.opponents` (1, or 0 without enemy), names and colors for the
  players, `relations: {}`, `offers: []`.

## Balancing

Run `bun tools/balance.ts 12` (12 games per part; see [docs/balance.md](../balance.md)).

- 1 vs 1 after the wave fix: computers attack about 2.5× more often (normal: 10.9 instead of 4.4 waves in 8 h).
  The stand-in player still loses rarely (easy 0 %, normal 8 %, hard 92 %), but more games end without a winner.
- Part 3, stand-in player against three computers (normal): 17 % lost, 83 % no winner after 8 hours, 0.6 computer
  peoples beaten per game, 31.8 waves of all computers together. So the risk for the player is about twice that of
  1 vs 1, not three times: the computers also fight each other. The stand-in never declares war on a side at peace,
  so it cannot win; a real player decides that.

## Not done in M6

- Allies do not help each other on purpose (no shared attacks, no gifts). Each fights its own wars.
- No trading between peoples.
