import React, { createContext, useContext, useEffect, useState } from 'react';
import { Character } from '../types/daggerheart';
import { CharacterDraft, buildStartingCharacter } from '../domain/characterCreation';
import { duplicateCharacter as cloneCharacter } from '../domain/rosterPortability';
import { characterRepository } from '../storage/CharacterRepository';

interface CharacterContextType {
  characters: Character[];
  activeCharacter: Character | null;
  activeId: string | null;
  isCreating: boolean;
  isLoading: boolean;
  isHouseRulesEnabled: boolean;
  startCreation: () => void;
  cancelCreation: () => void;
  saveDraftAsNewCharacter: (draft: CharacterDraft) => Promise<Character>;
  updateActiveCharacter: (updater: (prev: Character) => Character) => Promise<void>;
  selectActiveCharacter: (id: string) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  exportActiveCharacter: () => string | null;
  importCharacterJSON: (jsonStr: string) => Promise<Character>;
  duplicateCharacter: (id: string) => Promise<Character>;
  toggleHouseRules: () => void;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export const CharacterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHouseRulesEnabled, setIsHouseRulesEnabled] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const all = await characterRepository.getAll();
        setCharacters(all);

        const savedActiveId = await characterRepository.getActiveId();
        if (savedActiveId && all.some((c) => c.id === savedActiveId)) {
          setActiveIdState(savedActiveId);
        } else if (all.length > 0) {
          setActiveIdState(all[0].id);
          await characterRepository.setActiveId(all[0].id);
        } else {
          // If no characters exist, prompt creation
          setIsCreating(true);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeCharacter = characters.find((c) => c.id === activeId) || null;

  const startCreation = () => setIsCreating(true);
  const cancelCreation = () => {
    if (characters.length > 0) {
      setIsCreating(false);
    }
  };

  const saveDraftAsNewCharacter = async (draft: CharacterDraft): Promise<Character> => {
    const character = buildStartingCharacter(draft);
    await characterRepository.save(character);
    await characterRepository.setActiveId(character.id);

    const all = await characterRepository.getAll();
    setCharacters(all);
    setActiveIdState(character.id);
    setIsCreating(false);
    return character;
  };

  const updateActiveCharacter = async (updater: (prev: Character) => Character) => {
    if (!activeCharacter) return;
    const updated = updater(activeCharacter);
    await characterRepository.save(updated);

    setCharacters((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const selectActiveCharacter = async (id: string) => {
    await characterRepository.setActiveId(id);
    setActiveIdState(id);
    setIsCreating(false);
  };

  const deleteCharacter = async (id: string) => {
    await characterRepository.delete(id);
    const all = await characterRepository.getAll();
    setCharacters(all);

    const nextActiveId = await characterRepository.getActiveId();
    setActiveIdState(nextActiveId);

    if (all.length === 0) {
      setIsCreating(true);
    }
  };

  const exportActiveCharacter = (): string | null => {
    if (!activeCharacter) return null;
    return characterRepository.exportJSON(activeCharacter);
  };

  const importCharacterJSON = async (jsonStr: string): Promise<Character> => {
    const imported = characterRepository.importJSON(jsonStr);
    await characterRepository.save(imported);
    await characterRepository.setActiveId(imported.id);

    const all = await characterRepository.getAll();
    setCharacters(all);
    setActiveIdState(imported.id);
    setIsCreating(false);
    return imported;
  };

  const duplicateCharacterAction = async (id: string): Promise<Character> => {
    const target = characters.find((c) => c.id === id);
    if (!target) throw new Error('Character not found');
    const copy = cloneCharacter(target);
    await characterRepository.save(copy);
    await characterRepository.setActiveId(copy.id);

    const all = await characterRepository.getAll();
    setCharacters(all);
    setActiveIdState(copy.id);
    return copy;
  };

  const toggleHouseRules = () => setIsHouseRulesEnabled((prev) => !prev);

  return (
    <CharacterContext.Provider
      value={{
        characters,
        activeCharacter,
        activeId,
        isCreating,
        isLoading,
        isHouseRulesEnabled,
        startCreation,
        cancelCreation,
        saveDraftAsNewCharacter,
        updateActiveCharacter,
        selectActiveCharacter,
        deleteCharacter,
        exportActiveCharacter,
        importCharacterJSON,
        duplicateCharacter: duplicateCharacterAction,
        toggleHouseRules,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};
