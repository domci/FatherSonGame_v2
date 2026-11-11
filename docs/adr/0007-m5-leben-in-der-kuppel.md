# ADR 0007: M5 – life in the dome

Date: 2026-11-11

The colony now lives: people breathe, drink, eat, work, get sick, are happy or sad, and grow. Plus a knowledge quiz,
a story with a first mission, and more life in the picture.

## People (`sim/colony.ts`, `sim/systems/colony.ts`, numbers in `content/colony.ts`)

- Each side starts with 8 people. Room for people (`residents`) is separate from room for units (`housing`):
  command dome 10/14/18, habitat dome 8/14/20.
- Each person uses per minute: oxygen 0.2, water 0.15, food 0.15. A missing need makes healthy people sick
  (15 %/min × missing share). With nothing missing, 10 % of the sick get well per minute; a medbay heals more.
- Work: each active building that produces something needs 2 workers. Production × `workFactor` =
  0.25 + 0.75 × (healthy workers / jobs) × (mood factor below mood 50). Never below 25 % (robots).
- Mood 0..100 moves 30 % of the gap per minute towards a target: base 50, +10 per need met (−25 × missing share),
  −20 crowded, −15 × energy gap, −15 × sick share, up to +20 from parks. The colony window lists these parts.
- Growth: mood ≥ 60, nothing missing and free room → 0.5 × (mood − 60)/40 × (1 + people/20) per minute.
  Leaving: crowded or mood < 30. Never below 2 people, so a base can always recover.
- Runs in the economy step, so it also runs while the game is closed.
- New buildings: medbay („Krankenstation“ / „Heilnest“) heals, park („Park-Kuppel“ / „Sporengarten“) adds mood.

## Computer enemy

- Urgent steps before its plan: air and water (one pump per plant, upgrade when there is no free spot), food,
  room (only when healthy people < jobs + 2 and mood ≥ 60), medbay when people are sick.
- Without the room brake the computer grew to 160+ people and ran out of water. With `holdBack` (level matching)
  it only keeps its people alive.

## Knowledge quiz (`content/quiz/`, `sim/quiz.ts`)

- 60 questions in 5 topics (Weltraum, Physik, Mathe, Natur, Erdkunde), German, for age 10+. Each has 4 answers and
  a short explanation. **The first answer in the data is the right one**: the game mixes the order when it asks.
  This makes it easy for Dom and his son to add questions.
- Right answer = 1 knowledge crystal („Wissenskristall“, a new resource, not limited by storage).
- Limits: 6 questions per hour of game time, 1 minute pause after a wrong answer, a question comes again only when
  all were asked. An open question stays open when the window is closed (no skipping by closing).
- Commands `quizAsk` and `quizAnswer`, so the rules are in the sim and tested.
- Game time, not real time: with x10/x100 speed there are more questions, but then everything is faster anyway.

## Speed-up (`sim/speed-up.ts`)

- Command `speedUp` finishes a building, upgrade, the unit in training, or the research now.
- Price = ceil(√ minutes left), at least 1: 20 s → 1, 20 min → 5, 2 h → 11, 9 h → 24, 3 days → 66.
  The square root keeps long jobs affordable for kids without making short ones free.

## Story and first mission (`content/mission.ts`, `sim/systems/mission.ts`)

- New game: a story window for each side, then the mission „Überleben“ with 11 steps (solar field, pump,
  greenhouse, water/oxygen plant, habitat, 12 people, hunting lodge, lab, a research, a right quiz answer, barracks).
- Each step gives a reward. The card at the top left can be closed (`missionOff`).
- Old saves get the mission switched off (they are already past the start).

## Picture

- People walk through the glass tunnels (more people = more walkers, at most 48). Aliens: glowing pulses in the veins.
  Only for the look; the rules do not know them.
- Steam puffs from water/oxygen plants, pumps, greenhouses and medbays (aliens: pale green spores).

## Save

- `SAVE_VERSION` 3. Migration 2 → 3 adds colony, quiz and mission (mission off).

## Not done in M5

- No single people with names or jobs. People are numbers.
- No age levels in the quiz yet (all questions are for 10+; `age` is stored for later).
