# Bruchlandung – FatherSonGame V2

Echtzeit-Strategiespiel im Weltraum für den Browser (PC und Tablet), für Kinder ab 10.
Der komplette Plan steht in [docs/plan/](docs/plan/README.md).

## Stand

Meilensteine **M0, M1 und M2** sind gebaut: Basis auf dem Planeten, Rohstoffe, Spinnenwesen,
Forschung, Speichern, Sonnensystem mit Zoom und Mining-Schiffen.

## Lokal starten (einmalig einrichten)

1. **Bun** installieren: <https://bun.sh> (Mac/Linux: `curl -fsSL https://bun.sh/install | bash`,
   Windows: `powershell -c "irm bun.sh/install.ps1 | iex"`).
2. Repo holen und Pakete installieren:
   ```sh
   git clone https://github.com/domci/FatherSonGame_v2.git
   cd FatherSonGame_v2
   bun install
   ```

## Spielen

```sh
bun run dev
```

Dann im Browser öffnen: <http://localhost:5173>

**Auf dem Tablet:** PC und Tablet im gleichen WLAN. `bun run dev` zeigt eine Zeile `Network: http://192.168.x.x:5173`.
Diese Adresse im Tablet-Browser öffnen.

Neue Version holen: `git pull` und dann wieder `bun run dev`.

## Kurze Spielanleitung

- **Bauen:** unten ein Gebäude antippen, dann auf den Boden tippen. Grün = passt, rot = passt nicht.
  Jeder Bau braucht eine freie Bau-Drohne 🛸.
- **Energie ⚡:** Solarfelder bauen. Zu wenig Energie = alles arbeitet langsamer.
- **Pinke Pumpe** nur auf pinke Quellen, **Diamanten-Bohrer** nur auf Kristalle.
- **Antippen:** Gebäude oder Einheit antippen zeigt rechts Infos und Knöpfe (Aufleveln, Einheiten bauen, Forschung im Labor).
- **Jäger** (aus der Jagdstation): antippen, dann Spinne oder Ei antippen = jagen. Gibt Nahrung 🥚.
- **Zoom:** Mausrad / zwei Finger. Ganz rauszoomen wechselt zu Planet und Sonnensystem. Oder die Knöpfe oben.
- **Mining-Schiffe:** Forschung „Raumfahrt“ → Raumhafen bauen → Schiff bauen → in der System-Ansicht ☀️
  einen Planeten oder den Asteroidenring antippen → „Mining-Schiff hierher schicken“.
- **⏩ x1 / x10 / x100:** Test-Geschwindigkeit, damit man nicht lange warten muss.
- Das Spiel speichert alle 2 Minuten und läuft weiter, wenn es zu ist.

## Für Entwickler

Siehe [CLAUDE.md](CLAUDE.md). Wichtige Befehle: `bun run check` (alles prüfen), `bun run e2e` (Browser-Tests).

## Danke / Lizenzen

- 3D-Modelle: [Kenney](https://kenney.nl) (Space Kit) und [Quaternius](https://quaternius.com) – beide CC0. Details: `public/models/CREDITS.md`.
- Icons: [Lucide](https://lucide.dev) (ISC). Schriften: Rajdhani und Inter (SIL OFL) über Fontsource.
