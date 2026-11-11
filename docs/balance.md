# Balancing: Computer gegen Computer

Erzeugt mit `bun tools/balance.ts 24` (470 s Rechenzeit).
Halbe Partien: Menschen auf dem Heimatplaneten (mit Spinnen-Nestern), halbe Partien: Aliens dort.
Schritt: 250 ms. Höchstens 8 Stunden Spielzeit pro Partie (sonst: unentschieden).

## Teil 1: Spieler gegen Computer (24 Partien pro Stufe)

Der „Spieler“ ist ein Computer mit voller Stärke, der aber nur alle 15 s handelt (3× langsamer).

| Stufe | Siege Spieler | Siege Computer | unentschieden | erster Angriff (Median) | Partien mit Angriff | Angriffe pro Partie |
| --- | --- | --- | --- | --- | --- | --- |
| Leicht | 21 % | 0 % | 79 % | 172 min | 96 % | 5.5 |
| Mittel | 46 % | 8 % | 46 % | 128 min | 100 % | 4.4 |
| Schwer | 0 % | 100 % | 0 % | 118 min | 100 % | 7.3 |

## Teil 2: Menschen gegen Aliens (24 Partien, beide volle Stärke)

| Wert | Zahl |
| --- | --- |
| mit Sieger | 15 (63 %) |
| Siege Menschen | 8 (53 %) |
| Siege Aliens | 7 (47 %) |
| Spieldauer Median | 337 min |
| Flieger pro Seite (Median: 120 min / Ende) | 0 / 1 |
| Kampfschiffe pro Seite (Median: 120 min / Ende) | 0 / 0 |
