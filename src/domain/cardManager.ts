import { Character, DomainCard } from '../types/daggerheart';

export const MAX_LOADOUT_CARDS = 5;

export interface RecallCheckResult {
  allowed: boolean;
  reason?: string;
  stressCost: number;
}

/**
 * Checks whether a vaulted card can be recalled into the active loadout.
 * During downtime rest, swapping is completely free (0 Stress).
 * Outside rest, swapping costs Stress equal to the card's Recall Cost.
 */
export function canRecallCard(
  character: Character,
  card: DomainCard,
  isDowntimeRest: boolean = false
): RecallCheckResult {
  const stressCost = isDowntimeRest ? 0 : card.recallCost;
  const newStress = character.stress.current + stressCost;

  if (newStress > character.stress.max) {
    return {
      allowed: false,
      reason: `Not enough Stress slots! Recalling ${card.name} requires ${stressCost} Stress, but you only have ${
        character.stress.max - character.stress.current
      } unmarked slots.`,
      stressCost,
    };
  }

  return {
    allowed: true,
    stressCost,
  };
}

/**
 * Recalls a vaulted card into active loadout.
 * If loadout is full (5/5) and a replaced card is specified, moves replaced card to vault.
 * Marks stress if outside rest.
 */
export function swapVaultToLoadout(
  character: Character,
  vaultedCardId: string,
  replacedLoadoutCardId?: string,
  isDowntimeRest: boolean = false
): Character {
  const vaultedCard = character.vault.find((c) => c.id === vaultedCardId);
  if (!vaultedCard) return character;

  const check = canRecallCard(character, vaultedCard, isDowntimeRest);
  if (!check.allowed) return character;

  // New vault without the recalled card
  let nextVault = character.vault.filter((c) => c.id !== vaultedCardId);
  let nextLoadout = [...character.loadout];

  // If replacing an active card
  if (replacedLoadoutCardId) {
    const replacedCard = nextLoadout.find((c) => c.id === replacedLoadoutCardId);
    if (replacedCard) {
      nextLoadout = nextLoadout.filter((c) => c.id !== replacedLoadoutCardId);
      nextVault.push(replacedCard);
    }
  }

  // Add recalled card to loadout
  nextLoadout.push(vaultedCard);

  return {
    ...character,
    loadout: nextLoadout,
    vault: nextVault,
    stress: {
      ...character.stress,
      current: character.stress.current + check.stressCost,
    },
  };
}

/**
 * Freely moves an active card from Loadout into Vault.
 */
export function vaultLoadoutCard(character: Character, cardId: string): Character {
  const card = character.loadout.find((c) => c.id === cardId);
  if (!card) return character;

  return {
    ...character,
    loadout: character.loadout.filter((c) => c.id !== cardId),
    vault: [...character.vault, card],
  };
}
