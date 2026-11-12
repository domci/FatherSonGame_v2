# Balancing: Computer gegen Computer

Erzeugt mit `bun tools/balance.ts 12` (680 s Rechenzeit).
Halbe Partien: Menschen auf dem Heimatplaneten (mit Spinnen-Nestern), halbe Partien: Aliens dort.
Schritt: 250 ms. Höchstens 8 Stunden Spielzeit pro Partie (sonst: unentschieden).

## Teil 1: Spieler gegen Computer (12 Partien pro Stufe)

Der „Spieler“ ist ein Computer mit voller Stärke, der aber nur alle 15 s handelt (3× langsamer).

| Stufe | Siege Spieler | Siege Computer | unentschieden | erster Angriff (Median) | Partien mit Angriff | Angriffe pro Partie |
| --- | --- | --- | --- | --- | --- | --- |
| Leicht | 17 % | 0 % | 83 % | 183 min | 100 % | 6.7 |
| Mittel | 17 % | 8 % | 75 % | 151 min | 100 % | 10.9 |
| Schwer | 0 % | 92 % | 8 % | 118 min | 100 % | 7.5 |

## Teil 2: Menschen gegen Aliens (12 Partien, beide volle Stärke)

| Wert | Zahl |
| --- | --- |
| mit Sieger | 4 (33 %) |
| Siege Menschen | 3 (75 %) |
| Siege Aliens | 1 (25 %) |
| Spieldauer Median | 343 min |
| Flieger pro Seite (Median: 120 min / Ende) | 0 / 1 |
| Kampfschiffe pro Seite (Median: 120 min / Ende) | 0 / 0 |

## Teil 3: Spieler gegen drei Computer-Völker (12 Partien, Mittel)

Der „Spieler“ handelt wie in Teil 1 (3× langsamer) und macht Frieden und Bündnisse nach denselben Regeln wie die Computer.

| Wert | Zahl |
| --- | --- |
| Siege Spieler (mit Verbündeten) | 0 (0 %) |
| Niederlagen | 2 (17 %) |
| unentschieden | 10 (83 %) |
| Spieldauer Median (mit Sieger) | 419 min |
| besiegte Computer-Völker pro Partie | 0.6 |
| am Ende Frieden / Bündnis mit dem Spieler | 0.0 / 0.2 |
| Angriffe aller Computer pro Partie | 31.8 |
