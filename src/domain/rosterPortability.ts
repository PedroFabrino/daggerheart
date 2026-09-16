import { Character } from '../types/daggerheart';

/**
 * Validates whether a parsed JSON object has all required fields of a Daggerheart Character.
 */
export function validateAndParseCharacterJson(jsonString: string): {
  valid: boolean;
  character?: Character;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString);

    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'File does not contain a valid JSON object.' };
    }

    // Required top-level fields
    const requiredFields = [
      'name',
      'className',
      'subclassName',
      'level',
      'traits',
      'hp',
      'stress',
      'hope',
      'armor',
      'damageThresholds',
      'loadout',
      'vault',
    ];

    for (const field of requiredFields) {
      if (!(field in data)) {
        return {
          valid: false,
          error: `Missing required character field: "${field}".`,
        };
      }
    }

    if (typeof data.name !== 'string' || !data.name.trim()) {
      return { valid: false, error: 'Character name must be a non-empty string.' };
    }

    if (typeof data.level !== 'number' || data.level < 1 || data.level > 10) {
      return { valid: false, error: 'Character level must be an integer between 1 and 10.' };
    }

    // Ensure clean ID and timestamps
    const character: Character = {
      ...data,
      id: `pc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      updatedAt: new Date().toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
    };

    return { valid: true, character };
  } catch (err: any) {
    return {
      valid: false,
      error: `Failed to parse JSON: ${err?.message || 'Invalid syntax'}`,
    };
  }
}

/**
 * Serializes a Character to formatted JSON for backup or export.
 */
export function exportCharacterToJson(character: Character): {
  filename: string;
  jsonString: string;
} {
  const cleanName = character.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const filename = `${cleanName || 'character'}_lvl${character.level}.json`;
  const jsonString = JSON.stringify(character, null, 2);

  return { filename, jsonString };
}

/**
 * Duplicates a character with a new ID, updated name, and fresh timestamps.
 */
export function duplicateCharacter(character: Character): Character {
  const timestamp = new Date().toISOString();
  return {
    ...character,
    id: `pc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${character.name} (Copy)`,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
