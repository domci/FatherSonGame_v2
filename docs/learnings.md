# Lerntagebuch / Learnings

Short notes when something went wrong or was surprising. Newest on top.

- 2026-11-08: A* bug: diagonal neighbours wrapped around the map edge (x = -1 became the previous row). Always check x and y bounds separately, never only the flat index.
- 2026-11-08: typescript-eslint 8.72 supports TypeScript only up to 6.0. TypeScript 7 is not used yet.
- 2026-11-08: `structuredClone` is a DOM/Node API, not plain ES2022. The sim uses a JSON clone instead.

## 2026-11-08 – Design-Runde nach erstem Selbst-Test

- Im Cloud-Container rendert Chromium ohne GPU (Software). Ein ganzer Playtest-Lauf dauert dann ~5 Minuten. Für schnelle Blicke lieber einzelne Screenshots.
- `Sprite` in einer Gruppe, die per Raycaster gepickt wird, braucht `raycaster.camera`. Für reine Text-Labels `sprite.raycast = () => undefined` setzen.
- Spielende brauchen sichtbares Feedback: Bau-, Trainings- und Lebens-Balken als HTML über dem 3D-Bild (`src/ui/bars.ts`) sind billig und gut lesbar.
