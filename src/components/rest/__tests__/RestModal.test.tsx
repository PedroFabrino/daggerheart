import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestModal } from '../RestModal';
import { Character } from '../../../types/daggerheart';

const mockCharacter: Character = {
  id: 'pc-rest-modal-test',
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
  hp: { max: 6, currentDamage: 3 },
  stress: { max: 6, current: 4 },
  hope: { max: 6, current: 1 },
  armor: {
    equipped: null,
    score: 2,
    markedSlots: 2,
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

describe('RestModal Component - Ticket 06', () => {
  it('renders Short Rest moves and permits picking 2 moves', () => {
    const handleConfirm = vi.fn();
    render(
      <RestModal
        character={mockCharacter}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Downtime Rest')).toBeInTheDocument();
    expect(screen.getByText(/Short Rest \(Pick 2 Moves\)/i)).toBeInTheDocument();
    expect(screen.getByText('Tend Wounds')).toBeInTheDocument();
    expect(screen.getByText('Clear Stress')).toBeInTheDocument();
    expect(screen.getByText('Repair Armor')).toBeInTheDocument();
    expect(screen.getByText('Prepare')).toBeInTheDocument();

    // Select Tend Wounds
    fireEvent.click(screen.getByText('Tend Wounds'));
    // Select Clear Stress
    fireEvent.click(screen.getByText('Clear Stress'));

    // Apply Short Rest
    const applyBtn = screen.getByRole('button', { name: /apply short rest/i });
    fireEvent.click(applyBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    const updated: Character = handleConfirm.mock.calls[0][0];
    // Recovered HP damage and stress
    expect(updated.hp.currentDamage).toBeLessThan(3);
    expect(updated.stress.current).toBeLessThan(4);
  });

  it('allows toggling between digital rolling and manual physical dice entry', () => {
    render(
      <RestModal
        character={mockCharacter}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />
    );

    const manualBtn = screen.getByRole('button', {
      name: /physical die \(manual\)/i,
    });
    fireEvent.click(manualBtn);

    expect(manualBtn.className).toContain('bg-domain-sage');
  });

  it('switches to Long Rest and clears all marked vitals', () => {
    const handleConfirm = vi.fn();
    render(
      <RestModal
        character={mockCharacter}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
      />
    );

    // Click Long Rest
    const longRestTab = screen.getByRole('button', {
      name: /long rest \(full recovery\)/i,
    });
    fireEvent.click(longRestTab);

    expect(
      screen.getByText(/Full Long Rest Restoration:/i)
    ).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /apply long rest/i });
    fireEvent.click(applyBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    const updated: Character = handleConfirm.mock.calls[0][0];
    expect(updated.hp.currentDamage).toBe(0);
    expect(updated.stress.current).toBe(0);
    expect(updated.armor.markedSlots).toBe(0);
    expect(updated.hope.current).toBe(2); // Was 1, reset to 2
  });
});
