import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DualityDiceModal } from '../DualityDiceModal';
import { Character } from '../../../types/daggerheart';

const mockCharacter: Character = {
  id: 'pc-dice-modal-test',
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
  proficiency: 2,
  experiences: [{ id: 'exp-1', name: 'Archery', bonus: 1 }],
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

describe('DualityDiceModal Component - Ticket 06', () => {
  it('renders Duality Dice roller with digital and physical mode options', () => {
    render(<DualityDiceModal character={mockCharacter} onClose={vi.fn()} />);

    expect(screen.getByText('Duality Dice Roller')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /digital roller/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /enter physical roll/i })
    ).toBeInTheDocument();
  });

  it('supports entering physical dice values and calculates Hope/Fear outcome', () => {
    render(<DualityDiceModal character={mockCharacter} onClose={vi.fn()} />);

    // Switch to physical mode
    fireEvent.click(screen.getByRole('button', { name: /enter physical roll/i }));

    expect(screen.getByText(/Hope Die \(1-12\):/i)).toBeInTheDocument();
    expect(screen.getByText(/Fear Die \(1-12\):/i)).toBeInTheDocument();

    // Click calculate
    const calcBtn = screen.getByRole('button', { name: /calculate result/i });
    fireEvent.click(calcBtn);

    // Shows total and outcome
    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    expect(screen.getByText(/Roll with Hope/i)).toBeInTheDocument();
  });

  it('supports weapon damage roll scaled by proficiency', () => {
    render(
      <DualityDiceModal
        character={mockCharacter}
        onClose={vi.fn()}
        initialWeaponDamage="d8 phy"
      />
    );

    const rollDmgBtn = screen.getByRole('button', { name: /roll damage/i });
    fireEvent.click(rollDmgBtn);

    expect(screen.getByText(/Rolled 2d8/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Damage/i)).toBeInTheDocument();
  });

  it('allows unchecking proficiency scaling to roll exact formula (e.g. 1d8)', () => {
    render(
      <DualityDiceModal
        character={mockCharacter}
        onClose={vi.fn()}
        initialWeaponDamage="1d8+4 phy"
      />
    );

    // Toggle off proficiency scaling
    const scaleCheckbox = screen.getByRole('checkbox');
    fireEvent.click(scaleCheckbox);

    const rollDmgBtn = screen.getByRole('button', { name: /roll damage/i });
    fireEvent.click(rollDmgBtn);

    expect(screen.getByText(/Rolled 1d8/i)).toBeInTheDocument();
  });
});
