# 03 – Architektur

## Grundidee: Logik und Grafik streng getrennt

```
 Eingabe (Maus, Touch, Tastatur)
        │  erzeugt
        ▼
   Befehle (Commands)  ──►  Simulation (sim)  ──►  Spielstand (State)
                              reines TypeScript        │
                              feste Takte              │ wird gelesen von
                                                       ▼
                                          Grafik (render)   Menüs (ui)
                                          Three.js          HTML/Preact
```

- **Simulation (`src/sim/`)**: die ganzen Spielregeln. Kein Three.js, kein DOM, kein Browser.
  Läuft in festen Takten (20 pro Sekunde). Gleicher Start + gleiche Befehle = gleiches Ergebnis.
- **Befehle (`src/sim/commands/`)**: jede Aktion eines Spielers ist ein Befehl als Datenobjekt,
  z.B. `{ type: "build", building: "solar", x: 10, y: 4 }`. Auch die KI benutzt nur Befehle.
  Darum ist Multiplayer später möglich: man schickt nur Befehle über das Netz.
- **Grafik (`src/render/`)**: zeigt den Spielstand. Liest nur, schreibt nie.
- **Menüs (`src/ui/`)**: HTML/CSS. Liest den Spielstand, sendet Befehle.
- **Eingabe (`src/input/`)**: Maus, Touch, Tastatur → Befehle oder Kamera-Bewegung.

## Ordner

```
src/
  main.ts               Start: verbindet alles
  sim/                  Spielregeln (KEIN three, KEIN DOM)
    world.ts            ECS-Welt (Miniplex)
    components/         Daten-Bausteine: Position, Health, Owner, Producer, ...
    systems/            Regeln pro Takt: production, movement, combat, research, ...
    commands/           Befehle + Prüfung, ob erlaubt
    ai/                 Computer-Gegner (benutzt nur Befehle)
    generation/         Zufälliges Sonnensystem aus Seed
    save/               Speichern/Laden, Versionsnummer, Migration
    rng.ts              eigener Zufallsgenerator mit Seed
  content/              Spiel-Daten als Tabellen: Gebäude, Einheiten, Forschung, Rohstoffe
  render/               Three.js
    scenes/             system-view, planet-view, surface-view
    camera/             Zoom und Übergänge
    models/             Laden von glTF über das Manifest
    effects/            Sonne, Atmosphäre, Laser, Explosionen (TSL)
  ui/                   HTML-Menüs (Preact-Komponenten)
  input/                Maus, Touch, Tastatur
  platform/             IndexedDB, Einstellungen
assets/                 glTF-Modelle, Texturen, Sounds + manifest
tests/e2e/              Playwright-Tests mit Screenshots
docs/                   Plan, Entscheidungen (ADR), Lerntagebuch
```

## Regeln, die Werkzeuge erzwingen (nicht nur Text)

| Regel | Werkzeug |
|---|---|
| `src/sim/` importiert nie `three`, `src/render/`, `src/ui/` | ESLint `no-restricted-imports` |
| `src/render/` ändert nie den Spielstand | nur lesende Typen (`Readonly`) + Lint |
| Datei max. 200 Zeilen | ESLint `max-lines` (Fehler, nicht Warnung) |
| Funktion max. 40 Zeilen | ESLint `max-lines-per-function` |
| Kein `any` | ESLint + TypeScript strict |
| Testabdeckung `src/sim/` mindestens 80 % | Vitest coverage in CI |
| Alles grün vor Merge | GitHub Actions blockiert sonst |

## Spiel-Daten statt Code

Gebäude, Einheiten, Forschung stehen in Tabellen (`src/content/`), z.B.:

```ts
export const SOLAR_FIELD = {
  id: "solar_field",
  category: "energy",
  cost: { regolith: 50 },
  buildTime: 20,
  produces: { energy: 5 },
  model: { human: "human/solar_field", alien: "alien/light_collector" },
};
```

Neues Gebäude = neue Tabelle + Modell. Kein neuer Spiel-Code nötig. Balancing ist leicht.

## Zoom-Ansichten

- **System-Ansicht:** Sonne (TSL-Shader + Bloom), Planeten auf Bahnen, Asteroidenring (Instancing für tausende Steine).
- **Planeten-Ansicht:** Kugel mit Shader-Oberfläche, bei Gas-Planeten Wolkenbänder.
- **Oberflächen-Ansicht:** flache Bauzone mit Raster, Höhen, Kuppeln, Einheiten.
- Übergang: Kamera fährt weich, bei bestimmter Nähe Wechsel der Szene mit Überblendung.

## Speichern

- Spielstand = JSON aus der Simulation (Seed + Entitäten + Takt-Nummer + Versionsnummer).
- Speicherort: IndexedDB. Auto-Speichern alle 2 Minuten. Export/Import als Datei.
- Bei neuer Spielversion: Migrations-Funktion pro Versionsnummer, mit Test.

## Multiplayer-Vorbereitung (schon ab M0)

- Simulation hat keine Abhängigkeit zum Browser → kann später auf einem Server laufen.
- Alle Aktionen sind Befehle → können übers Netz geschickt werden.
- Eigener Zufallsgenerator mit Seed → gleiche Ergebnisse auf allen Rechnern.
