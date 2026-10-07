# Game economy and learning flow

This document is the rule contract for the learning game. New features should follow these rules so that a reward never appears without a learning source and one currency never performs every job.

## 1. The core learning loop

1. The learner opens a chapter in Earth Research.
2. A short illustrated lesson introduces vocabulary, evidence and a scientific relationship.
3. The learner answers mixed questions (MCQ, gap-fill, matching, true/false and sequencing).
4. Completion stores the day's evidence object and any eligible living specimen in the Storage Chest.
5. The chapter's Kingdom reuses the chapter landscape as an interactive habitat.
6. The learner reads each organism clue, predicts suitable conditions and adjusts moisture, fertility and light.
7. The model reports whether the organism is unsuitable, surviving or thriving. Flowering plants distinguish between flowering without fruit and flowering with fruit when a pollinator is present.
8. Math and Arcade play fund optional purchases, while Science evidence unlocks knowledge-based progression.

The result is a closed loop: **read → answer → collect → place → predict → adjust → observe → explain**.

## 2. Resource sources and uses

| Resource | Only valid sources | Valid uses | Must never do |
|---|---|---|---|
| Gold | 1 Gold for the first correct answer to a unique Math question; 1–10 Gold for a completed Arcade run based on score | Buy cultivated plants, animals, rare living specimens, robot parts and habitat objects | Buy natural water, soil, a continent or a legendary archive |
| Knowledge Crystal Fragment | One fragment-equivalent for each completed Science investigation | Forge 5 fragments into 1 Knowledge Gem | Purchase ordinary shop stock |
| Knowledge Gem | Forge from 5 Science fragments | Expand maps; unlock barren/rare/legendary regions; open future extinct-life, mythical-life and planet archives; selected advanced research upgrades | Replace Gold for ordinary animals or plants |
| Energy | A new correct Math answer and selected Arcade rewards | Maintain advanced habitats and power future Earth-protection systems | Replace scientific habitat requirements |
| Water | Rain Kingdom or an approved freshwater field site after 5 Science checks | Raise habitat moisture and water plants | Be purchased with Gold |
| Soil | A named Earth terrain expedition after 5 Science checks | Supply the appropriate substrate: loam, sandy soil or red earth | Be purchased with Gold or treated as one universal soil |
| Seeds | A Science lesson discovery or a mature plant harvest | Start the next plant generation | Appear randomly without a lesson or harvest source |
| Fertilizer / compost | Decomposition and nutrient-cycle lessons | Restore nutrients after plant growth | Be treated as always beneficial; excessive nutrients can damage roots or water quality |
| Living specimen | The linked Science day, or a Gold shop purchase after its profile is readable | Place in compatible Kingdoms; inspect its mini lesson | Reveal a locked specimen image before unlock |

Every resource chip in the top bar opens a short “How to collect / What it is for” guide.

## 3. Currency separation

Gold answers the question: **What can I buy?**

- Common and rare organisms use Gold. Rarer organisms cost more Gold.
- Ordinary plants, decorations, food and robot parts also use Gold.
- Replaying an Arcade game can earn more Gold, but the amount depends on demonstrated knowledge.
- A unique Math problem pays only once, preventing repeated tapping on one known answer.

Knowledge Gems answer the question: **Where or how far can I explore?**

- Gems expand the world map rather than filling the ordinary shop basket.
- Current map gates begin with Mangrove Nursery (2 Gems) and Kelp Coast (3 Gems).
- Planned upper tiers are Barren Frontier, Rare Biome, Legendary Sanctuary, Extinct-Life Archive, Mythical-Life Exhibit and new planets.
- A Gem is evidence-heavy: five completed Science investigations are required before forging.

This separation prevents the richest player from skipping the learning progression.

## 4. Storage Chest rules

- Science chapter rewards and living specimens are stored as separate categories.
- A specimen card contains a real image, name, category, source chapter, preferred environment and a mini lesson.
- Completing the linked Science day is the ownership check for chapter specimens.
- Returning a specimen from a Kingdom sends it back to the Chest; it is not deleted.
- Shop purchases and chapter discoveries share the same visual specimen standard, but their provenance remains visible.

## 5. Kingdom habitat reasoning

Each Kingdom uses three relative learning controls from 0 to 100:

- **Moisture / water:** 0 is bone-dry; 100 is saturated or submerged.
- **Fertility:** 0 is nutrient-poor; 100 is very nutrient-rich.
- **Available light:** 0 is darkness; 100 is strong full light.

These values are a classroom model, not literal laboratory percentages. The intended reasoning sequence is:

1. Read the organism clue.
2. Predict which factor is limiting.
3. Change one control at a time.
4. Compare the new response with the previous response.
5. Explain why the response changed.

Outcomes:

- **Wrong biome:** even perfect sliders cannot replace the required ecosystem.
- **Unsuitable:** two or more factors are outside the preferred range, or one factor is far outside it.
- **Surviving:** only one factor is slightly outside the range.
- **Thriving / growing well:** all abiotic requirements are suitable.
- **Flowering, no fruit yet:** abiotic conditions are suitable but a partner such as a pollinator is missing.
- **Flowering and fruiting:** abiotic conditions and the required ecological partner are both present.

This makes interdependence visible: the “correct” answer is sometimes another organism, not another slider.

## 6. Contextual top bar

The top bar must show only resources relevant to the current place:

- Cockpit / Living Room: Gold, Knowledge Gems and Energy.
- Habitat Shop / Robot Workshop: Gold, Knowledge Gems and Energy.
- Garden / terrain expedition / Kingdom: Water, soil, seeds and fertilizer.
- Storage Chest: Gold, available Knowledge Gems and Energy.
- Active space mission only: explorer health, shield, ship integrity and Energy.

Old Explorer and Spaceship status must not appear in a garden, shop, library or habitat.

## 7. Arcade learning loop

The Science Arcade now has eight activities:

1. Alien Maze — spatial planning plus two-option Science decisions.
2. Starship Word Rescue — definition, spelling and hint use.
3. Picture Word Decoder — observation and vocabulary reconstruction.
4. Ecosystem Sorter — classification from evidence.
5. Process Sequencer — causal and temporal order.
6. Microbe Whack Lab — rapid recognition without rewarding random tapping.
7. Habitat Rally — evidence-based multiple choice presented as racing lanes.
8. Duck Migration Derby — habitat decisions visualised as migration progress.

Finishing a five-round game pays `max(1, correct answers × 2)` Gold. A perfect run therefore pays 10 Gold. The reward is shown on the result screen and immediately updates the shop wallet.

## 8. Scientific content constraints

- Wetland organisms require hydrology appropriate to saturated soils.
- Soil water availability depends on texture, pore space and organic matter; high water is not automatically healthy because waterlogging can reduce oxygen.
- Reef-building corals require fully aquatic, clear and well-lit conditions in this model.
- Earthworms require moisture and organic material but not flooded, oxygen-poor soil.
- Flowering and fruit set depend on light, steady water, nutrients and, for many plants, pollination.
- Fertilizer is not a universal “more is better” control.

## 9. Stability checks before release

- Reload preserves purchased specimens, unlocked regions, habitat settings and placed organisms.
- A Gold purchase cannot make the balance negative.
- A Gem gate cannot consume Gems when the balance is insufficient.
- A unique Math question cannot pay Gold twice.
- An Arcade completion pays exactly once per completed run.
- Water and soil cannot be purchased in the Gold shop.
- Locked specimen images remain hidden.
- Every placed organism has a path back to the Storage Chest.
- Every Kingdom configuration remains reachable after page reload.
- Mobile layouts keep resource chips and habitat controls readable without clipping.
