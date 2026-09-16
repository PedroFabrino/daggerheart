import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterRosterDrawer } from '../CharacterRosterDrawer';
import { Character } from '../../../types/daggerheart';

const {
  mockChar1,
  mockChar2,
  mockSelect,
  mockDelete,
  mockDuplicate,
  mockImport,
  mockStartCreation,
} = vi.hoisted(() => {
  const c1: Character = {
    id: 'char-1',
    name: 'Aiden Swift',
    pronouns: 'he/him',
    level: 1,
    className: 'Ranger',
    subclassName: 'Wayfinder',
    subclassCardState: 'foundation',
    heritage: {
      ancestryName: 'Elf',
      isMixedAncestry: false,
      ancestryFeatures: [],
      communityName: 'Wildborne',
      communityFeature: { name: 'Wild Forager', text: 'Forage' },
    },
    traits: {
      Agility: 2,
      Strength: 1,
      Finesse: 1,
      Instinct: 0,
      Presence: 0,
      Knowledge: -1,
    },
    markedTraitsThisTier: [],
    evasion: 11,
    hp: { max: 6, currentDamage: 0 },
    stress: { max: 6, current: 0 },
    hope: { max: 6, current: 2 },
    armor: {
      equipped: null,
      score: 2,
      markedSlots: 0,
      maxSlots: 2,
    },
    damageThresholds: { minor: 5, major: 10, severe: 11 },
    proficiency: 1,
    experiences: [],
    weapons: { primary: null, secondary: null },
    loadout: [],
    vault: [],
    inventory: [],
    gold: { handfuls: 0, bags: 0, chests: 0 },
    advancementHistory: [],
    backgroundNotes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const c2: Character = {
    ...c1,
    id: 'char-2',
    name: 'Kael Ironclad',
    className: 'Warrior',
    level: 2,
  };

  return {
    mockChar1: c1,
    mockChar2: c2,
    mockSelect: vi.fn(),
    mockDelete: vi.fn(),
    mockDuplicate: vi.fn(),
    mockImport: vi.fn(),
    mockStartCreation: vi.fn(),
  };
});

vi.mock('../../../context/CharacterContext', () => ({
  useCharacter: () => ({
    characters: [mockChar1, mockChar2],
    activeId: 'char-1',
    selectActiveCharacter: mockSelect,
    deleteCharacter: mockDelete,
    duplicateCharacter: mockDuplicate,
    importCharacterJSON: mockImport,
    startCreation: mockStartCreation,
  }),
}));

vi.mock('../../context/CharacterContext', () => ({
  useCharacter: () => ({
    characters: [mockChar1, mockChar2],
    activeId: 'char-1',
    selectActiveCharacter: mockSelect,
    deleteCharacter: mockDelete,
    duplicateCharacter: mockDuplicate,
    importCharacterJSON: mockImport,
    startCreation: mockStartCreation,
  }),
}));

describe('CharacterRosterDrawer Component - Ticket 07', () => {
  it('renders character roster with active character and non-active characters', () => {
    render(<CharacterRosterDrawer isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Character Roster')).toBeInTheDocument();
    expect(screen.getByText('Aiden Swift')).toBeInTheDocument();
    expect(screen.getByText('Kael Ironclad')).toBeInTheDocument();
    expect(screen.getByText('Playing')).toBeInTheDocument(); // active badge for Aiden
    expect(screen.getByRole('button', { name: /switch/i })).toBeInTheDocument();
  });

  it('allows switching active character', () => {
    render(<CharacterRosterDrawer isOpen={true} onClose={vi.fn()} />);

    const switchBtn = screen.getByRole('button', { name: /switch/i });
    fireEvent.click(switchBtn);

    expect(mockSelect).toHaveBeenCalledWith('char-2');
  });

  it('allows duplicating a character', () => {
    render(<CharacterRosterDrawer isOpen={true} onClose={vi.fn()} />);

    const dupBtns = screen.getAllByTitle(/duplicate character/i);
    fireEvent.click(dupBtns[0]);

    expect(mockDuplicate).toHaveBeenCalledWith('char-1');
  });

  it('prompts confirmation before deleting character', () => {
    render(<CharacterRosterDrawer isOpen={true} onClose={vi.fn()} />);

    const deleteBtns = screen.getAllByTitle(/delete character/i);
    fireEvent.click(deleteBtns[0]);

    // Confirmation button appears
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    expect(confirmBtn).toBeInTheDocument();

    fireEvent.click(confirmBtn);
    expect(mockDelete).toHaveBeenCalledWith('char-1');
  });
});
