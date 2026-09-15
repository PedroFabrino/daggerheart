# Daggerheart Character Tracker & Level-Up Assistant Specification

## Problem Statement

When playing *Daggerheart*, players must track numerous interconnected game mechanics: dynamic resource pools (Hit Points, Stress, Hope, Armor score and marked armor slots), damage thresholds (Minor, Major, Severe), active weapon and proficiency damage dice, and especially Domain Cards. At character creation and upon each level-up, players face strict class-specific rules: domain restrictions (e.g., Druids cannot access Valor cards), tier achievements, advancing character traits without re-selecting marked traits in the same tier, and juggling the 5-card active Loadout limit versus the inactive Vault (which incurs Stress when recalled outside of rest). 

Existing tools either require manual record-keeping on paper prone to arithmetic and rule errors, or rely on incomplete APIs. Players need an easy-to-use, reliable digital tracker that strictly enforces game rules, guides character creation and leveling up, and provides a clear, tactile in-game character sheet that operates completely offline.

## Solution

A responsive, offline-first web application built with React, TypeScript, and Tailwind CSS, bundled with a canonical local System Reference Document (SRD) dataset. The application provides:
1. An 8-step guided **Character Creation Wizard** that enforces official SRD rules for class, heritage, trait distribution, equipment, experiences, and starting domain cards.
2. A full-featured **Interactive Character Sheet** for active table play, featuring tactile click-to-mark resource tracks, automated damage threshold tracking, weapon proficiency scaling, and an interactive card tray separating active Loadout (max 5) and Vault with automated Recall Stress cost calculations.
3. A rule-enforced **Level-Up Assistant** that automatically applies Tier Achievements, guides the selection of 2 tier-appropriate advancements, increments damage thresholds, and presents only legal domain cards for acquisition and exchange.
4. A **Character Roster** supporting multi-character management with local persistence and JSON export/import.
5. Flexible player autonomy via a **House Rules** override toggle, theme customization via JSON configuration, and an optional **Duality Dice** virtual roller for players who prefer digital rolls over physical dice.

## User Stories

1. As a player, I want to create a new character through a step-by-step wizard, so that I don't miss any required rulebook steps during setup.
2. As a player, I want to select my class and subclass first, so that my available domains, starting Evasion, starting Hit Points, and class features are automatically configured.
3. As a player, I want to see my class's Hope feature and class feature clearly explained, so that I understand my character's core identity.
4. As a player, I want to choose an Ancestry and a Community for my Heritage, so that my character gains their distinct physical and cultural features.
5. As a player, I want the option to build a Mixed Ancestry by pairing the top feature of one ancestry with the bottom feature of another, so that I can realize diverse character concepts per official rules.
6. As a player, I want to assign the standard trait modifier array (+2, +1, +1, 0, 0, -1) across my six traits (Agility, Strength, Finesse, Instinct, Presence, Knowledge), so that I cannot accidentally assign illegal modifier totals or duplicate single-use values.
7. As a player, I want to pick my starting weapons (either one two-handed or two one-handed weapons) and starting armor from Tier 1 tables, so that my initial attack dice, armor score, and damage thresholds are accurately calculated.
8. As a player, I want to define two custom starting Experiences with +2 modifiers, so that I have personalized narrative strengths ready to invoke during play.
9. As a player, I want to enter my character name, pronouns, physical description, and background details, so that my roleplaying notes are consolidated with my mechanics.
10. As a player creating a Level 1 character, I want to choose two starting Domain Cards filtered strictly to my class's two domains at Level 1, so that I cannot inadvertently choose illegal cards from outside domains or higher tiers.
11. As a player, I want to view an active Character Sheet displaying my current Level, Tier, Class, Subclass, Heritage, and all six Trait modifiers at a glance, so that I have immediate access to my character's sheet during gameplay.
12. As a player in combat, I want to click to mark or clear Hit Point slots, so that I can easily track damage received and healing gained.
13. As a player in combat, I want to click to mark or clear Stress slots, so that I can manage my mental strain and ability costs.
14. As a player, I want to click to mark or spend Hope tokens (up to my maximum of 6), so that I can fuel special class moves and experience boosts.
15. As a player, I want to see my calculated Damage Thresholds (Minor, Major, Severe) displayed alongside my Armor score and clickable Armor slots, so that I know exactly how many HP to mark when struck by incoming damage.
16. As a player, I want to view my active weapons with their calculated damage dice based on my current Proficiency, so that I immediately know what dice to roll on an attack without manual multiplication.
17. As a player, I want to manage my Domain Cards in two distinct trays—Loadout (maximum 5 active cards) and Vault (reserve cards)—so that I stay compliant with loadout limits.
18. As a player, I want to toggle between a tactile Visual Card view and a Compact Combat List view, so that I can switch between rich thematic artwork/text and dense, fast-scanning combat references.
19. As a player attempting to recall a vaulted domain card during active play outside of a rest, I want the system to warn me of its Recall Cost and mark the required Stress, so that I follow the Recall rule accurately.
20. As a player attempting to equip a vaulted card when my Loadout is already full (5/5), I want the system to prompt me to choose a card to send to the Vault, so that my Loadout never illegally exceeds 5 cards.
21. As a player taking a Short Rest during Downtime, I want to select up to two downtime moves (such as Tend to Wounds, Clear Stress, Repair Armor, or Prepare for Hope) and freely swap cards between my Vault and Loadout without Stress, so that resting is streamlined.
22. As a player taking a Long Rest during Downtime, I want the system to clear all my marked HP, Stress, and Armor slots, reset my Hope to at least 2, refresh once-per-long-rest cooldowns, and allow free card swaps, so that full recovery is instantaneous and error-free.
23. As a player, I want to press a "Level Up" button when my GM awards a milestone, so that I can advance my character through a guided, rule-accurate process.
24. As a player leveling up to Level 2, 5, or 8, I want the system to automatically award my Tier Achievement (increasing Proficiency by 1, granting a new +2 Experience, and clearing marked trait advancements at levels 5 and 8), so that tier milestones are never overlooked.
25. As a player leveling up, I want to choose exactly two Advancements from my current tier's available options, so that my progression adheres strictly to the tier advancement grid.
26. As a player advancing character traits during level-up, I want previously marked traits in the current tier to be disabled, so that I cannot double-stack trait bonuses illegally within the same tier.
27. As a player leveling up, I want all three Damage Thresholds (Minor, Major, Severe) to automatically increase by +1, so that my durability scales correctly.
28. As a player leveling up, I want to acquire one new Domain Card filtered strictly to my class domains at or below my new level, so that I only select valid powers.
29. As a player leveling up, I want the option to exchange one previously acquired domain card for a different card of the same level or lower, so that I can retrain my abilities per core rules.
30. As a player reaching Level 5 or higher (Tier 3+), I want the option to choose a Multiclass advancement (spending two advancement slots) to gain an additional class feature, access one of its domains, and choose a foundation card from one of its subclasses, so that high-tier character customization is fully supported.
31. As a player with physical dice at the table, I want all automated digital dice rolling to be completely optional, so that I can enjoy rolling physical dice without digital interference.
32. As a player who chooses to use digital dice rolls, I want to see the animated dice faces and a clear breakdown of the Hope Die vs. Fear Die outcome on action rolls, so that the narrative result is immediately evident to me and the table.
33. As a player or GM playing with table-specific variants, I want a "House Rules" toggle that allows manual editing of stats, thresholds, or card assignments, so that my table's unique rules are never blocked by rigid software limits.
34. As a player, I want my character data to save automatically in my browser, so that my sheet persists across browser sessions and reloads without requiring an account.
35. As a player with multiple characters, I want a Character Roster drawer where I can create, switch between, duplicate, and delete characters, so that I can manage multiple campaign heroes.
36. As a player, I want to export my character as a standalone JSON file and import character JSON files, so that I can back up my data, share my character with my GM, or transfer it to another device.
37. As a player, I want to add custom homebrew Domain Cards, Ancestries, or Equipment, so that custom items or GM-created powers can live directly on my character sheet.
38. As a user, I want the visual styling to reflect a rich dark fantasy aesthetic driven by a customizable JSON theme, so that the tracker looks evocative and can easily support new visual skins in the future.

## Implementation Decisions

### Architectural Approach
- **Platform**: Client-side single-page application (SPA) built with React, Vite, Tailwind CSS, and TypeScript.
- **Offline-First Data Storage**: All character and roster data is persisted locally in the browser (`localStorage`), with an asynchronous repository interface (`CharacterRepository`) decoupling storage mechanism from UI. This ensures that connecting a cloud database (e.g. Supabase) in a future iteration requires no component-level changes.
- **Bundled Core SRD Dataset**: All 9 classes, 18 subclasses, 18 ancestries, 9 communities, equipment tables, and all 189+ domain cards (levels 1–10) are packaged directly within the client bundle in structured, normalized JSON schemas.
- **Per-Domain Color & Badge Mapping**: Each of the 9 domains is bound to a semantic design token defined in `default_theme.json`, ensuring consistent visual identity across cards, modals, and headers.

### Core Domain State Machine & Rule Invariants
- **Loadout Constraint**: An active character's loadout cannot exceed 5 cards. Attempting to add a 6th card transitions the UI into a swap/vaulting flow.
- **Recall State Machine**: Outside of rest, moving a card from Vault to Loadout queries the card's `recallCost` and transitions through a confirmation prompt verifying available unmarked Stress before marking the stress and swapping positions.
- **Advancement Slot Tracking**: Level-up progression tracks selected advancement checkboxes per tier (Tier 2: Levels 2–4; Tier 3: Levels 5–7; Tier 4: Levels 8–10), locking filled slots and enforcing the two-advancement cost for Proficiency and Multiclassing.
- **Trait Allocation Invariant**: Character creation requires assigning each value of `[+2, +1, +1, 0, 0, -1]` to exactly one trait.

### Module Boundaries
- **SRD Data Module**: Read-only query layer providing typed lookups by domain, level, class, and category.
- **Character Domain Engine**: Pure functions handling stat calculation, threshold shifts, proficiency scaling, advancement validation, and legal card filtering.
- **Theme Engine**: Reads theme JSON files and injects CSS custom properties into `:root` at runtime.
- **Wizard Controller**: Stateful multi-step orchestrator maintaining draft character state through the 8 creation stages before committing to the repository.
- **Sheet View & Trackers**: Highly reactive UI components binding to active character state with optimistic local updates.
- **Dice & Event Resolver**: Decoupled roller module supporting both manual result entry and virtual rolling with Hope/Fear comparison logic.

## Testing Decisions

### What Makes a Good Test
Tests must verify observable external behavior and game rule invariants from the user's perspective, rather than coupling to internal component state or private helper functions.

### Modules to Test
1. **Domain Engine / Rule Invariants**:
   - Class domain filtering: Druids can only access Arcana and Sage cards; Seraphs can only access Splendor and Valor cards.
   - Starting card selection: Only Level 1 domain cards can be picked at creation.
   - Loadout limits: Cannot exceed 5 active cards.
   - Recall mechanics: Moving a card from Vault to Loadout outside rest charges the exact Recall Cost in Stress; during rest, cost is 0.
   - Level-up progression: Tier 2 achievement grants +1 Proficiency and +2 Experience; Damage Thresholds increase by +1 at every level.
   - Trait advancement: A trait marked in a tier cannot be increased a second time in that same tier.
2. **Repository & Serialization**:
   - JSON export and re-import preserves full character integrity without data loss or schema drift.
3. **UI Interaction Flow (Testing Seam)**:
   - Creation wizard end-to-end flow: from blank draft to fully populated Character Sheet.
   - Level-up modal flow: selecting 2 advancements, picking a legal domain card, and committing updates to the sheet.

## Out of Scope
- Real-time multiplayer synchronization or live GM campaign room view (reserved for future cloud integration).
- Full VTT canvas with spatial battle maps and token movement.
- Automated combat adversary / monster stat block simulation.
- PDF generation/printing of physical character sheet (JSON export is supported).

## Further Notes
- The Duality Dice mechanic requires distinct visual styling for the Hope Die (gold/amber) and the Fear Die (mystic purple/crimson) with an immediate readout indicating success with Hope, success with Fear, failure with Hope, or failure with Fear.
- When House Rules mode is active, an unobtrusive banner is shown on the character sheet indicating manual editing is unlocked.
