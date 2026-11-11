# Bruchlandung – FatherSonGame V2

Echtzeit-Strategiespiel im Weltraum für den Browser (PC und Tablet), für Kinder ab 10.
Der komplette Plan steht in [docs/plan/](docs/plan/README.md).

## Stand

Meilensteine **M0 bis M4** sind gebaut: Basis auf dem Planeten, Rohstoffe, Spinnenwesen,
Forschung, Speichern, Sonnensystem mit Zoom und Mining-Schiffen – und jetzt die **Aliens**:
eine komplette Partie gegen den Computer, mit Truppen, Kampf, Verteidigung, Nebel und Sieg oder Niederlage.
Man kann als Menschen oder als Aliens spielen. Nach dem ersten Test: Zoom ohne Schnitte, Glaskuppeln mit Tunneln,
und ein Computer, der auf eurem Stand bleibt. **M4 (Luft und All):** Flugzeuge, Flugabwehr, Kampfschiffe,
Blockaden und Angriffe aus dem Orbit.

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
  Jeder Bau braucht eine freie Bau-Drohne 🛸. Draußen gibt es keine Luft: Jedes Gebäude bekommt einen Tunnel
  zum nächsten Gebäude, darum höchstens 9 Felder weit weg (Mauern, Kraftfelder und Türme dürfen allein stehen).
- **Energie ⚡:** Solarfelder bauen. Zu wenig Energie = alles arbeitet langsamer.
- **Pinke Pumpe** nur auf pinke Quellen, **Diamanten-Bohrer** nur auf Kristalle.
- **Antippen:** Gebäude oder Einheit antippen zeigt rechts Infos und Knöpfe (Aufleveln, Einheiten bauen, Forschung im Labor).
- **Jäger** (aus der Jagdstation): antippen, dann Spinne oder Ei antippen = jagen. Gibt Nahrung 🥚.
- **Zoom:** Mausrad / zwei Finger, ohne Schnitt vom Boden bis zum ganzen Sonnensystem. Oder die Knöpfe oben.
  Im Sonnensystem auf einen Planeten zeigen und reinzoomen = zu diesem Planeten fliegen. Die Basis des Feindes
  seht ihr erst mit der Forschung **Fernradar** (oder wenn eigene Truppen dort sind).
- **Mining-Schiffe:** Forschung „Raumfahrt“ → Raumhafen bauen → Schiff bauen → in der System-Ansicht ☀️
  einen Planeten oder den Asteroidenring antippen → „Mining-Schiff hierher schicken“.
- **Volk und Gegner:** Bei „Neues Spiel“ Menschen oder Aliens wählen und wie stark der Computer ist
  (Leicht / Mittel / Schwer, auch später im Menü ☰). Der Computer bleibt in der Nähe eures Standes und greift
  erst an, wenn ihr bereit seid (Leicht: frühestens nach 2 Stunden Spielzeit).
- **Truppen:** Forschung „Laserwaffen“ → Kaserne (Tab _Militär_) → Raumsoldaten bauen.
  Mit „Panzerung“ und Fahrzeugfabrik gibt es Panzer.
- **Truppen steuern:** Einheit antippen, dann Boden antippen = hinlaufen (sie kämpfen unterwegs).
  Feind antippen = angreifen. Kommt ein Feind zur Basis, laufen freie Kämpfer von selbst hin.
  **Armee** (links) wählt alle Kämpfer. **Rahmen** (links) oder
  Shift + Maus ziehen = Rahmen um mehrere Einheiten.
- **Verteidigung (Tab _Schutz_):** Mauer, Geschützturm, Schildreaktor (Kuppel aus Energie, braucht genug Strom),
  Kraftfeld. Die Kommando-Kuppel hat selbst einen kleinen Laser.
- **Angriff:** Transportschiff im Raumhafen bauen. Truppen wählen und auf das Schiff tippen = einsteigen.
  Dann „Angriff: zu … fliegen“. **Front** (links) zeigt die Truppen beim Feind, **Basis** bringt euch zurück.
- **Luft (Forschung „Luftfahrt“):** Flugfeld bauen → Jagdflugzeuge (treffen alles) und Bomber (stark gegen Gebäude).
  Flugzeuge fliegen über Mauern und **verbrauchen Gas** ☁️, solange sie fliegen oder kämpfen. Ohne Gas bleiben sie
  stehen. Gas holt ein Mining-Schiff vom Gasplaneten (jedes Sonnensystem hat einen).
- **Flugabwehr (Forschung „Flugabwehr“):** Flak-Turm (Tab _Schutz_) und Flak-Panzer (Fahrzeugfabrik) treffen nur
  Flugzeuge. Panzer und Geschütztürme treffen keine Flugzeuge.
- **Kampfschiffe (Forschung „Kampfschiffe“):** Raumjäger und Kreuzer im Raumhafen bauen. Sie warten im Orbit.
  Planet oder Asteroidenring antippen → „Flotte hierher schicken“. Flotten am gleichen Ort kämpfen von selbst.
- **Blockade:** Stehen feindliche Kampfschiffe an einem Abbau-Ort, werden Mining-Schiffe beschossen und fliegen leer
  zurück. Transportschiffe werden bei der Landung beschossen. Eigene Flotte hinschicken = Blockade brechen.
- **Angriff aus dem Orbit:** Kreuzer mit der Forschung „Orbitallaser“ schießen von oben auf Gebäude, wenn keine
  feindliche Flotte dort ist. Dagegen helfen: eigene Flotte, **Orbitalkanone** (schießt ins All) und Schilde.
- **Sieg:** Zerstört die Haupt-Kuppel des Gegners (Brutkern oder Kommando-Kuppel). Verliert ihr eure, ist das Spiel vorbei.
- **Einstellungen (Menü ☰):** Geräusche, Musik, Stärke des Gegners, „Angriffe, auch wenn keiner spielt“ (Standard: aus).
- **⏩ x1 / x10 / x100:** Test-Geschwindigkeit, damit man nicht lange warten muss.
- Das Spiel speichert alle 2 Minuten und läuft weiter, wenn es zu ist.

## Für Entwickler

Siehe [CLAUDE.md](CLAUDE.md). Wichtige Befehle: `bun run check` (alles prüfen), `bun run e2e` (Browser-Tests).

## Danke / Lizenzen

- 3D-Modelle: [Kenney](https://kenney.nl) (Space Kit) und [Quaternius](https://quaternius.com) – beide CC0. Details: `public/models/CREDITS.md`.
- Geräusche: Kenney Sound-Pakete (CC0). Kampfmusik: „Battle Theme A“ von cynicmusic (CC0).
- Icons: [Lucide](https://lucide.dev) (ISC). Schriften: Rajdhani und Inter (SIL OFL) über Fontsource.
