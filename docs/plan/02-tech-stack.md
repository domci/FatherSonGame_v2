# 02 – Tech-Stack

## Entscheidung

| Bereich | Technik | Warum |
|---|---|---|
| Sprache | **TypeScript** (strict) | Fehler früh finden. KI schreibt sehr guten TS-Code. |
| 3D | **Three.js** mit **WebGPURenderer** | Die Bibliothek mit den meisten Beispielen. KI kennt sie am besten. WebGPU läuft seit Ende 2025 in allen großen Browsern (auch Safari/iPad). Fällt automatisch auf WebGL 2 zurück. |
| Shader | **TSL** (Three Shading Language) | Shader in TypeScript statt GLSL. Für Sonne, Atmosphären-Glühen, Planeten-Oberflächen, Schilde. |
| Effekte | Three.js Post-Processing (Bloom, Tone-Mapping) | Leuchtende Sonne, Laser, realistischeres Licht. |
| Build | **Vite** | Schnell, Standard, aus V1 bekannt. |
| Paket-Manager | **bun** | Aus V1 bekannt, schnell. |
| Tests Logik | **Vitest** | Schnelle Tests ohne Browser. |
| Tests Browser | **Playwright** | Startet das Spiel, klickt, macht Screenshots. So kann Claude selbst prüfen, ob es gut aussieht. |
| Struktur | **ECS** mit **Miniplex** | Feste Ordnung für Einheiten/Gebäude. Kleine Dateien. |
| Menüs | HTML + CSS über dem 3D-Bild, kleine Komponenten mit **Preact** (Vorschlag) | Einfach. Funktioniert mit Touch. |
| Speichern | **IndexedDB** (über `idb-keyval`), Spielstand als JSON mit Versionsnummer | Mehr Platz als LocalStorage. Export als Datei möglich. |
| Qualität | **ESLint** (mit Datei-Größen- und Import-Regeln), **Prettier** | Regeln werden von Werkzeugen erzwungen, nicht nur geschrieben. |
| CI | **GitHub Actions** | Jede Änderung: Typprüfung, Lint, Tests, Build. |
| Hosting | **GitHub Pages** | Kostenlos. Jede neue Version ist sofort spielbar per Link. |
| 3D-Modelle | **glTF/GLB**-Dateien | Standard-Format. Gebäude nicht mehr im Code "basteln" (Lehre aus V1). |
| Multiplayer (M7) | **Colyseus** (Node.js Game-Server) | Verbreitet, gut dokumentiert, TypeScript. Wird erst in M7 genau geprüft. |

## Was andere Vibe-Coder nutzen

- Viele bekannte KI-gebaute Browserspiele (z.B. der Flugsimulator von Pieter Levels) nutzen Three.js + KI-Editor.
- Quellen: [Viverse 2026](https://news.viverse.com/post/which-game-engine-web-games-2026), [fly.pieter.com](https://www.vibecoding.wiki/showcase/fly-pieter-com-by-levelsio/), [Ziva: Vibe Coding Games](https://ziva.sh/blogs/vibe-coding-games).
- Wichtigste Lehre aus der Praxis: kleine Schritte, oft committen, früh auf echtem Gerät testen.

## Geprüfte Alternativen

| Alternative | Warum nicht |
|---|---|
| Babylon.js | Mehr eingebaut, aber weniger Beispiele und weniger KI-Wissen. |
| React Three Fiber | Zusätzliche Schicht (React) macht Spiel-Logik schwerer. |
| PlayCanvas | Stark mit visuellem Editor; wir arbeiten aber nur mit Code. |
| Godot | Gute Engine, aber eigene Sprache, Web-Export ohne WebGPU, schwer autonom zu bauen. |

## Grafik-Assets (Modelle, Texturen)

Ziel: möglichst gute, eher realistische Grafik.

1. **Start (M1):** einfache Formen mit guten Materialien (Glas, Metall), Licht und Bloom. Sieht schon ordentlich aus.
2. **Danach:** echte Modelle als glTF:
   - Kostenlose Texturen und Himmel: [Poly Haven](https://polyhaven.com) (CC0).
   - Kostenlose Modelle: Sketchfab (nur CC0/CC-BY, Quelle in `CREDITS.md`).
   - KI-3D-Generatoren (z.B. Meshy, Tripo): brauchen ein Konto von Dom. Optional.
3. Jedes Modell bekommt eine feste Größe und einen festen Namen. Code lädt Modelle über eine Liste (`assets/manifest`), nie fest verdrahtet.
