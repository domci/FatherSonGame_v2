# Balancing: Computer gegen Computer

Erzeugt mit `bun tools/balance.ts 24` (647 s Rechenzeit).
Halbe Partien: Menschen auf dem Heimatplaneten (mit Spinnen-Nestern), halbe Partien: Aliens dort.
Schritt: 250 ms. Höchstens 8 Stunden Spielzeit pro Partie (sonst: unentschieden).

## Teil 1: Spieler gegen Computer (24 Partien pro Stufe)

Der „Spieler“ ist ein Computer mit voller Stärke, der aber nur alle 15 s handelt (3× langsamer).

| Stufe | Siege Spieler | Siege Computer | unentschieden | erster Angriff (Median) | Partien mit Angriff | Angriffe pro Partie |
| --- | --- | --- | --- | --- | --- | --- |
| Leicht | 29 % | 0 % | 71 % | 178 min | 75 % | 4.2 |
| Mittel | 4 % | 8 % | 88 % | 116 min | 100 % | 9.0 |
| Schwer | 0 % | 92 % | 8 % | 119 min | 100 % | 11.0 |

## Teil 2: Menschen gegen Aliens (24 Partien, beide volle Stärke)

| Wert | Zahl |
| --- | --- |
| mit Sieger | 6 (25 %) |
| Siege Menschen | 4 (67 %) |
| Siege Aliens | 2 (33 %) |
| Spieldauer Median | 447 min |
