# ADR 0003 – Grafik-Stil und UI-Design

Datum: 2026-11-08 · Status: angenommen

## Kontext

Dom: Gebäude, Wesen und Fahrzeuge waren "zu rudimentär", Menüs sahen "vibe-codet" aus (Emojis).
Selbst gebaute Modelle aus Grundformen reichen nicht. Der Cloud-Container kann nur npm und GitHub-Raw laden
(keine Asset-Seiten wie Poly Haven, Sketchfab, kenney.nl).

## Entscheidung

- **3D-Modelle:** fertige CC0-Kits statt Grundformen.
  - Kenney Space Kit (Gebäude-Teile, Schiffe) – Gebäude werden aus mehreren Teilen zusammengesetzt (`src/render/models/building-specs.ts`).
  - Quaternius-Roboter (animiert) für Bau-Drohne und Jäger.
  - Materialien werden im Code ersetzt (`kit-materials.ts`): Menschen = weiß/stahl/orange. Aliens bekommen später eigene Materialien.
  - Spinnen bleiben eigenes Modell (kein passendes freies Modell), aber mit 6 Beinen und Lauf-Animation.
- **UI:** eigenes kleines Design-System (`src/ui/theme.css`): Schrift Rajdhani (Titel, Zahlen) + Inter (Text),
  Lucide-Icons (ISC) statt Emojis, dunkle Glas-Panels mit Orange als Akzent (passt zu den Gebäuden).
- **Bilder:** Gebäude-Bilder für die Bau-Leiste und das Hauptmenü-Bild werden aus dem Spiel selbst gerendert
  (`tools/make-thumbs.mjs`), damit alles gleich aussieht.

## Folgen

- Stil = "stylized low-poly Sci-Fi", nicht fotorealistisch. Fotorealistische Modelle bräuchten Zugang zu
  Asset-Seiten oder bezahlte/KI-generierte Modelle.
- Modelle werden beim Start geladen (~0,8 MB), dafür gibt es einen Ladebildschirm.
- Neue Gebäude: Teile aus dem Kit wählen, in `building-specs.ts` eintragen, `node tools/make-thumbs.mjs` laufen lassen.
