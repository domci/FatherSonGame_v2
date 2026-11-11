# Balancing: Computer gegen Computer

Erzeugt mit `bun tools/balance.ts 24` (489 s Rechenzeit).
Halbe Partien: Menschen auf dem Heimatplaneten (mit Spinnen-Nestern), halbe Partien: Aliens dort.
Schritt: 250 ms. Höchstens 8 Stunden Spielzeit pro Partie (sonst: unentschieden).

## Teil 1: Spieler gegen Computer (24 Partien pro Stufe)

Der „Spieler“ ist ein Computer mit voller Stärke, der aber nur alle 15 s handelt (3× langsamer).

| Stufe | Siege Spieler | Siege Computer | unentschieden | erster Angriff (Median) | Partien mit Angriff | Angriffe pro Partie |
| --- | --- | --- | --- | --- | --- | --- |
| Leicht | 33 % | 0 % | 67 % | 175 min | 71 % | 4.0 |
| Mittel | 21 % | 13 % | 67 % | 116 min | 100 % | 9.2 |
| Schwer | 4 % | 92 % | 4 % | 119 min | 100 % | 9.8 |

## Teil 2: Menschen gegen Aliens (24 Partien, beide volle Stärke)

| Wert | Zahl |
| --- | --- |
| mit Sieger | 12 (50 %) |
| Siege Menschen | 7 (58 %) |
| Siege Aliens | 5 (42 %) |
| Spieldauer Median | 354 min |
| Flieger pro Seite (Median: 120 min / Ende) | 0 / 2 |
| Kampfschiffe pro Seite (Median: 120 min / Ende) | 0 / 0 |
