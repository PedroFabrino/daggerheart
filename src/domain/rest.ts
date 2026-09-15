import { Character } from '../types/daggerheart';

export type ShortRestMoveType =
  | 'tend_wounds'
  | 'clear_stress'
  | 'repair_armor'
  | 'prepare';

export interface ShortRestMove {
  type: ShortRestMoveType;
  amount: number; // Amount rolled or manually inputted
}

/**
 * Applies a Short Rest with up to 2 downtime moves.
 */
export function applyShortRest(
  character: Character,
  moves: ShortRestMove[]
): Character {
  let nextHpDamage = character.hp.currentDamage;
  let nextStressCurrent = character.stress.current;
  let nextArmorMarked = character.armor.markedSlots;
  let nextHopeCurrent = character.hope.current;

  for (const move of moves) {
    switch (move.type) {
      case 'tend_wounds':
        nextHpDamage = Math.max(0, nextHpDamage - move.amount);
        break;
      case 'clear_stress':
        nextStressCurrent = Math.max(0, nextStressCurrent - move.amount);
        break;
      case 'repair_armor':
        nextArmorMarked = Math.max(0, nextArmorMarked - move.amount);
        break;
      case 'prepare':
        nextHopeCurrent = Math.min(character.hope.max, nextHopeCurrent + 1);
        break;
    }
  }

  return {
    ...character,
    hp: {
      ...character.hp,
      currentDamage: nextHpDamage,
    },
    stress: {
      ...character.stress,
      current: nextStressCurrent,
    },
    armor: {
      ...character.armor,
      markedSlots: nextArmorMarked,
    },
    hope: {
      ...character.hope,
      current: nextHopeCurrent,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Applies a Long Rest:
 * - Clears all marked HP (currentDamage = 0)
 * - Clears all marked Stress (current = 0)
 * - Clears all marked Armor slots (markedSlots = 0)
 * - Resets Hope to at least 2 (if below 2)
 */
export function applyLongRest(character: Character): Character {
  return {
    ...character,
    hp: {
      ...character.hp,
      currentDamage: 0,
    },
    stress: {
      ...character.stress,
      current: 0,
    },
    armor: {
      ...character.armor,
      markedSlots: 0,
    },
    hope: {
      ...character.hope,
      current: Math.max(2, character.hope.current),
    },
    updatedAt: new Date().toISOString(),
  };
}
