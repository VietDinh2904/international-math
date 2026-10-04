# Open-source Reuse Plan

Last reviewed: 2026-10-04

The repositories listed here are kept as local research copies under `.research/open-source/`. That directory is intentionally ignored by Git so the main project does not accidentally vendor whole third-party repositories, nested Git histories, demo assets, or dependencies.

Before production use, copy only the smallest required source modules into this project, retain the relevant license notice, rewrite the visual layer to match the cockpit, and test the adapted module against the Daily Science data model.

## Selected research copies

### 8tentaculos/jsPacman

- Source: https://github.com/8tentaculos/jsPacman
- Research snapshot: `0f255fee87c68b513f0ec286498d56162e813ee2`
- License: MIT for the source code.
- Useful parts: grid movement, wall collision, chase/scatter enemy AI, power-pellet state, responsive scaling, keyboard and touch controls.
- Intended use: Cockpit Escape Maze.
- Important exclusion: do not reuse its Pac-Man or Ms. Pac-Man sprites. The repository credits those sprites to Spriters Resource, and the characters belong to Bandai Namco. Replace all characters, names, sounds, maps and visual assets with original spaceship and alien artwork.

### pepperonas/xword

- Source: https://github.com/pepperonas/xword
- Research snapshot: `8fe8e6c90041a7901b5122cb95890e2d1a761656`
- License: MIT.
- Useful parts: `assets/layout.js` auto-layout algorithm, grid engine, keyboard/mobile input handling, puzzle JSON format and layout tests.
- Intended use: chapter-end Cosmic Crossword generated from the current chapter's words and definitions.
- Important exclusion: do not bring in its optional Google login, server, AI generator, sample puzzle corpus, external Google Fonts, sharing or leaderboard systems. The audit found network calls in `assets/auth.js`, `assets/app.js`, the service worker and server code. The current project only needs the local layout and interaction logic.

### njecolina/Single-HTML-Space-Shooter

- Source: https://github.com/njecolina/Single-HTML-Space-Shooter
- Research snapshot: `5aada6f5049f42d7751090329250db3a3793867a`
- License: MIT.
- Useful parts: lightweight canvas loop, projectiles, enemies, collision, particles, power-ups and space motion in one dependency-free HTML file.
- Intended use: Space Hangman ship-damage feedback and short vocabulary shooting rounds.
- Important exclusion: the final game must use this project's own ship, robot, weapon and background artwork rather than copying the demo presentation unchanged.

### blex41/word-search

- Source: https://github.com/blex41/word-search
- Research snapshot: `a2a0fda635a85f436217115f07f827b0ecbf7767`
- License: MIT.
- Useful parts: deterministic word-grid generation, allowed directions, forbidden-word filtering, serialization and answer-path validation.
- Intended use: optional chapter vocabulary word-search mode and hidden-word missions.
- Important exclusion: this is a generator, not a finished student interface. Build the interaction and space-themed board inside the existing site.

### abdoutech19/hangman-game

- Source: https://github.com/abdoutech19/hangman-game
- Research snapshot: `89469b2d2dd84e94246b344949a27c4cefb4c63f`
- License: MIT for the repository source.
- Useful parts: word-round flow, responsive presentation and preload structure.
- Intended use: reference only for the first Space Hangman prototype.
- Important exclusion: do not reuse the hanging-person theme. Avoid copying bundled images/audio until each asset's license is independently verified. Avoid importing GSAP/CreateJS only for this mode; the existing project can implement the much simpler spaceship-damage animation with CSS and Canvas. The audit also found live calls to Datamuse and PokéAPI plus session storage, so `scripts/main.js` must not be copied wholesale.

## Recommended integration order

1. Extract the maze grid, collision and simplified enemy path logic from `jsPacman`; replace every visual and name before the first prototype.
2. Extract only the crossword auto-layout and local grid interaction from `xword`.
3. Reuse the single-file shooter loop for projectiles, hit detection and particles.
4. Add word-search generation only after the three core chapter games work.
5. Build Space Hangman directly against the existing vocabulary data; use the downloaded Hangman repository only as interaction reference.

## License and safety rules

- MIT code may be adapted commercially, but its copyright and license notice must be retained with the reused code.
- A repository's source-code license does not automatically grant rights to third-party sprites, characters, music, sound effects, fonts, sample questions or trademarks.
- Never ship Pac-Man/Ms. Pac-Man names, maps, character designs or ripped sprites.
- Never copy user accounts, API keys, analytics, advertising, network calls or backend services from a reference repository.
- Run adapted code locally and review it before adding it to the production page.
- Record the exact upstream commit for every module that is ultimately copied into production.
