import { getClass } from '../data/srdService';

/**
 * Scales weapon damage dice by player Proficiency.
 * E.g., 'd8 phy' at Proficiency 1 -> '1d8 phy'
 * E.g., 'd8 phy' at Proficiency 2 -> '2d8 phy'
 * E.g., '2d6 mag' at Proficiency 2 -> '4d6 mag'
 * E.g., 'd10+2 mag' at Proficiency 2 -> '2d10+2 mag'
 */
export function calculateWeaponDamage(damageString: string, proficiency: number): string {
  if (!damageString || proficiency <= 0) return damageString;

  // Check for composite dice pattern, e.g. "d8+d6 phy" or "2d8+1d6+2 phy"
  // If string contains multiple dice terms separated by +
  const trimmed = damageString.trim();
  const typeMatch = trimmed.match(/\s+([a-zA-Z]+)$/);
  const damageType = typeMatch ? typeMatch[1] : '';
  const exprWithoutType = typeMatch ? trimmed.slice(0, -typeMatch[0].length).trim() : trimmed;

  if (exprWithoutType.includes('+d') || exprWithoutType.includes('-d')) {
    // Split on + or - while keeping delimiters
    const parts = exprWithoutType.split(/([+-])/);
    let result = '';
    let currentSign = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part === '+' || part === '-') {
        currentSign = part;
      } else if (part) {
        const dMatch = part.match(/^(\d*)d(\d+)$/i);
        if (dMatch) {
          const count = dMatch[1] ? parseInt(dMatch[1], 10) : 1;
          const scaled = count * proficiency;
          result += (result ? ` ${currentSign} ` : '') + `${scaled}d${dMatch[2]}`;
        } else {
          result += (result ? ` ${currentSign} ` : '') + part;
        }
      }
    }

    return damageType ? `${result} ${damageType}` : result;
  }

  // Regex to match: (optional base dice count) d (sides) (optional mod like +2 or -1) (optional damage type)
  const regex = /^(\d*)d(\d+)([+-]\d+)?(\s+[a-zA-Z]+)?$/i;
  const match = trimmed.match(regex);

  if (!match) {
    if (trimmed.startsWith('d')) {
      return `${proficiency}${trimmed}`;
    }
    return damageString;
  }

  const baseCount = match[1] ? parseInt(match[1], 10) : 1;
  const sides = match[2];
  const mod = match[3] || '';
  const type = match[4] || '';

  const totalDice = baseCount * proficiency;
  return `${totalDice}d${sides}${mod}${type}`;
}

export type DamageSeverity = 'None' | 'Minor' | 'Major' | 'Severe';

export interface DamageEvaluation {
  severity: DamageSeverity;
  hpDamage: number;
}

/**
 * Calculates damage severity and marked HP based on Daggerheart damage thresholds.
 * - Under minor: 0 HP damage
 * - Minor to Major - 1: 1 HP damage
 * - Major to Severe - 1: 2 HP damage
 * - Severe or higher: 3 HP damage
 */
export function calculateDamageSeverity(
  incomingDamage: number,
  thresholds: { minor: number; major: number; severe: number }
): DamageEvaluation {
  if (incomingDamage < thresholds.minor) {
    return { severity: 'None', hpDamage: 0 };
  }
  if (incomingDamage < thresholds.major) {
    return { severity: 'Minor', hpDamage: 1 };
  }
  if (incomingDamage < thresholds.severe) {
    return { severity: 'Major', hpDamage: 2 };
  }
  return { severity: 'Severe', hpDamage: 3 };
}

/**
 * Reduces incoming damage severity by a number of thresholds when marking Armor Slots.
 * Per Daggerheart SRD:
 * "When you take damage, you can mark one Armor Slot to reduce the severity of the damage
 * by one threshold (Severe to Major, Major to Minor, Minor to Nothing)."
 */
export function reduceSeverityByThreshold(
  evaluation: DamageEvaluation,
  steps: number = 1
): DamageEvaluation {
  if (steps <= 0 || evaluation.severity === 'None') return evaluation;

  const severityOrder: DamageSeverity[] = ['None', 'Minor', 'Major', 'Severe'];
  const currentIndex = severityOrder.indexOf(evaluation.severity);
  if (currentIndex <= 0) {
    return { severity: 'None', hpDamage: 0 };
  }

  const newIndex = Math.max(0, currentIndex - steps);
  const newSeverity = severityOrder[newIndex];

  return {
    severity: newSeverity,
    hpDamage: newIndex,
  };
}

/**
 * Returns the Daggerheart Tier (1 to 4) corresponding to a character's level (1 to 10).
 * - Tier 1: Level 1
 * - Tier 2: Levels 2–4
 * - Tier 3: Levels 5–7
 * - Tier 4: Levels 8–10
 */
export function getTierForLevel(level: number): number {
  if (level <= 1) return 1;
  if (level <= 4) return 2;
  if (level <= 7) return 3;
  return 4;
}

export interface StatBreakdownPart {
  source: string;
  value: number | string;
  details?: string;
}

export interface EvasionCalculationResult {
  total: number;
  breakdown: StatBreakdownPart[];
}

/**
 * Computes the full dynamic Evasion of a character with an itemized breakdown.
 * Considers:
 * - Starting Class Evasion
 * - Ancestry traits (e.g. Simiah Nimble +1)
 * - Level-up advancements (+1 Evasion picks)
 * - Equipped Armor modifiers (+1 Flexible, -1 Heavy, etc.)
 * - Equipped Weapons & Shields (+1, -1)
 * - Unarmed Brawler "I Am the Weapon" bonus (+1 if no active weapons)
 * - Active Domain Cards (e.g. Bone "Untouchable": half Agility rounded up)
 */
export function calculateEvasionBreakdown(
  character: {
    level: number;
    className: string;
    traits: Record<string, number>;
    heritage: {
      ancestryName: string;
      isMixedAncestry?: boolean;
      mixedSecondaryAncestryName?: string;
      ancestryFeatures?: { name: string; text: string }[];
    };
    advancementHistory?: { advancements: string[] }[];
    armor: {
      equipped: { name: string; features: { name: string; text: string }[] } | null;
    };
    weapons: {
      primary: { name: string; features: { name: string; text: string }[] } | null;
      secondary: { name: string; features: { name: string; text: string }[] } | null;
    };
    loadout?: { name: string; text: string }[];
    evasion?: number;
  },
  baseClassEvasion?: number
): EvasionCalculationResult {
  const breakdown: StatBreakdownPart[] = [];
  const classDef = getClass(character.className);
  const startingEvasion = baseClassEvasion ?? (classDef?.startingEvasion ?? 10);
  let total = startingEvasion;

  breakdown.push({
    source: `Base (${classDef?.name || character.className || 'Class'})`,
    value: `+${startingEvasion}`,
  });

  // 1. Ancestry features (e.g., Simiah Nimble)
  const ancestryFeatures = character.heritage.ancestryFeatures || [];
  const hasNimble = ancestryFeatures.some(
    (f) =>
      f.name?.toLowerCase() === 'nimble' ||
      f.text?.toLowerCase().includes('+1 bonus to your evasion')
  );
  const isPureSimiah =
    !character.heritage.isMixedAncestry &&
    character.heritage.ancestryName?.toLowerCase() === 'simiah';

  if (hasNimble || (ancestryFeatures.length === 0 && isPureSimiah)) {
    total += 1;
    breakdown.push({
      source: 'Ancestry (Simiah: Nimble)',
      value: '+1',
      details: 'Permanent +1 Evasion bonus',
    });
  }

  // 2. Level Up Advancements (+1 Evasion)
  let levelAdvancements = 0;
  if (character.advancementHistory) {
    character.advancementHistory.forEach((h) => {
      h.advancements?.forEach((adv) => {
        if (adv.toLowerCase().includes('evasion')) {
          levelAdvancements += 1;
        }
      });
    });
  }
  if (levelAdvancements > 0) {
    total += levelAdvancements;
    breakdown.push({
      source: `Level Up (${levelAdvancements}x Advancement)`,
      value: `+${levelAdvancements}`,
      details: '+1 Evasion selected during level up',
    });
  }

  // 3. Armor features
  if (character.armor.equipped) {
    character.armor.equipped.features.forEach((feat) => {
      const lower = feat.text.toLowerCase();
      if (lower.includes('+1 to evasion') || lower.includes('+1 evasion')) {
        total += 1;
        breakdown.push({
          source: `Armor (${character.armor.equipped!.name}: ${feat.name})`,
          value: '+1',
        });
      } else if (lower.includes('-1 to evasion') || lower.includes('-1 evasion')) {
        total -= 1;
        breakdown.push({
          source: `Armor (${character.armor.equipped!.name}: ${feat.name})`,
          value: '-1',
        });
      }
    });
  }

  // 4. Weapons & Shields
  [character.weapons.primary, character.weapons.secondary].forEach((w) => {
    if (w) {
      w.features.forEach((feat) => {
        const lower = feat.text.toLowerCase();
        if (lower.includes('+1 to evasion') || lower.includes('+1 evasion')) {
          total += 1;
          breakdown.push({
            source: `Weapon (${w.name}: ${feat.name})`,
            value: '+1',
          });
        } else if (lower.includes('-1 to evasion') || lower.includes('-1 evasion')) {
          total -= 1;
          breakdown.push({
            source: `Weapon (${w.name}: ${feat.name})`,
            value: '-1',
          });
        }
      });
    }
  });

  // 5. Brawler "I Am the Weapon" (+1 Evasion if unarmed or Brawler's Strike)
  const isBrawler = character.className?.toLowerCase() === 'brawler';
  const isUnarmed =
    (!character.weapons.primary && !character.weapons.secondary) ||
    (character.weapons.primary?.name?.toLowerCase().includes('brawler') && !character.weapons.secondary) ||
    (character.weapons.primary?.name?.toLowerCase().includes('unarmed') && !character.weapons.secondary);

  if (isBrawler && isUnarmed) {
    const alreadyFromWeapon = breakdown.some(
      (b) => b.source.includes('Brawler’s Strike') || b.source.includes('Brawlers Strike')
    );
    if (!alreadyFromWeapon) {
      total += 1;
      breakdown.push({
        source: 'Class Feature (I Am the Weapon)',
        value: '+1',
        details: 'Unarmed strike equipped',
      });
    }
  }

  // 6. Active Domain Cards (e.g. Untouchable: half Agility rounded up)
  const loadout = character.loadout || [];
  const untouchable = loadout.find((c) => c.name.toLowerCase() === 'untouchable');
  if (untouchable) {
    const agi = character.traits?.Agility || 0;
    const bonus = Math.ceil(agi / 2);
    if (bonus > 0) {
      total += bonus;
      breakdown.push({
        source: 'Domain Card (Untouchable)',
        value: `+${bonus}`,
        details: `Half of Agility (${agi}) rounded up`,
      });
    }
  }

  return { total, breakdown };
}

export interface ThresholdsCalculationResult {
  thresholds: { minor: number; major: number; severe: number };
  baseArmorScore: number;
  armorScore: number;
  maxArmorSlots: number;
  breakdown: StatBreakdownPart[];
  armorBreakdown: StatBreakdownPart[];
  isBareBones: boolean;
}

/**
 * Computes damage thresholds and armor score with an itemized breakdown.
 * Detects:
 * - Bare Bones ability card (Unarmored: 3 + Strength score, custom tier thresholds)
 * - Equipped armor base thresholds + level
 * - Subclass features (e.g. Juggernaut Rugged: +3 Severe threshold)
 */
export function calculateThresholdsBreakdown(
  character: {
    level: number;
    subclassName?: string;
    traits: Record<string, number>;
    proficiency?: number;
    heritage?: {
      ancestryName: string;
      isMixedAncestry?: boolean;
      mixedSecondaryAncestryName?: string;
      ancestryFeatures?: { name: string; text: string }[];
    };
    armor: {
      equipped: { name: string; baseScore: number; baseThresholds: [number, number] } | null;
      score: number;
      maxSlots: number;
    };
    advancementHistory?: { advancements: string[] }[];
    loadout?: { name: string; text: string }[];
  }
): ThresholdsCalculationResult {
  const breakdown: StatBreakdownPart[] = [];
  const armorBreakdown: StatBreakdownPart[] = [];
  const loadout = character.loadout || [];
  const hasBareBones = loadout.some((c) => c.name.toLowerCase() === 'bare bones');
  const isUnarmored = !character.armor.equipped;
  const tier = getTierForLevel(character.level);

  let minor = 6;
  let major = 12;
  let severe = 13;
  let baseArmorScore = character.armor.equipped ? character.armor.equipped.baseScore : 0;
  let isBareBones = false;

  // Level advancements for Armor Slot (+1 each)
  let armorAdvancements = 0;
  if (character.advancementHistory) {
    character.advancementHistory.forEach((h) => {
      h.advancements?.forEach((adv) => {
        if (adv.toLowerCase().includes('armor slot') || adv.toLowerCase().includes('+1 armor')) {
          armorAdvancements += 1;
        }
      });
    });
  }

  if (hasBareBones && isUnarmored) {
    isBareBones = true;
    const bareBonesTierMap: Record<number, [number, number]> = {
      1: [9, 19],
      2: [11, 24],
      3: [13, 31],
      4: [15, 38],
    };
    const [bMinor, bMajor] = bareBonesTierMap[tier] || [9, 19];
    minor = bMinor;
    major = bMajor;
    severe = bMajor + 1;

    const str = character.traits?.Strength || 0;
    baseArmorScore = 3 + str;

    breakdown.push({
      source: `Domain Card (Bare Bones - Tier ${tier})`,
      value: `Base: ${bMinor} / ${bMajor}`,
      details: 'Unarmored stance active (replaces standard armor)',
    });

    armorBreakdown.push({
      source: 'Bare Bones Base',
      value: '3',
      details: 'Base armor from Bare Bones ability',
    });
    armorBreakdown.push({
      source: 'Strength Trait',
      value: str >= 0 ? `+${str}` : `${str}`,
      details: `Strength score added to armor`,
    });
  } else if (character.armor.equipped) {
    const [bMinor, bMajor] = character.armor.equipped.baseThresholds || [5, 11];
    minor = bMinor + character.level;
    major = bMajor + character.level;
    severe = major + 1;

    breakdown.push({
      source: `Armor (${character.armor.equipped.name})`,
      value: `Base: ${bMinor} / ${bMajor}`,
      details: 'Base thresholds from equipped armor',
    });
    breakdown.push({
      source: 'Level Progression',
      value: `+${character.level} to Minor & Major`,
      details: 'Character level added to base thresholds',
    });

    armorBreakdown.push({
      source: `Armor (${character.armor.equipped.name})`,
      value: `${character.armor.equipped.baseScore}`,
      details: 'Base armor score from equipped armor',
    });
  } else {
    // Unarmored standard
    minor = 5 + character.level;
    major = 11 + character.level;
    severe = major + 1;
    breakdown.push({
      source: 'Standard Unarmored',
      value: 'Base: 5 / 11',
      details: 'Default unarmored base thresholds',
    });
    breakdown.push({
      source: 'Level Progression',
      value: `+${character.level} to Minor & Major`,
      details: 'Character level added to base thresholds',
    });

    armorBreakdown.push({
      source: 'Unarmored',
      value: '0',
      details: 'No armor equipped',
    });
  }

  // Check Galapa "Shell" feature (+Proficiency to damage thresholds)
  const ancestryFeatures = character.heritage?.ancestryFeatures || [];
  const hasShell =
    ancestryFeatures.some(
      (f) =>
        f.name?.toLowerCase().includes('shell') ||
        f.text?.toLowerCase().includes('damage thresholds equal to your proficiency')
    ) ||
    (!character.heritage?.isMixedAncestry &&
      character.heritage?.ancestryName?.toLowerCase().includes('galapa'));

  if (hasShell) {
    const profBonus =
      character.proficiency && character.proficiency > 0
        ? character.proficiency
        : Math.max(1, getTierForLevel(character.level));
    minor += profBonus;
    major += profBonus;
    severe += profBonus;
    breakdown.push({
      source: 'Ancestry (Galapa: Shell)',
      value: `+${profBonus} to all thresholds`,
      details: `Proficiency bonus (+${profBonus}) added to damage thresholds`,
    });
  }

  // Check Juggernaut "Rugged" feature (+3 Severe threshold)
  if (character.subclassName?.toLowerCase().includes('juggernaut')) {
    severe += 3;
    breakdown.push({
      source: 'Subclass (Juggernaut: Rugged)',
      value: '+3 to Severe',
      details: 'Severe damage threshold increased by 3',
    });
  }

  if (armorAdvancements > 0) {
    armorBreakdown.push({
      source: `Level Up (${armorAdvancements}x Armor Slot)`,
      value: `+${armorAdvancements}`,
      details: '+1 Armor Slot chosen during level up',
    });
  }

  const armorScore = baseArmorScore;
  const maxArmorSlots = baseArmorScore + armorAdvancements;

  return {
    thresholds: { minor, major, severe },
    baseArmorScore,
    armorScore,
    maxArmorSlots,
    breakdown,
    armorBreakdown,
    isBareBones,
  };
}

export interface ProficiencyCalculationResult {
  total: number;
  breakdown: StatBreakdownPart[];
}

/**
 * Computes Proficiency with an itemized breakdown.
 */
export function calculateProficiencyBreakdown(character: {
  proficiency: number;
  advancementHistory?: { advancements: string[] }[];
}): ProficiencyCalculationResult {
  const breakdown: StatBreakdownPart[] = [
    {
      source: 'Base Proficiency',
      value: '+1',
      details: 'Starting proficiency at Level 1',
    },
  ];

  let profAdvancements = 0;
  if (character.advancementHistory) {
    character.advancementHistory.forEach((h) => {
      h.advancements?.forEach((adv) => {
        if (adv.toLowerCase().includes('proficiency')) {
          profAdvancements += 1;
        }
      });
    });
  }

  if (profAdvancements > 0) {
    breakdown.push({
      source: `Level Up (${profAdvancements}x Advancement)`,
      value: `+${profAdvancements}`,
      details: 'Proficiency increase chosen during level up',
    });
  } else if (character.proficiency > 1) {
    const diff = character.proficiency - 1;
    breakdown.push({
      source: 'Bonus / Progression',
      value: `+${diff}`,
      details: 'Current proficiency bonus',
    });
  }

  return {
    total: character.proficiency,
    breakdown,
  };
}


