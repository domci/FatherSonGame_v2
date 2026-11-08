# 01 – Spieldesign

Einträge mit **(Vorschlag)** sind Ideen von Claude. Dom und Sohn können sie jederzeit ändern.

## Story

Ein menschliches Raumschiff macht eine Bruchlandung auf einem fremden Planeten.
Der Planet hat keine Atmosphäre. Alles Leben spielt sich in Glaskuppeln (Biosphären) ab.
Auf dem Planeten leben Spinnenwesen mit 6 Augen: Tiere, nicht intelligent, gruselig und gefährlich.
Man kann sie jagen und essen, ihre Eier auch.
Auf einem anderen Planeten lebt eine höhere Alien-Zivilisation. Sie will die gleichen Rohstoffe.
Es kommt zum Krieg, bis eine Seite besiegt ist.

## Setting

- Spielt in der **nahen Zukunft**.
- Space-Opera-Stimmung (ähnlich wie Star Wars): Raumschiffe, Antriebe, Laserwaffen, Schilde.
- Eigene Welt mit eigenen Namen, Schiffen und Designs (keine Figuren oder Schiffe aus Star Wars).
- Technik der Menschen: kantig, Metall und Glas, gelb-weiße Laser. Technik der Aliens: organisch, leuchtend, andere Farben (Vorschlag).

## Zielgruppe: Kinder ab 10

- Spannend und ein bisschen gruselig, aber nicht zu gruselig.
- **Kein Blut, keine Leichen.** Besiegte Einheiten explodieren in Funken, Roboter fallen auseinander, Spinnen zerfallen zu Staub.
- Spinnenwesen: gruselig durch Form, 6 leuchtende Augen und Geräusche, nicht durch eklige Details.
- Jagen und Essen: wird nur als Symbol gezeigt (Spinne besiegt → Nahrung +10), keine Schlacht-Szenen.
- Klare Sprache, einfache Menüs, große Knöpfe.
- Online (M7): **kein freier Chat** für Kinder. Nur feste Nachrichten ("Hilfe!", "Angriff!", "Danke!"). Datenschutz (DSGVO) beachten, keine echten Namen.

## Wissens-Quiz (später, ab M5)

- Wer schneller bauen oder mehr Rohstoffe will, kann **Quizfragen** beantworten.
- Fragen passend zum Alter (ab 10): Weltraum, Physik, Mathe, Natur, Erdkunde.
- Belohnung: ein spezieller Rohstoff, z.B. **Wissenskristalle** (Vorschlag). Damit kann man Bauzeit oder Forschung beschleunigen.
- Grenzen gegen Ausnutzen: nur X Fragen pro Stunde, falsche Antwort = kurze Pause, Fragen wiederholen sich selten.
- Fragen stehen als Daten in `src/content/quiz/` (mit Altersstufe und Thema). Dom und Sohn können eigene Fragen ergänzen.

## Grundregeln

- **Echtzeit**, wie Command & Conquer oder Age of Empires.
- **Spielmodi:** Einzelspieler gegen den Computer. Man wählt: Menschen oder Aliens.
- **Partie ohne Zeitlimit.** Sie endet, wenn ein Gegner besiegt ist. Speichern und Laden über viele Abende.
- **Sieg (Vorschlag):** Alle Haupt-Kuppeln (Kommandozentralen) des Gegners sind zerstört.
- **Sonnensystem:** bei jeder Partie zufällig neu (aus einer Zahl, dem "Seed").

## Zeit: das Spiel läuft weiter, auch wenn man weg ist

Wie bei Clash of Clans:
- Bauen, Forschen und Produktion laufen in **echter Zeit**, auch wenn das Spiel zu ist.
- **Am Anfang schnell** (Sekunden bis Minuten), **später immer langsamer** (Stunden bis Tage).
- Kämpfe laufen live in Echtzeit, wenn man zuschaut (wie C&C).

Zeit-Kurve (Vorschlag, Werte in Tabellen, leicht änderbar):

| Gebäude-/Forschungs-Stufe | Bauzeit |
|---|---|
| 1 | 10–60 Sekunden |
| 2 | 2–5 Minuten |
| 3 | 15–30 Minuten |
| 4 | 1–3 Stunden |
| 5 | 6–12 Stunden |
| 6+ | 1–3 Tage |

Regeln (Vorschlag):
- Anzahl gleichzeitiger Bauaufträge = Anzahl Bau-Drohnen (wie die "Baumeister" in Clash of Clans). Mehr Drohnen kann man sich erarbeiten.
- **Wissenskristalle** (aus dem Quiz, M5) verkürzen Bau- und Forschungszeit.
- Für Tests und zum Ausprobieren gibt es einen **Entwickler-Schalter "Zeit x100"**.

**Angriffe, wenn man offline ist:** Einstellung pro Spieler.
- **Standard: AUS.** Wer offline ist, kann nicht angegriffen werden.
- Wer es einschaltet: Die Basis verteidigt sich allein, danach gibt es eine Wiederholung des Kampfes.

## Ansichten (Zoom)

1. **Sonnensystem:** Sonne in der Mitte, Planeten auf Bahnen, Asteroidenring, Schiffe.
2. **Planet:** Kugel, man sieht die Kuppeln als Punkte/Lichter.
3. **Oberfläche:** nah dran wird es flach. Hier baut man die Basis und kämpft am Boden.

Technisch (Vorschlag): Jeder Planet hat eine oder mehrere flache Bauzonen.
Beim Zoom blendet das Spiel weich von der Kugel auf die flache Bauzone über.

## Völker

- **Menschen** und **Aliens** haben die gleichen Gebäude-Kategorien und gleiche Regeln.
- Aussehen ist komplett anders (andere Zivilisation).
- Werte dürfen später leicht abweichen. Start: gleiche Werte, damit das Spiel fair ist.
- **Spinnenwesen** sind ein drittes, neutrales "Volk": Tiere, greifen manchmal an, legen Eier.

## Rohstoffe

| Rohstoff | Woher | Wofür (Vorschlag) |
|---|---|---|
| Energie | Sonne (Solar-Kollektoren). Weiter weg von der Sonne = weniger Energie | Alle Gebäude laufen mit Energie |
| Regolith | Abbau auf Planeten-Oberfläche | Grund-Baumaterial (Kuppeln, Mauern) |
| Metall | Asteroidenring (Mining-Schiffe) | Fahrzeuge, Schiffe, Waffen |
| Gas | Gasplaneten (Mining-Schiffe) | Treibstoff für Schiffe und Flugzeuge |
| Diamanten | Selten, Abbau auf Planeten | Hochtechnik, Forschung, Laser |
| Pinke Flüssigkeit | Quellen auf Planeten | Wird zu **Wasser** und **Sauerstoff** verarbeitet |
| Nahrung | Gewächshaus, Spinnen jagen, Eier sammeln | Bewohner ernähren |

In M1–M4 gibt es noch keine Probleme, wenn Wasser, Sauerstoff oder Nahrung fehlen.
Ab M5: Fehlt etwas, werden Bewohner langsamer, krank oder gehen.

## Gebäude-Kategorien (Vorschlag)

| Kategorie | Menschen (Beispiel) | Aliens (Beispiel) |
|---|---|---|
| Kommando | Kommando-Kuppel (Wrack des Schiffs) | Brutstock / Kern |
| Wohnen | Wohn-Kuppel | Wohn-Kokon |
| Energie | Solarfeld | Lichtsammler |
| Abbau | Regolith-Bagger, Diamanten-Bohrer, Pumpe | organische Gegenstücke |
| Verarbeitung | Wasser/Sauerstoff-Anlage | — |
| Nahrung | Gewächshaus, Jagdstation | — |
| Lager | Lagerhalle | — |
| Forschung | Labor | — |
| Militär Boden | Kaserne, Fahrzeugfabrik | — |
| Militär Luft | Flugfeld | — |
| Raumfahrt | Raumhafen (baut Mining- und Kampfschiffe) | — |
| Verteidigung | Mauer, Geschützturm, Flak | — |
| Schilde | Schildreaktor (erzeugt Kraftfeld-Kuppel über ein Gebiet), Kraftfeld-Wand | — |

**Schildreaktoren und Kraftfelder:** Ein Schildreaktor braucht viel Energie und schützt alle Gebäude in seinem Radius.
Das Kraftfeld fängt Schaden ab, bis es leer ist, und lädt sich danach wieder auf. Kraftfeld-Wände blockieren Bodentruppen.
Fehlt Energie, fällt der Schild aus (taktisches Ziel: Solarfelder des Gegners angreifen).

Alle Gebäude können einzeln aufgelevelt werden.

## Aufleveln

- **Einzelne Forschungen** (kein Zeitalter-System), z.B. "Bessere Solarzellen", "Flugzeuge", "Raumschiff-Antrieb".
- Forschung kostet Rohstoffe und Zeit, im Labor.
- Gebäude-Upgrades: Level 1–3 pro Gebäude (Vorschlag).

## Einheiten (Vorschlag)

| Typ | Beispiele | Ab Meilenstein |
|---|---|---|
| Arbeiter | Bau-Roboter / Drohne | M1 |
| Jäger | Jäger mit Netzwerfer (Spinnen) | M1 |
| Boden | Infanterie, Panzer/Rover | M3 |
| Luft-Abwehr | Flak-Turm, Flak-Fahrzeug | M4 |
| Luft | Jagdflugzeug, Bomber | M4 |
| All | Mining-Schiff (M2), Jäger, Kreuzer | M2 / M4 |

## Spielablauf einer Partie

1. Landung: Wrack = Kommando-Kuppel, ein paar Arbeiter.
2. Basis bauen: Energie, Regolith, Nahrung, Wohn-Kuppeln.
3. Spinnen wehren und jagen.
4. Forschen, Raumhafen bauen, Mining-Schiffe zu Gasplanet und Asteroiden.
5. Verteidigung bauen, denn die Aliens greifen ab und zu an.
6. Armee, Flugzeuge, Raumschiffe bauen. Alien-Basis angreifen und besiegen.

## Später (nicht in M1–M5)

- Mehrere KI-Gegner, die sich auch gegenseitig bekämpfen.
- Allianzen, auch zwischen Menschen und Aliens.
- Online-Multiplayer mit Login: gegeneinander oder in Allianzen.

## Multiplayer-Schutz für neue Spieler (Ideen für M7)

So machen es andere Spiele:

| Spiel | Regel |
|---|---|
| OGame | "Noob-Schutz": schwache Spieler können nicht von viel stärkeren angegriffen werden (Punkte-Abstand). |
| Travian | Anfänger-Schutz für die ersten Tage. Schutz endet früher, wenn man selbst angreift. |
| Clash of Clans | Schild nach einem Angriff (Zeit zum Erholen). Gegner werden nach ähnlicher Stärke gesucht. |

Vorschlag für unser Spiel:
1. **Anfänger-Schild:** neue Spieler sind z.B. 3 Tage oder bis Stufe X nicht angreifbar. Wer selbst angreift, verliert den Schild.
2. **Stärke-Bereich:** man kann nur Spieler angreifen, deren Stärke-Punkte nahe an den eigenen liegen (z.B. 50 % bis 200 %). Ausnahme: Allianz-Kriege oder der andere hat zuerst angegriffen.
3. **Erholungs-Schild:** nach einer schweren Niederlage ein paar Stunden Schutz.
4. **Urlaubs-Modus:** Basis eingefroren und geschützt, wenn man länger weg ist.

Wegen der langen Bauzeiten ist Multiplayer eine **dauerhafte Welt** (läuft weiter, auch wenn man offline ist, wie OGame/Clash of Clans). Dazu passen die Schutz-Regeln.
