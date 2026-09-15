import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LevelUpModal } from '../LevelUpModal';
import { Character } from '../../../types/daggerheart';

const mockCharacter: Character = {
  id: 'pc-lvl-modal-test',
  name: 'Aiden Swift',
  pronouns: 'he/him',
  level: 1,
  className: 'Ranger',
  subclassName: 'Wayfinder',
  subclassCardState: 'foundation',
  heritage: {
    ancestryName: 'Elf',
    isMixedAncestry: false,
    ancestryFeatures: [{ name: 'Keen Senses', text: 'Perceive' }],
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
  markedTraitsThisTier: ['Strength'],
  evasion: 11,
  hp: { max: 6, currentDamage: 0 },
  stress: { max: 6, current: 0 },
  hope: { max: 6, current: 2 },
  armor: {
    equipped: null,
    score: 0,
    markedSlots: 0,
    maxSlots: 2,
  },
  damageThresholds: { minor: 5, major: 10, severe: 11 },
  proficiency: 1,
  experiences: [{ id: 'exp-1', name: 'Tracking', bonus: 2 }],
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

describe('LevelUpModal Component - Ticket 05', () => {
  it('renders Step 1 for Tier Achievement when leveling from 1 to 2', () => {
    render(
      <LevelUpModal
        character={mockCharacter}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
        isHouseRulesEnabled={false}
        onToggleHouseRules={vi.fn()}
      />
    );

    expect(screen.getByText(/Level Up: Level 1 → Level 2/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Tier 2 Milestone Achievement Unlocked!/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Allocate \+2 Experience Bonus:/i)).toBeInTheDocument();
  });

  it('progresses through wizard steps to complete level up with 2 advancements and domain card', () => {
    const handleConfirm = vi.fn();
    render(
      <LevelUpModal
        character={mockCharacter}
        onConfirm={handleConfirm}
        onClose={vi.fn()}
        isHouseRulesEnabled={false}
        onToggleHouseRules={vi.fn()}
      />
    );

    // 1. On Step 1 (Tier Achievement), click Next
    const nextBtn1 = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(nextBtn1);

    // 2. On Step 2 (Advancements)
    expect(screen.getByText(/Choose 2 Advancements/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 2/i)).toBeInTheDocument();

    // Select Agility
    const agilityBtn = screen.getByRole('button', { name: /^Agility/i });
    fireEvent.click(agilityBtn);

    // Select +1 Max HP
    const hpBtn = screen.getByRole('button', { name: /\+1 Max HP/i });
    fireEvent.click(hpBtn);

    expect(screen.getByText(/2 \/ 2/i)).toBeInTheDocument();

    // Click Next to Domain Card step
    const nextBtn2 = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(nextBtn2);

    // 3. On Step 3 (Domain Card Picker)
    expect(
      screen.getByText(/Select 1 New Domain Card/i)
    ).toBeInTheDocument();

    // Click Next to Review step
    const nextBtn3 = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(nextBtn3);

    // 4. On Step 4 (Review)
    expect(screen.getByText(/Advancement Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1 Agility/i)).toBeInTheDocument();
    expect(screen.getByText(/\+1 Max HP/i)).toBeInTheDocument();

    // Confirm Level Up
    const confirmBtn = screen.getByRole('button', {
      name: /confirm level up to 2/i,
    });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    const updatedChar: Character = handleConfirm.mock.calls[0][0];
    expect(updatedChar.level).toBe(2);
    expect(updatedChar.proficiency).toBe(2); // +1 from Tier 2 achievement
    expect(updatedChar.damageThresholds.minor).toBe(6); // +1 from level up
    expect(updatedChar.damageThresholds.major).toBe(11);
    expect(updatedChar.damageThresholds.severe).toBe(12);
    expect(updatedChar.hp.max).toBe(7); // +1 from HP advancement
    expect(updatedChar.traits.Agility).toBe(3); // 2 + 1
    expect(updatedChar.loadout.length).toBe(1); // 1 new domain card
  });

  it('allows House Rules override toggle', () => {
    const handleToggle = vi.fn();
    render(
      <LevelUpModal
        character={mockCharacter}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
        isHouseRulesEnabled={false}
        onToggleHouseRules={handleToggle}
      />
    );

    const overrideBtn = screen.getByTitle(/toggle house rules override/i);
    fireEvent.click(overrideBtn);

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});
