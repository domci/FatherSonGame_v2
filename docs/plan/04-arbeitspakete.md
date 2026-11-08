# 04 – Arbeitspakete

Jedes Arbeitspaket (AP) = **ein Pull Request**, ca. 1–3 Stunden Arbeit für Claude Code.
Ein AP ist fertig, wenn alle Abnahmekriterien erfüllt sind und CI grün ist (siehe [05-arbeitsweise.md](05-arbeitsweise.md)).

## Status (2026-11-08)

- **M0, M1, M2: gebaut** (Testpause für Dom und Sohn).
- Abweichungen: Menüs mit einfachem HTML statt Preact (ADR 0001). Noch offen aus M1/M2: Staub-Partikel (M1-17),
  Minikarte (M2-10, Navigation läuft über Knöpfe und Antippen), FPS-Messung im e2e (M2-4).
  Tablet-e2e prüft nur den Start (Software-Grafik in CI ist langsam).

M0–M3 sind genau geplant. M4–M7 sind grob und werden vor Start neu geplant (mit dem, was wir bis dahin lernen).

Am Ende jedes Meilensteins: **Testspiel von Dom und Sohn** auf PC und Tablet → Feedback → Anpassungen.

---

## M0 – Fundament

Ziel: leeres, aber sauberes Projekt. Alles Wichtige wird automatisch geprüft.

| AP | Titel | Inhalt | Abnahme |
|---|---|---|---|
| M0-1 | Projekt anlegen | Vite + TypeScript strict + bun, Ordner aus der Architektur, `README` | `bun run dev` zeigt leere Seite |
| M0-2 | Qualitäts-Regeln | ESLint (max-lines 200, Import-Grenzen, kein `any`), Prettier | Test-Datei mit Verstoß wird abgelehnt |
| M0-3 | Tests | Vitest (mit Coverage) + Playwright (Screenshot-Test) | je 1 Beispiel-Test grün |
| M0-4 | CI | GitHub Actions: typecheck, lint, test, build, e2e | PR zeigt grünen Haken |
| M0-5 | Veröffentlichung | GitHub Pages Deploy bei Merge auf `main` | Spiel per Link erreichbar |
| M0-6 | Agenten-Regeln | `CLAUDE.md`/`AGENTS.md` mit Regeln aus 05, Lerntagebuch `docs/learnings.md`, ADR-Ordner | Dateien vorhanden |
| M0-7 | Spiel-Kern | Game-Loop mit festen Takten, Seed-Zufall, ECS-Welt, Befehls-System (leer) | Tests: gleicher Seed = gleiches Ergebnis |
| M0-7b | Spiel-Uhr | `Clock`-Schnittstelle: echte Uhr, Test-Uhr, Zeit-Beschleunigung | Tests: Vorspulen um 3 Tage |
| M0-8 | 3D-Grundgerüst | WebGPURenderer (mit WebGL-Fallback), Kamera, Licht, Bloom, Testobjekt | Screenshot-Test auf Chrome + iPad-Emulation |

## M1 – Die Landung (Planet und Basis)

Ziel: Auf einer flachen Bauzone eine Kuppel-Basis bauen, Rohstoffe sammeln, Spinnen abwehren, speichern.

| AP | Titel | Inhalt | Abnahme |
|---|---|---|---|
| M1-1 | Bauzone | Flache Oberfläche mit Raster, Höhen, Regolith-Look (Poly-Haven-Textur), Sternenhimmel | Screenshot ok, Raster-Tests |
| M1-2 | Kamera Oberfläche | Verschieben, Zoomen, Drehen: Maus **und** Touch (zwei Finger) | e2e-Test für Maus und Touch |
| M1-3 | Rohstoff-System | Rohstoff-Konto pro Spieler, Tabellen in `content/` | Unit-Tests Einnahme/Ausgabe |
| M1-4 | Gebäude platzieren | Befehl `build`, Prüfung Platz/Kosten, Bauzeit mit `finishAt`, Baustelle, Bauaufträge = Anzahl Drohnen | Tests: ungültige Plätze abgelehnt |
| M1-5 | Erste Gebäude | Kommando-Kuppel (Wrack), Solarfeld, Regolith-Bagger, Wohn-Kuppel, Lager | Jedes Gebäude produziert laut Tabelle |
| M1-6 | Energie | Energie aus Sonne, Verbrauch, zu wenig Energie = Gebäude langsamer | Tests Energie-Bilanz |
| M1-7 | Pinke Flüssigkeit | Quelle, Pumpe, Anlage → Wasser + Sauerstoff | Produktionskette getestet |
| M1-8 | Nahrung | Gewächshaus, Nahrung im Konto | Tests |
| M1-9 | Arbeiter-Einheiten | Bau-Drohnen: auswählen, bewegen, bauen. Wegfindung auf Raster (A*) | Tests Wegfindung, e2e auswählen+bewegen |
| M1-10 | Spinnenwesen | Spinnen streifen umher, greifen an, wenn man nah baut. Legen Eier | Tests Verhalten |
| M1-11 | Jagen | Jäger-Einheit, einfacher Kampf (Leben, Schaden), Spinnen + Eier → Nahrung | Tests Kampf-Grundregeln |
| M1-12 | Forschung (Basis) | Labor, Forschungs-Tabelle, 3 erste Forschungen | Tests freischalten |
| M1-13 | Gebäude-Upgrade | Level 1–3 pro Gebäude | Tests |
| M1-14 | HUD und Menüs | Rohstoff-Leiste, Bau-Menü, Info-Panel, Touch-tauglich (große Knöpfe) | e2e-Screenshot PC + Tablet |
| M1-15 | Speichern/Laden | IndexedDB, Auto-Save, Export/Import, Versionsnummer | Test: speichern → laden = gleicher Stand |
| M1-15b | Offline-Fortschritt | Beim Laden vergangene Zeit nachrechnen (Bau, Forschung, Produktion), Anzeige "Während du weg warst …" | Test: 2 Tage offline = richtiges Ergebnis |
| M1-15c | Zeit-Kurve | Bau-/Forschungszeiten pro Stufe aus Tabelle (Sekunden → Tage) | Tests Kurve |
| M1-16 | Hauptmenü | Neues Spiel (Volk: zunächst nur Menschen), Laden, Einstellungen | e2e Durchklick |
| M1-17 | Grafik-Runde 1 | Glas-Kuppeln mit Spiegelung, Licht, Schatten, Staub-Partikel | Screenshot-Vergleich vorher/nachher |

## M2 – Das Sonnensystem

Ziel: Zoom vom Sonnensystem bis auf die Oberfläche, Mining-Schiffe holen Gas und Metall.

| AP | Titel | Inhalt | Abnahme |
|---|---|---|---|
| M2-1 | System-Generator | Seed → Sonne, 4–8 Planeten (Gestein/Gas), Asteroidenring, Startplaneten | Tests: gleicher Seed = gleiches System |
| M2-2 | Sonne | TSL-Shader, Glühen, Bloom, Licht für alle Planeten | Screenshot |
| M2-3 | Planeten | Kugeln mit Shader-Oberflächen, Gasplaneten mit Wolkenbändern, Bahnen | Screenshot |
| M2-4 | Asteroidenring | Tausende Steine mit Instancing, flüssig auf Tablet | FPS-Messung im e2e |
| M2-5 | Zoom-Übergänge | System → Planet → Oberfläche, weich, mit Maus/Touch | e2e Zoom-Weg |
| M2-6 | Energie nach Abstand | Planet nah an Sonne = mehr Solar-Energie | Tests |
| M2-7 | Raumhafen | Gebäude, baut Mining-Schiffe | Tests |
| M2-8 | Mining-Schiffe | Flug zu Gasplanet/Asteroid, abbauen, zurück, abliefern (Metall, Gas) | Tests Kreislauf |
| M2-9 | Diamanten + Regolith auf anderen Planeten | Abbau-Punkte auf anderen Planeten | Tests |
| M2-10 | Minikarte und Navigation | Klick auf Planet springt hin | e2e |

## M3 – Die Aliens (erste komplette Partie)

Ziel: 1 gegen 1 gegen die Alien-KI, Bodenkampf, Sieg oder Niederlage. Man kann auch Aliens spielen.

| AP | Titel | Inhalt | Abnahme |
|---|---|---|---|
| M3-1 | Völker-System | Gebäude-Tabellen pro Volk (gleiche Kategorien, eigene Modelle/Namen) | Tests |
| M3-2 | Alien-Grafik | Organische Gebäude-Optik (erst einfache Formen + Shader) | Screenshot |
| M3-3 | Bodentruppen | Kaserne, Fahrzeugfabrik, Infanterie, Panzer, Laserwaffen | Tests Kampfwerte |
| M3-4 | Kampf-System | Reichweite, Ziel wählen, Schaden, Rüstung, Tod, Zerstörung von Gebäuden | Tests |
| M3-5 | Einheiten steuern | Gruppe auswählen (Rahmen ziehen / Touch), Angriffsbefehl, Formation | e2e |
| M3-6 | Verteidigung | Mauer, Geschützturm | Tests |
| M3-7 | Schildreaktor + Kraftfeld | Kraftfeld-Kuppel und -Wand, braucht Energie, lädt sich auf | Tests |
| M3-8 | Nebel des Krieges | Man sieht nur, was eigene Einheiten sehen | Tests |
| M3-9 | KI Wirtschaft | Alien-KI baut Basis auf (nur über Befehle) | Simulations-Test: KI wächst |
| M3-10 | KI Angriff | KI baut Armee, greift ab und zu an, verteidigt sich. KI wächst auch offline mit (Aufholen) | Simulations-Test: KI greift an |
| M3-11 | Landung beim Gegner | Truppen per Transportschiff zum Alien-Planeten bringen | Tests |
| M3-11b | Offline-Angriffe (Einstellung) | Einstellung "Angriffe, wenn offline" (Standard AUS). Wenn AN: Kampf wird beim Aufholen berechnet + Wiederholung | Tests beide Fälle |
| M3-12 | Sieg/Niederlage | Kommando-Zentrale zerstört = Ende, Endbildschirm | Tests |
| M3-13 | Volk wählen | Im Menü Menschen oder Aliens wählen | e2e |
| M3-14 | Balancing-Lauf | KI gegen KI 100× automatisch, Statistik | Bericht in `docs/` |
| M3-15 | Sound (Basis) | Laser, Explosion, Bau, Musik (freie Lizenzen) | manuell geprüft |

## M4 – Luft und All (grob)

- Flugfeld, Jagdflugzeuge, Bomber, Treibstoff aus Gas.
- Luftabwehr (Flak-Turm, Flak-Fahrzeug).
- Kampfschiffe im All (Jäger, Kreuzer), Weltraumkampf, Blockade von Mining-Routen.
- Angriff aus dem Orbit auf Basen (mit Schild-Gegenwehr).
- KI nutzt Luft und All.

## M5 – Leben in der Kuppel (grob)

- Bewohner brauchen Sauerstoff, Wasser, Nahrung. Fehlt etwas: langsamer, krank, gehen weg.
- Zufriedenheit, Wachstum der Bevölkerung.
- Grafik-Runde 2: echte glTF-Modelle für alle Gebäude und Einheiten, bessere Effekte.
- Tutorial / erste Mission mit der Bruchlandungs-Story.
- **Wissens-Quiz:** Quizfragen ab 10 Jahren, Belohnung "Wissenskristalle" zum Beschleunigen, Grenzen gegen Ausnutzen, Fragen als Daten-Tabelle.

## M6 – Viele Völker (grob)

- Mehrere KI-Gegner gleichzeitig, auch untereinander im Krieg.
- Allianzen und Diplomatie (auch Menschen + Aliens).
- Größere Sonnensysteme.

## M7 – Online (grob)

- Dauerhafte Welt (läuft weiter, wenn man offline ist).
- Server mit Colyseus, Login, Lobby.
- Simulation läuft auf dem Server, Clients schicken Befehle.
- Schutz für neue Spieler, Stärke-Bereich für Angriffe.
- Allianzen: gründen, Anfragen, Einladungen, gemeinsame Angriffe.
- Chat (Allianz und privat) mit KI-Moderation vor dem Anzeigen, Melden-Knopf, Strafen (Warnung → Sperre → Ausschluss).
- Kinderschutz: keine echten Namen, DSGVO.
- Hosting und Kosten klären (braucht Dom: Konto und ggf. Bezahlung).
