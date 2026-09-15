/**
 * Scales weapon damage dice by player Proficiency.
 * E.g., 'd8 phy' at Proficiency 1 -> '1d8 phy'
 * E.g., 'd8 phy' at Proficiency 2 -> '2d8 phy'
 * E.g., '2d6 mag' at Proficiency 2 -> '4d6 mag'
 * E.g., 'd10+2 mag' at Proficiency 2 -> '2d10+2 mag'
 */
export function calculateWeaponDamage(damageString: string, proficiency: number): string {
  if (!damageString || proficiency <= 0) return damageString;

  // Regex to match: (optional base dice count) d (sides) (optional mod like +2 or -1) (optional damage type)
  const regex = /^(\d*)d(\d+)([+-]\d+)?(\s+[a-zA-Z]+)?$/i;
  const match = damageString.trim().match(regex);

  if (!match) {
    // If not matching standard format, prepend proficiency if starts with 'd'
    if (damageString.trim().startsWith('d')) {
      return `${proficiency}${damageString.trim()}`;
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
