# 05 – Arbeitsweise (autonomes Bauen mit Claude Code)

## Ablauf pro Arbeitspaket

**Bis das Spiel stabil ist (Doms Regel, gilt auch nach M3):** keine Pull Requests. Claude committet direkt auf `main`,
aber nur, wenn alle lokalen Checks grün sind. CI läuft trotzdem bei jedem Push; ist sie rot, wird das zuerst repariert.
**Später (wenn Dom es sagt):** Ablauf mit Branch und Pull Request wie unten.

1. Claude nimmt das nächste AP aus [04-arbeitspakete.md](04-arbeitspakete.md) (Reihenfolge von oben nach unten).
2. Neuer Branch (ab M4), kleine Commits.
3. **Erst Tests, dann Code** für alle Regeln in `src/sim/`.
4. Lokal prüfen: `typecheck`, `lint`, `test`, `build`, `e2e`.
5. Pull Request mit: Was, Warum, Screenshot (aus Playwright), welche Abnahmekriterien erfüllt.
6. CI muss grün sein. Dann Merge (siehe "Wer merged").
7. Lerntagebuch `docs/learnings.md` ergänzen, wenn etwas schiefging oder überraschte.

## Wann Claude fragt

Nur bei:
- offenen Design-Fragen, die das Spielgefühl ändern (z.B. neue Regel, neue Einheit),
- harten Blockern (Konto, Bezahlung, Zugang),
- Ende eines Meilensteins (Testspiel-Bitte).

Sonst entscheidet Claude selbst und schreibt die Entscheidung kurz in `docs/adr/` (Architecture Decision Record).

## Definition of Done (für jedes AP)

- [ ] Alle Abnahmekriterien erfüllt
- [ ] Typecheck, Lint, Tests, Build, e2e grün in CI
- [ ] Keine Datei > 200 Zeilen, keine Funktion > 40 Zeilen
- [ ] Keine Verletzung der Import-Grenzen (sim ↔ render)
- [ ] Neue Spiel-Werte stehen in `src/content/`, nicht im Code verstreut
- [ ] Screenshot im PR bzw. Commit-Notiz, wenn sich etwas sichtbar ändert
- [ ] Läuft auf Tablet-Emulation (Touch) im e2e-Test

## Lehren aus V1

| Problem in V1 | Lösung in V2 |
|---|---|
| Regel "Datei > 120 Zeilen teilen" stand nur im Text. Dateien wurden bis 970 Zeilen lang. | ESLint erzwingt Grenzen. CI blockiert. |
| Gebäude als hunderte Zeilen Three.js-Code gebaut (z.B. `town-hall.ts` 950 Zeilen) | Modelle als glTF-Dateien, Werte in Tabellen |
| `game-controller.ts` machte alles (Eingabe, Zustand, UI) | Klare Schichten: input → Befehle → sim → render/ui |
| Kampf geplant, aber nie fertig | Kleine APs mit Abnahme, Meilensteine mit spielbarem Ergebnis |
| Wenige Tests (12 Test-Dateien für 12.000 Zeilen) | Test-First für Logik, Coverage-Grenze in CI |
| Kein automatischer Blick auf die Grafik | Playwright-Screenshots in jedem PR |

## Werkzeuge für Claude

- Three.js-/WebGPU-TSL-Skills für bessere Shader und Effekte.
- Playwright: Spiel starten, klicken, Screenshot ansehen, FPS messen.
- KI-gegen-KI-Simulationen für Balancing (ohne Grafik, sehr schnell).

## Wer merged (entschieden 2026-11-08)

- Bis Ende M3: direkt auf `main` (siehe oben).
- Ab M4: **Claude merged selbst**, wenn CI grün ist.
- Dom und Sohn testen am Ende jedes Meilensteins.
