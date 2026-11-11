# 04 – Arbeitspakete

Jedes Arbeitspaket (AP) = **ein Pull Request**, ca. 1–3 Stunden Arbeit für Claude Code.
Ein AP ist fertig, wenn alle Abnahmekriterien erfüllt sind und CI grün ist (siehe [05-arbeitsweise.md](05-arbeitsweise.md)).

## Status (2026-11-11)

- **M0, M1, M2, M3: gebaut.** Erster Test von Dom und Sohn am 2026-11-09, Änderungen danach siehe
  [ADR 0005](../adr/0005-playtest-m3.md): Zoom ohne Schnitte über alle Planeten, Fernradar für die Feind-Basis,
  Computer auf eurem Stand (Leicht/Mittel/Schwer), Truppen verteidigen die Basis selbst, Glaskuppeln mit Tunneln.
- **M4 (Luft und All): gebaut** am 2026-11-11, alle Pakete M4-1 bis M4-14. Entscheidungen:
  [ADR 0006](../adr/0006-m4-luft-und-all.md).
- **M5 (Leben in der Kuppel): gebaut** am 2026-11-11, alle Pakete M5-1 bis M5-13. Entscheidungen:
  [ADR 0007](../adr/0007-m5-leben-in-der-kuppel.md). Nächster Schritt: Testspiel von Dom und Sohn, dann Planung M6.
- Abweichungen M3: „Wiederholung“ von Offline-Kämpfen ist ein **Kampf-Bericht** im „Während du weg warst“-Fenster
  (kein Video). Die KI sieht durch den Nebel (sie schummelt, wie in vielen Strategiespielen).
  Spinnen-Nester gibt es nur auf dem Heimatplaneten. Die Kommando-Kuppel hat einen kleinen Laser (gegen frühe Überfälle).
  Balancing-Bericht: [docs/balance.md](../balance.md).
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

## M4 – Luft und All

Ziel: Krieg in drei Ebenen: Boden, Luft, All. Jede Ebene hat ihre Abwehr. Details: [ADR 0006](../adr/0006-m4-luft-und-all.md).

| AP | Titel | Inhalt | Abnahme |
|---|---|---|---|
| M4-1 | Ebenen im Kampf | Einheiten sind am Boden, in der Luft oder im All. Jede Waffe trifft nur bestimmte Ebenen (`hits`) | Tests: Panzer trifft kein Flugzeug, Flak nur Flugzeuge |
| M4-2 | Forschung | Flugabwehr, Luftfahrt, Kampfschiffe, Orbitallaser. Einheiten können Forschung brauchen | Tests freischalten |
| M4-3 | Flugfeld + Flugzeuge | Flugfeld baut Jagdflugzeuge (treffen alles) und Bomber (stark gegen Gebäude). Fliegen über Mauern | Tests Kampfwerte, Bewegung |
| M4-4 | Treibstoff | Flugzeuge verbrauchen Gas, solange sie fliegen oder kämpfen. Ohne Gas starten sie nicht | Tests Verbrauch, ohne Gas |
| M4-5 | Gas sicher | Jedes Sonnensystem hat mindestens einen Gasplaneten | Test über viele Seeds |
| M4-6 | Luftabwehr | Flak-Turm (Gebäude), Flak-Panzer (Fahrzeugfabrik) | Tests |
| M4-7 | Flugzeuge im Transportschiff | Transportschiffe nehmen Flugzeuge mit | Test |
| M4-8 | Kampfschiffe | Raumhafen baut Raumjäger und Kreuzer. Sie warten im Orbit. Befehl „Flotte hierher" | Tests Flug, Ankunft |
| M4-9 | Weltraumkampf | Flotten am gleichen Ort kämpfen. Orbitalkanone schießt vom Boden ins All | Tests |
| M4-10 | Blockade | Feindliche Flotte am Abbau-Ziel: Mining-Schiffe werden beschossen und kehren um. Transporter werden bei der Landung beschossen | Tests |
| M4-11 | Angriff aus dem Orbit | Kreuzer (mit Orbitallaser) beschießen Gebäude, wenn keine feindliche Flotte im Orbit ist. Schilde fangen das ab | Tests |
| M4-12 | KI Luft und All | KI baut Flak, Flugfeld, Flotte, holt Gas, blockiert, greift aus dem Orbit an. Bleibt auf eurem Stand | Simulations-Tests, Balancing-Bericht |
| M4-13 | Grafik | Modelle für neue Gebäude und Einheiten (beide Völker), Flughöhe, Bomben, Flotte im All, Strahl aus dem Orbit | Screenshots |
| M4-14 | Bedienung | Flotte im Planeten-Fenster, Treibstoff-Hinweise, Bau-Bilder | e2e |

## M5 – Leben in der Kuppel

Ziel: Die Kolonie lebt. Bewohner atmen, trinken, essen, arbeiten, werden krank, freuen sich und wachsen.
Dazu: Wissens-Quiz, Story mit erster Mission, mehr Leben im Bild. Details: [ADR 0007](../adr/0007-m5-leben-in-der-kuppel.md).

| AP | Titel | Inhalt | Abnahme |
|---|---|---|---|
| M5-1 | Bewohner | Jede Seite hat Bewohner (Start: 8). Wohnplätze in Kommando-Kuppel und Wohn-Kuppel (getrennt vom Platz für Einheiten) | Tests |
| M5-2 | Bedürfnisse | Jeder Bewohner braucht pro Minute Sauerstoff, Wasser und Nahrung. Fehlt etwas: Bewohner werden krank und unzufrieden | Tests |
| M5-3 | Arbeit | Abbau- und Produktions-Gebäude brauchen je 2 Arbeiter. Zu wenig gesunde Bewohner oder schlechte Laune = weniger Produktion (nie unter 25 %) | Tests |
| M5-4 | Laune und Wachstum | Zufriedenheit 0–100. Gute Laune + freie Wohnplätze = neue Bewohner. Schlechte Laune = Bewohner gehen (nie unter 2). Läuft auch offline | Tests |
| M5-5 | Neue Gebäude | Krankenstation (heilt Kranke), Park-Kuppel (bessere Laune). Alien-Namen und Modelle | Tests, Bilder |
| M5-6 | KI | Computer baut Wohnplätze und sorgt für Luft, Wasser, Essen | Simulations-Tests, Balancing |
| M5-7 | Kolonie-Anzeige | Oben: Bewohner und Laune. Kolonie-Fenster mit Gründen für die Laune. Warnung bei Mangel | e2e |
| M5-8 | Wissens-Quiz | Fragen als Daten in `src/content/quiz/` (Thema, 4 Antworten, Erklärung). Richtige Antwort = 1 Wissenskristall | Tests |
| M5-9 | Grenzen fürs Quiz | Höchstens 6 Fragen pro Stunde, falsche Antwort = 1 Minute Pause, Fragen kommen erst wieder, wenn alle dran waren | Tests |
| M5-10 | Beschleunigen | Wissenskristalle machen Bau, Ausbau, Forschung und Training sofort fertig (Preis nach Restzeit) | Tests |
| M5-11 | Story und erste Mission | Story-Fenster beim Start. Mission „Überleben“ in Schritten mit Belohnung, kann man überspringen | Tests, e2e |
| M5-12 | Grafik | Bewohner laufen sichtbar durch die Tunnel (mehr Bewohner = mehr Leute), Dampf aus Anlagen, Bau-Bilder | Screenshots |
| M5-13 | Spielstände | Alte Spielstände bekommen Bewohner, Quiz und Mission (Migration) | Test |

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
