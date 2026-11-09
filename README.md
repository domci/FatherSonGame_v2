# Bruchlandung – FatherSonGame V2

Echtzeit-Strategiespiel im Weltraum für den Browser (PC und Tablet), für Kinder ab 10.
Der komplette Plan steht in [docs/plan/](docs/plan/README.md).

## Stand

Meilensteine **M0 bis M3** sind gebaut: Basis auf dem Planeten, Rohstoffe, Spinnenwesen,
Forschung, Speichern, Sonnensystem mit Zoom und Mining-Schiffen – und jetzt die **Aliens**:
eine komplette Partie gegen den Computer, mit Truppen, Kampf, Verteidigung, Nebel und Sieg oder Niederlage.
Man kann als Menschen oder als Aliens spielen.

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
- **Volk und Gegner:** Bei „Neues Spiel“ Menschen oder Aliens wählen und wie stark der Computer ist.
- **Truppen:** Forschung „Laserwaffen“ → Kaserne (Tab _Militär_) → Raumsoldaten bauen.
  Mit „Panzerung“ und Fahrzeugfabrik gibt es Panzer.
- **Truppen steuern:** Einheit antippen, dann Boden antippen = hinlaufen (sie kämpfen unterwegs).
  Feind antippen = angreifen. **Armee** (links) wählt alle Kämpfer. **Rahmen** (links) oder
  Shift + Maus ziehen = Rahmen um mehrere Einheiten.
- **Verteidigung (Tab _Schutz_):** Mauer, Geschützturm, Schildreaktor (Kuppel aus Energie, braucht genug Strom),
  Kraftfeld. Die Kommando-Kuppel hat selbst einen kleinen Laser.
- **Angriff:** Transportschiff im Raumhafen bauen. Truppen wählen und auf das Schiff tippen = einsteigen.
  Dann „Angriff: zu … fliegen“. **Front** (links) zeigt die Truppen beim Feind, **Basis** bringt euch zurück.
- **Sieg:** Zerstört die Haupt-Kuppel des Gegners (Brutkern oder Kommando-Kuppel). Verliert ihr eure, ist das Spiel vorbei.
- **Einstellungen (Menü ☰):** Geräusche, Musik, „Angriffe, auch wenn keiner spielt“ (Standard: aus).
- **⏩ x1 / x10 / x100:** Test-Geschwindigkeit, damit man nicht lange warten muss.
- Das Spiel speichert alle 2 Minuten und läuft weiter, wenn es zu ist.

## Für Entwickler

Siehe [CLAUDE.md](CLAUDE.md). Wichtige Befehle: `bun run check` (alles prüfen), `bun run e2e` (Browser-Tests).

## Danke / Lizenzen

- 3D-Modelle: [Kenney](https://kenney.nl) (Space Kit) und [Quaternius](https://quaternius.com) – beide CC0. Details: `public/models/CREDITS.md`.
- Geräusche: Kenney Sound-Pakete (CC0). Kampfmusik: „Battle Theme A“ von cynicmusic (CC0).
- Icons: [Lucide](https://lucide.dev) (ISC). Schriften: Rajdhani und Inter (SIL OFL) über Fontsource.
