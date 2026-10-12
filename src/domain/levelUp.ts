import {
  Character,
  DomainCard,
  TraitName,
  CharacterAdvancementRecord,
} from '../types/daggerheart';
import { getTierForLevel } from './combatMath';

export type AdvancementType =
  | 'trait'
  | 'hp'
  | 'stress'
  | 'hope'
  | 'evasion'
  | 'armor_slot'
  | 'experience'
  | 'proficiency';

export interface AdvancementOption {
  id: string;
  type: AdvancementType;
  title: string;
  description: string;
  slotsCost: number; // 1 or 2
  trait?: TraitName;
}

export interface LevelUpPayload {
  advancements: {
    type: AdvancementType;
    slotsCost: number;
    trait?: TraitName;
    experienceId?: string;
    newExperienceName?: string;
  }[];
  newCard: DomainCard;
  cardExchange?: {
    returnCardId: string;
    replacementCard: DomainCard;
  };
  tierExperienceAllocations?: {
    experienceId?: string;
    newExperienceName?: string;
    bonusAmount: number; // e.g. +1 or +2
  }[];
  houseRulesOverride?: boolean;
}

/**
 * Checks if a given level grants a Tier Achievement (Levels 2, 5, 8).
 */
export function isTierAchievementLevel(level: number): boolean {
  return level === 2 || level === 5 || level === 8;
}

/**
 * Validates advancement selections:
 * - Must equal exactly 2 slots (unless houseRulesOverride is true).
 * - Cannot select a trait that is already marked in markedTraitsThisTier.
 * - Cannot select the same trait twice in the same level up.
 */
export function validateAdvancements(
  character: Character,
  advancements: LevelUpPayload['advancements'],
  houseRulesOverride: boolean = false
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (houseRulesOverride) {
    return { valid: true, errors: [] };
  }

  const totalSlots = advancements.reduce((sum, a) => sum + a.slotsCost, 0);
  if (totalSlots !== 2) {
    errors.push(`Must select advancements totaling exactly 2 slots (currently selected: ${totalSlots}).`);
  }

  const traitsChosen = advancements
    .filter((a) => a.type === 'trait' && a.trait)
    .map((a) => a.trait as TraitName);

  // Check duplicate trait selections in this level-up
  const uniqueTraits = new Set(traitsChosen);
  if (uniqueTraits.size < traitsChosen.length) {
    errors.push('Cannot choose the same trait advancement more than once in the same level-up.');
  }

  // Check if trait is already marked this tier
  for (const t of traitsChosen) {
    if (character.markedTraitsThisTier.includes(t)) {
      errors.push(
        `Trait "${t}" has already been marked in Tier ${getTierForLevel(
          character.level
        )}. It cannot be marked again until the next tier achievement.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Pure function to apply a complete level-up to a Character.
 */
export function applyLevelUp(
  character: Character,
  payload: LevelUpPayload
): Character {
  const newLevel = character.level + 1;
  const newTier = getTierForLevel(newLevel);
  const isTierAchieve = isTierAchievementLevel(newLevel);

  // 1. Thresholds automatically increase by +1
  const nextThresholds = {
    minor: character.damageThresholds.minor + 1,
    major: character.damageThresholds.major + 1,
    severe: character.damageThresholds.severe + 1,
  };

  // 2. Proficiency and Subclass state
  let nextProficiency = character.proficiency;
  let nextSubclassCardState = character.subclassCardState;
  let nextMarkedTraitsThisTier = isTierAchieve ? [] : [...character.markedTraitsThisTier];

  if (isTierAchieve) {
    nextProficiency += 1;
    if (newLevel === 5) {
      nextSubclassCardState = 'specialization';
    } else if (newLevel === 8) {
      nextSubclassCardState = 'mastery';
    }
  }

  // Clone traits and stats to update with advancements
  const nextTraits = { ...character.traits };
  const nextHp = { ...character.hp };
  const nextStress = { ...character.stress };
  const nextHope = { ...character.hope };
  let nextEvasion = character.evasion;
  const nextArmor = {
    ...character.armor,
    maxSlots: character.armor.maxSlots,
  };
  let nextExperiences = [...character.experiences];

  // 3. Apply Tier Achievement Experience allocations (if any)
  if (payload.tierExperienceAllocations) {
    for (const alloc of payload.tierExperienceAllocations) {
      if (alloc.experienceId) {
        nextExperiences = nextExperiences.map((exp) =>
          exp.id === alloc.experienceId
            ? { ...exp, bonus: exp.bonus + alloc.bonusAmount }
            : exp
        );
      } else if (alloc.newExperienceName) {
        nextExperiences.push({
          id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: alloc.newExperienceName,
          bonus: alloc.bonusAmount,
        });
      }
    }
  }

  // 4. Apply Advancements
  const advancementNames: string[] = [];

  for (const adv of payload.advancements) {
    switch (adv.type) {
      case 'trait':
        if (adv.trait) {
          nextTraits[adv.trait] = (nextTraits[adv.trait] || 0) + 1;
          if (!nextMarkedTraitsThisTier.includes(adv.trait)) {
            nextMarkedTraitsThisTier.push(adv.trait);
          }
          advancementNames.push(`+1 ${adv.trait}`);
        }
        break;

      case 'hp':
        nextHp.max += 1;
        advancementNames.push('+1 Max HP');
        break;

      case 'stress':
        nextStress.max += 1;
        advancementNames.push('+1 Max Stress');
        break;

      case 'hope':
        nextHope.max += 1;
        advancementNames.push('+1 Max Hope');
        break;

      case 'evasion':
        nextEvasion += 1;
        advancementNames.push('+1 Evasion');
        break;

      case 'armor_slot':
        nextArmor.maxSlots += 1;
        advancementNames.push('+1 Armor Slot');
        break;

      case 'proficiency':
        nextProficiency += 1;
        advancementNames.push('+1 Proficiency');
        break;

      case 'experience':
        if (adv.experienceId) {
          nextExperiences = nextExperiences.map((exp) =>
            exp.id === adv.experienceId ? { ...exp, bonus: exp.bonus + 1 } : exp
          );
          const found = character.experiences.find((e) => e.id === adv.experienceId);
          advancementNames.push(`+1 to ${found?.name || 'Experience'}`);
        } else if (adv.newExperienceName) {
          nextExperiences.push({
            id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: adv.newExperienceName,
            bonus: 2,
          });
          advancementNames.push(`New Experience: ${adv.newExperienceName}`);
        }
        break;
    }
  }

  // If character has Galapa's Shell, any Proficiency gain also increases damage thresholds
  const ancestryFeatures = character.heritage?.ancestryFeatures || [];
  const hasShell =
    ancestryFeatures.some(
      (f) =>
        f.name?.toLowerCase().includes('shell') ||
        f.text?.toLowerCase().includes('damage thresholds equal to your proficiency')
    ) ||
    (!character.heritage?.isMixedAncestry &&
      character.heritage?.ancestryName?.toLowerCase().includes('galapa'));

  if (hasShell && nextProficiency > character.proficiency) {
    const profGain = nextProficiency - character.proficiency;
    nextThresholds.minor += profGain;
    nextThresholds.major += profGain;
    nextThresholds.severe += profGain;
  }

  // 5. Apply Domain Card acquisition & exchange
  let nextLoadout = [...character.loadout];
  let nextVault = [...character.vault];

  // Optional card exchange
  if (payload.cardExchange) {
    const { returnCardId, replacementCard } = payload.cardExchange;
    const inLoadout = nextLoadout.find((c) => c.id === returnCardId);
    if (inLoadout) {
      nextLoadout = nextLoadout.filter((c) => c.id !== returnCardId);
      nextLoadout.push(replacementCard);
    } else {
      nextVault = nextVault.filter((c) => c.id !== returnCardId);
      nextVault.push(replacementCard);
    }
  }

  // Add new card to loadout if room, else vault
  if (nextLoadout.length < 5) {
    nextLoadout.push(payload.newCard);
  } else {
    nextVault.push(payload.newCard);
  }

  // Record history
  const record: CharacterAdvancementRecord = {
    tier: newTier,
    level: newLevel,
    advancements: advancementNames,
    markedTraits: [...nextMarkedTraitsThisTier],
  };

  return {
    ...character,
    level: newLevel,
    proficiency: nextProficiency,
    subclassCardState: nextSubclassCardState,
    damageThresholds: nextThresholds,
    traits: nextTraits,
    markedTraitsThisTier: nextMarkedTraitsThisTier,
    hp: nextHp,
    stress: nextStress,
    hope: nextHope,
    evasion: nextEvasion,
    armor: nextArmor,
    experiences: nextExperiences,
    loadout: nextLoadout,
    vault: nextVault,
    advancementHistory: [...(character.advancementHistory || []), record],
    updatedAt: new Date().toISOString(),
  };
}
