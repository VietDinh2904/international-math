# Cockpit Gameplay Roadmap

Status: **Idea bank only — do not implement until the owner explicitly starts this phase.**

Last updated: 2026-09-29

## Confirmed owner decisions

- The cockpit uses a third-person room view so the player can see both the animal pilot and the interactive room.
- The penguin and seal differ visually only. Neither character has a gameplay advantage.
- Players may switch character, but changing pilot costs one Knowledge Gem.
- Earth Research and Rescue Friends are equal choices. The student chooses freely according to what they want to learn or play.
- Plants continue growing while the browser is closed by using real timestamps.
- Plants never die because the student returns late. Their progress pauses safely until the next care action.
- Science answers do not directly award soil or water. Soil and water will come from another learning route, potentially Geography.
- New players begin with three active flower pots.
- One complete Knowledge Gem requires five fragments.
- Gem colors are random and are revealed when the gem is assembled.
- Each color belongs to a recognizable family of uses rather than having completely random powers.
- Players may switch weapons during a battle.
- Robot enemies will therefore need simple elemental attributes and readable weakness indicators.
- All existing local progress must be migrated automatically into the cockpit system.
- Character switching is available directly in the cockpit.
- The cockpit uses a realistic science-fiction environment combined with chibi animal pilots.
- Switching character costs one complete Knowledge Gem.
- Weapon fragment families are primarily assigned by planet; additional fragment outcomes may depend on the robot type defeated.

## Core design principle

The game must feel simple even when the underlying systems are deep:

- The cockpit is the player's permanent home screen.
- Important activities are visible as large objects or doors, not hidden inside toolbars.
- A student should be able to start meaningful play with one click.
- Every click should have an obvious result, animation, reward, or next choice.
- Use complete illustrated scenes and character artwork; avoid small generic emoji or simple line-art placeholders.
- Keep advanced systems discoverable gradually instead of showing every feature at once.

## Cockpit home screen

The main background is the inside of the player's spaceship cockpit. The player character is always visible in the cockpit.

### First playable characters

1. Chibi penguin explorer.
2. Chibi seal explorer.

Both are friendly animal pilots with expressive animations and customizable equipment. The player chooses one at the beginning. The unselected character can later become a companion or unlockable crew member.

### Two primary mission routes

The cockpit should show two large, immediately clickable routes:

1. **Earth Research** — science lessons, experiments, seeds, gardening, vocabulary, and analysis.
2. **Rescue Friends** — travel, maths missions, enemy ships, robot bosses, weapons, and rescued mascots.

The student should not need to open a menu before choosing either route.

### Visible cockpit objects and doors

- Storage chest: inventory, gem fragments, weapons, seeds, materials, rewards.
- Science Lab console: synthesis, analysis, research discoveries.
- Vocabulary Journal: grouped by week with hologram word reveals.
- Garden door: opens the spaceship garden.
- Future doors: Engine Room, Living Room, Outside/Airlock.

Only the Garden is part of the next proposed build. The Engine Room, Living Room, and Outside remain visible as future destinations or locked doors.

## Knowledge Gem system

Knowledge Gems are assembled from fragments rather than received as finished crystals.

### Collection loop

1. Complete missions or find hidden fragments.
2. Store fragments in the chest.
3. Collect enough compatible pieces.
4. Assemble them into a full Knowledge Gem.
5. Reveal the gem's color, property, and function.

### Randomization

- Gem colors are randomized so students cannot always predict where a required color will appear.
- Each complete gem has one property and one practical use.
- Different colors should not be purely cosmetic.
- Duplicate gems may later be combined, traded, upgraded, or used as crafting materials.

### Possible properties and uses

- Reveal a hidden route or clue.
- Unlock a laboratory instrument.
- Accelerate one garden growth stage.
- Protect the player or spaceship.
- Power a weapon upgrade.
- Decode a star map.
- Unlock a Zodiac constellation map.

### Recommended first-version Gem economy

Keep the first version limited to four colors. A complete Gem is consumed when used unless the reward explicitly says it is permanent.

| Gem family | Main use | Example |
| --- | --- | --- |
| Blue | Growth and analysis | Advance one Garden stage early or analyze an unknown seed |
| Red | Combat and energy | Charge a weapon skill or assemble a weapon part bonus |
| Green | Exploration and discovery | Reveal a hidden object, resource location, or research clue |
| Purple | Navigation and cosmic knowledge | Reveal one Zodiac clue or unlock part of a star map |

Character switching can accept **any one complete Gem**. This makes changing avatars possible without adding another currency, but still makes the decision meaningful.

Recommended rules:

- Ordinary actions never need Gems.
- Gems accelerate progress, reveal secrets, or unlock optional content.
- Gems should not be required to continue the main learning path.
- Before spending a Gem, always show the exact result and require one clear confirmation click.
- The chest displays both loose fragments and complete Gems.
- A newly assembled color receives a short hologram explanation before it enters the chest.

Star maps should form collectible sets based on the Zodiac constellations. They can reveal lore, destinations, puzzles, or future wormhole routes.

## Science Lab and Garden system

Science missions reward practical growing materials:

- Seeds.
- Water.
- Soil.
- Flower pots.

Correct answers supply water, soil, and pots. Specific lessons or discoveries provide seed types.

### Garden loop

1. Enter the Garden from the cockpit.
2. Choose an empty pot.
3. Add soil.
4. Plant one seed.
5. Add water.
6. Wait for the next growth stage.
7. Return after the timer and perform the next care action.
8. Collect the mature plant, flower, fruit, seed, or research reward.

### Growth stages

1. Seed.
2. Sprout.
3. Shoot.
4. Seedling.
5. Mature plant.
6. Flowering.
7. Fruiting, when appropriate for that species.

Each transition should take approximately one or two real days before the next action becomes available. The exact timer remains to be decided.

### Visual direction

- Friendly, colorful, expressive plants inspired by the readability and personality of garden strategy games.
- Do not copy Plants vs. Zombies characters or assets.
- Every plant must still resemble a recognizable real plant.
- Each stage needs a visibly different illustration and a short scientific observation.
- The Garden should look like a real spaceship room rather than a flat menu.

## Weapon collection system

Initial weapon families:

1. Plasma gun.
2. Flame gun.
3. Ice gun.

### Assembly loop

- Collect ten fragments belonging to the same weapon family.
- At ten fragments, assemble the complete weapon.
- Store both fragments and completed weapons in the chest.
- The chest clearly displays progress, for example `Plasma 6/10`.

### Weapon inspection

Clicking any chest item opens a large inspection view with:

- Full-size artwork.
- Item name and rarity.
- Current fragment progress.
- Weapon property and battle effect.
- Upgrade state.
- Where the item was discovered.

The inspection view should feel like a holographic display projected from the chest.

### Recommended robot attribute system

Use only three robot armor attributes in the first version so weapon switching remains easy to understand:

| Robot attribute | Visual signal | Weak weapon |
| --- | --- | --- |
| Energy Shield | Blue glowing shield | Plasma gun |
| Overheated Armor | Red/orange vents and heat | Ice gun |
| Frozen Armor | Frost and pale-blue ice shell | Flame gun |

The battle screen should always show a small weakness symbol above the robot. Students may switch weapons during battle with one click. Choosing the matching weapon improves damage or grants a visible bonus, but choosing another weapon still works so the student is never completely blocked.

Bosses can change attribute between phases. Regular robots should use only one attribute per battle.

## Simplicity rules

- Maximum one click from the cockpit to Earth Research, Rescue Friends, Garden, Chest, Lab, or Vocabulary Journal.
- Never require a hidden hamburger menu for a core activity.
- Use large illustrated hotspots with labels.
- Show only two primary mission choices at the center; supporting rooms sit around the cockpit.
- Use short tooltips and character speech instead of long instruction screens.
- First-time actions receive a brief guided animation.
- Returning players skip tutorials automatically.
- Locked content remains visible but clearly labeled with its unlock condition.
- Rewards always fly visibly into the correct physical location: chest, lab, weapon rack, or garden shelf.

## Knowledge-check mini-game framework

Mini-games should reuse the same lesson and question data. They are presentation modes, not separate curricula. A student chooses one activity from a large cockpit screen and begins immediately.

### Recommended core mini-games

#### 1. Starfighter Race

The player's small aircraft races two or three rivals through a short course.

- A correct answer activates boost and moves the aircraft forward.
- A wrong answer slows the aircraft briefly but allows another attempt.
- Three consecutive correct answers trigger a visible super boost.
- Best for rapid vocabulary recognition, arithmetic, and short multiple-choice review.
- Typical length: five questions and two to four minutes.

#### 2. Planet Relay Run

The chosen chibi animal runs across terrain connected to the current lesson.

- Correct answers clear obstacles, build bridges, or provide stamina.
- Questions can ask students to choose the correct observation, sequence, label, or cause-and-effect relationship.
- Wrong answers show a short clue and let the student retry.
- Best for science and geography because the background can match wetlands, gardens, deserts, ice, or planets.

#### 3. Spaceship Assembly Puzzle

Students reconstruct a spaceship, laboratory instrument, plant lifecycle, robot, or constellation from pieces.

- Each correct answer unlocks one puzzle piece.
- The student drags or taps the piece into place.
- When the object is complete, it animates and becomes a collectible blueprint or ship model.
- Best for review at the end of one week because it produces a meaningful permanent reward.

#### 4. Hologram Evidence Sort

Students sort illustrated evidence cards into two or three holographic zones.

- Examples: habitat/non-habitat, pollination/seed dispersal, solid/liquid/gas, renewable/non-renewable.
- A correct placement makes the card lock into the hologram.
- An incorrect placement gently returns the card and shows one clue.
- Best for concept classification and comparing similar scientific terms.

#### 5. Sequence Reactor

Students arrange stages in the correct order to power a spaceship system.

- Examples: seed to fruit, flower to pollination, animal lifecycle, water cycle, scientific method, mission chronology.
- Each completed sequence charges the reactor or opens a route.
- Best for process knowledge that ordinary multiple choice does not test well.

#### 6. Constellation Connect

Students answer questions to reveal stars, then connect them into a Zodiac constellation.

- Every correct answer reveals one star or one connecting line.
- Completing the shape unlocks its star-map page and a short story.
- Knowledge Gems may reveal one optional hidden star, but are not required.
- Best for weekly mastery rewards and the Zodiac collection system.

#### 7. Garden Diagnosis

Students inspect a plant with a visible problem and select the best evidence or care action.

- Problems can include too little water, unsuitable soil, insufficient light, pollination failure, or seed dispersal questions.
- Correct diagnosis restores the plant and provides a seed or research observation.
- Wrong choices never kill the plant.
- Best for applying science knowledge rather than recalling a definition.

### Recommended rollout

Start with only three modes:

1. **Starfighter Race** for fast review.
2. **Spaceship Assembly Puzzle** for weekly completion.
3. **Hologram Evidence Sort** for science concepts.

Add Planet Relay Run, Sequence Reactor, Constellation Connect, and Garden Diagnosis after the cockpit and Garden loops are stable.

### Shared reward rules

- A mini-game is launched from a visible cockpit console, not a hidden menu.
- Students choose their preferred mini-game when more than one supports the current lesson.
- Completing a game awards normal progress plus a small resource or fragment.
- Different mini-games must not provide unequal academic advantages.
- Replaying changes question order, rival position, route, or puzzle layout.
- Mini-games should take two to five minutes and require no more than one short tutorial.

## Proposed build order when development starts

1. Cockpit home screen and the two chibi pilot choices.
2. Large Earth Research and Rescue Friends mission routes.
3. Visible links to existing chest, lab, and vocabulary journal.
4. Garden room with one tutorial plant and local timer.
5. Seed, water, soil, and pot rewards connected to science answers.
6. Large chest item-inspection hologram.
7. Three weapon fragment collections and assembly at 10/10.
8. Knowledge Gem fragment assembly and randomized colors.
9. Zodiac star-map collection.
10. Engine Room, Living Room, and Outside in later phases.

## Decisions still needed

### Cockpit and characters

1. ~~Is the chosen penguin or seal only a visual avatar, or does each have a different ability?~~ Confirmed: visual difference only.
2. ~~Where is the character changed: directly in the cockpit, or later inside the Living Room/wardrobe?~~ Confirmed: directly in the cockpit.
3. ~~Should the cockpit be shown from first-person view, third-person room view, or a mixture where the animal pilot is visible at a control desk?~~ Confirmed: third-person room view.
4. ~~Should the cockpit look cute and colorful, realistic sci-fi, or realistic sci-fi with chibi characters?~~ Confirmed: realistic sci-fi with chibi characters.

### Garden

5. ~~Does one correct science answer award one random resource, or a fixed package of water + soil progress?~~ Confirmed: soil and water come from another route, potentially Geography.
6. ~~Should plants continue growing while the browser is closed using real timestamps?~~ Confirmed: yes.
7. Is the one-to-two-day wait per stage fixed, randomized, or different by plant species?
8. ~~What happens if a plant is not watered on time: pause safely, wilt temporarily, or die?~~ Confirmed: pause safely.
9. Should harvested fruit and seeds be consumed when used, or remain permanently in the collection?
10. ~~How many active pots should a new player have at the beginning?~~ Confirmed: three.

### Gems and Zodiac maps

11. How many gem colors should exist in the first version?
12. Are gem properties fixed by color, randomized within each color, or shown only after assembly?
13. ~~How many fragments make one complete Knowledge Gem?~~ Confirmed: five.
14. Should assembling the wrong colors be impossible, create a random gem, or create a weaker mixed gem?
15. Does one Zodiac map require gems, constellation fragments, or both?

### Weapons and battle

16. ~~Do plasma, flame, and ice weapons have strengths against different enemy types?~~ Confirmed: yes; robots receive a simple readable attribute.
17. ~~Does the player choose one equipped weapon before a mission, or switch weapons during battle?~~ Confirmed: switch during battle.
18. ~~Are weapon fragments awarded by mission type, planet, random drop, or boss?~~ Confirmed: primarily by planet; additional outcomes may depend on robot type.
19. Can a completed weapon be upgraded with extra fragments?

### Progress and onboarding

20. ~~Which system should the first-time tutorial introduce first: the rescue route or Earth Research?~~ Confirmed: let the student choose freely.
21. ~~Should existing progress be migrated into the new cockpit automatically?~~ Confirmed: preserve and migrate all existing local progress.
22. Which three cockpit objects must be visually active on the very first visit, and which should start locked?
