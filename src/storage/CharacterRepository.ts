import { Character } from '../types/daggerheart';

export interface ICharacterRepository {
  getAll(): Promise<Character[]>;
  getById(id: string): Promise<Character | null>;
  save(character: Character): Promise<void>;
  delete(id: string): Promise<void>;
  getActiveId(): Promise<string | null>;
  setActiveId(id: string | null): Promise<void>;
  exportJSON(character: Character): string;
  importJSON(jsonStr: string): Character;
}

const STORAGE_KEY = 'daggerheart_roster_v1';
const ACTIVE_ID_KEY = 'daggerheart_active_character_id_v1';

export class LocalStorageCharacterRepository implements ICharacterRepository {
  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return null;
  }

  async getAll(): Promise<Character[]> {
    const storage = this.getStorage();
    if (!storage) return [];
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Character[];
    } catch {
      return [];
    }
  }

  async getById(id: string): Promise<Character | null> {
    const all = await this.getAll();
    return all.find((c) => c.id === id) || null;
  }

  async save(character: Character): Promise<void> {
    const all = await this.getAll();
    const existingIndex = all.findIndex((c) => c.id === character.id);
    const updated = {
      ...character,
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      all[existingIndex] = updated;
    } else {
      all.push(updated);
    }

    const storage = this.getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(all));
    }
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter((c) => c.id !== id);
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      const active = await this.getActiveId();
      if (active === id) {
        await this.setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
    }
  }

  async getActiveId(): Promise<string | null> {
    const storage = this.getStorage();
    if (!storage) return null;
    return storage.getItem(ACTIVE_ID_KEY);
  }

  async setActiveId(id: string | null): Promise<void> {
    const storage = this.getStorage();
    if (!storage) return;
    if (id) {
      storage.setItem(ACTIVE_ID_KEY, id);
    } else {
      storage.removeItem(ACTIVE_ID_KEY);
    }
  }

  exportJSON(character: Character): string {
    return JSON.stringify(character, null, 2);
  }

  importJSON(jsonStr: string): Character {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.name || !parsed.className || !parsed.traits) {
      throw new Error('Invalid Daggerheart character JSON file format');
    }
    // Ensure new unique ID on import to avoid collision
    return {
      ...parsed,
      id: `pc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      updatedAt: new Date().toISOString(),
    };
  }
}

export const characterRepository = new LocalStorageCharacterRepository();
