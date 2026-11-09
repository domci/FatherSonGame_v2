# Balancing: Computer gegen Computer

Erzeugt mit `bun tools/balance.ts 100` (362 s Rechenzeit).
Beide Seiten spielen mit der Computer-KI. Halbe Partien: Menschen auf dem Heimatplaneten
(mit Spinnen-Nestern), halbe Partien: Aliens dort.
Schritt: 250 ms. Höchstens 8 Stunden Spielzeit pro Partie (sonst: unentschieden).

## Teil 1: Normal gegen Normal (100 Partien)

| Wert | Zahl |
| --- | --- |
| mit Sieger | 85 (85 %) |
| Siege Menschen | 44 (52 %) |
| Siege Aliens | 41 (48 %) |
| Siege Heimatplanet (mit Spinnen) | 26 (31 %) |
| Spieldauer Median | 196 min |
| Spieldauer kürzeste / längste | 147 / 421 min |
| Angriffswellen pro Partie (beide Seiten) | 11.4 |

| Zeit | Menschen | Aliens |
| --- | --- | --- |
| 60 min | 23.0 Gebäude, 10.0 Kämpfer | 22.7 Gebäude, 10.0 Kämpfer |
| 120 min | 28.1 Gebäude, 7.7 Kämpfer | 28.0 Gebäude, 8.5 Kämpfer |

## Teil 2: Schwer gegen Leicht (20 Partien)

| Wert | Zahl |
| --- | --- |
| mit Sieger | 20 (100 %) |
| Siege „Schwer“ | 18 (90 %) |
| Spieldauer Median | 215 min |
| Spieldauer kürzeste / längste | 141 / 278 min |
