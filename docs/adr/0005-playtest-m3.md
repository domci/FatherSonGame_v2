# ADR 0005: Changes after the M3 playtest

Date: 2026-11-09

Dom and his son played M3. Their points and what we decided:

- **One seamless zoom.** There is one zoom value from 0 (ground) to 3 (whole solar system), see `render/zoom.ts`.
  The old planet view and system view are now one space scene (`render/views/space-view.ts`). Between surface and
  space both scenes are drawn and mixed. No black fade, no cut.
- **Every planet can be zoomed.** Over the solar system, zooming in flies to the planet under the mouse.
  A surface can be entered only when the player may see it (`sim/visibility.ts → canViewSurface`): the home planet,
  a planet with own units, or the enemy home with the new research **Fernradar** (stage 4, lab level 3).
  The radar shows the enemy buildings, not its units.
- **The computer stays at the player's level** (`content/ai.ts`, `sim/ai/strength.ts`):
  - its progress (sum of building levels + 2 per research) may be at most `lead × player progress + leadBonus`;
  - its home army is at most `armyShare` × the player's military strength;
  - an attack needs a minimum player progress and is at most `waveShare` × the player's home defense;
  - the first attack comes late (Leicht 120 min, Mittel 75 min, Schwer 45 min game time).
  „Normal“ is now called „Mittel“. New games start on „Leicht“. The level can also be changed in the pause menu.
- **Soldiers defend the base by themselves** (`sim/systems/guard.ts`): idle fighters at home attack-move to enemies
  near own buildings. Fighters with an order keep it.
- **Airtight tunnels.** Nobody can breathe outside. Human buildings with people inside are glass domes; all buildings
  are joined by glass tunnels (aliens: living veins). New rule (`sim/tunnels.ts`): a building must be at most
  9 tiles from an own building. Walls, force fields and turrets may stand alone.
