# ADR 0002: Economy time vs. live time

Date: 2026-11-08

- Economy (build, research, training, production, mining ships, eggs) uses time stamps and runs in `economyStep`. It also runs during offline catch-up in 30-second steps.
- Movement, spider behaviour and fights run in `liveStep` only while the game is open (10 steps per second).
- So nothing attacks the player while offline (default rule from Dom).
