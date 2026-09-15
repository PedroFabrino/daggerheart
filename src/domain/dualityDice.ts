import { TraitName } from '../types/daggerheart';

export interface DualityRollResult {
  hopeDie: number; // 1-12
  fearDie: number; // 1-12
  traitName?: TraitName;
  traitModifier: number;
  experienceBonus: number;
  total: number;
  isCritical: boolean; // Hope === Fear
  outcome: 'hope' | 'fear' | 'critical';
  description: string;
}

/**
 * Calculates outcome of a Duality Roll given 1d12 Hope and 1d12 Fear.
 */
export function calculateDualityRoll(
  hopeDie: number,
  fearDie: number,
  traitModifier: number = 0,
  experienceBonus: number = 0,
  traitName?: TraitName
): DualityRollResult {
  const total = hopeDie + fearDie + traitModifier + experienceBonus;
  const isCritical = hopeDie === fearDie;

  let outcome: 'hope' | 'fear' | 'critical' = 'hope';
  let description = '';

  if (isCritical) {
    outcome = 'critical';
    description = `Critical Success! Both dice rolled ${hopeDie}. Gain 1 Hope and clear 1 Stress!`;
  } else if (hopeDie > fearDie) {
    outcome = 'hope';
    description = `Rolled with Hope (${hopeDie} Hope vs ${fearDie} Fear). You gain 1 Hope!`;
  } else {
    outcome = 'fear';
    description = `Rolled with Fear (${fearDie} Fear vs ${hopeDie} Hope). The GM gains 1 Fear.`;
  }

  return {
    hopeDie,
    fearDie,
    traitName,
    traitModifier,
    experienceBonus,
    total,
    isCritical,
    outcome,
    description,
  };
}

/**
 * Parses and rolls weapon damage dice scaled by character proficiency.
 * Example: "d8 phy" at proficiency 2 rolls 2d8 damage!
 */
export function calculateWeaponDamageRoll(
  damageFormula: string, // e.g. "d8 phy" or "d10+2 mag"
  proficiency: number = 1
): {
  diceCount: number;
  dieSides: number;
  flatBonus: number;
  rolls: number[];
  totalDamage: number;
  damageType: string;
} {
  // Extract formula: [count]d[sides][+bonus] [type]
  const match = damageFormula.match(/(?:(\d+)?d(\d+))(?:\+(\d+))?\s*(.*)/i);

  let baseCount = 1;
  let dieSides = 8;
  let flatBonus = 0;
  let damageType = 'Physical';

  if (match) {
    baseCount = match[1] ? parseInt(match[1], 10) : 1;
    dieSides = parseInt(match[2], 10) || 8;
    flatBonus = match[3] ? parseInt(match[3], 10) : 0;
    damageType = match[4]?.trim() || 'Physical';
  }

  // Damage dice count scales with proficiency: proficiency * baseCount
  const totalDice = Math.max(1, proficiency * baseCount);
  const rolls: number[] = [];

  for (let i = 0; i < totalDice; i++) {
    rolls.push(Math.floor(Math.random() * dieSides) + 1);
  }

  const diceSum = rolls.reduce((acc, r) => acc + r, 0);
  const totalDamage = diceSum + flatBonus;

  return {
    diceCount: totalDice,
    dieSides,
    flatBonus,
    rolls,
    totalDamage,
    damageType,
  };
}
