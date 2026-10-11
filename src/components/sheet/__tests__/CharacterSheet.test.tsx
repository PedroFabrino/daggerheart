import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterSheet } from '../CharacterSheet';
import { Character } from '../../../types/daggerheart';

const mockCharacter: Character = {
  id: 'pc-test',
  name: 'Aiden Swift',
  pronouns: 'he/him',
  level: 1,
  className: 'Ranger',
  subclassName: 'Wayfinder',
  subclassCardState: 'foundation',
  heritage: {
    ancestryName: 'Elf',
    isMixedAncestry: false,
    ancestryFeatures: [{ name: 'Keen Senses', text: 'Perceive hidden' }],
    communityName: 'Wildborne',
    communityFeature: { name: 'Wild Forager', text: 'Find food' },
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
  hp: { max: 6, currentDamage: 1 },
  stress: { max: 6, current: 2 },
  hope: { max: 6, current: 3 },
  armor: {
    equipped: {
      name: 'Leather Armor',
      tier: 1,
      baseScore: 2,
      baseThresholds: [4, 9],
      features: [],
    },
    score: 2,
    markedSlots: 0,
    maxSlots: 2,
  },
  damageThresholds: { minor: 5, major: 10, severe: 11 },
  proficiency: 1,
  experiences: [
    { id: 'exp-1', name: 'Pathfinding', bonus: 2 },
  ],
  weapons: {
    primary: {
      name: 'Longbow',
      tier: 1,
      burden: 'Two-Handed',
      damage: 'd8 phy',
      physicalOrMagical: 'Physical',
      primaryOrSecondary: 'Primary',
      range: 'Far',
      trait: 'Agility',
      features: [],
    },
    secondary: null,
  },
  inventory: ['Rope', 'Torch', 'Minor Health Potion'],
  gold: { handfuls: 2, bags: 1, chests: 0 },
  loadout: [
    {
      id: 'card-1',
      name: 'Hunter’s Mark',
      domain: 'Sage',
      level: 1,
      recallCost: 1,
      type: 'Spell',
      text: 'Mark a target to deal extra damage.',
    },
  ],
  vault: [],
  advancementHistory: [],
  backgroundNotes: 'Scout of the emerald borders.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('CharacterSheet UI & Combat Trackers - Ticket 03', () => {
  it('displays complete character header and traits', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheet
        character={mockCharacter}
        onUpdate={handleUpdate}
        isHouseRulesEnabled={false}
        onToggleHouseRules={vi.fn()}
      />
    );

    expect(screen.getByText('Aiden Swift')).toBeInTheDocument();
    expect(screen.getByText(/Level 1 \(Tier 1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Elf/i)).toBeInTheDocument();
    expect(screen.getByText('Ranger')).toBeInTheDocument();

    // Traits
    expect(screen.getByText('Agility')).toBeInTheDocument();
    expect(screen.getAllByText('+2').length).toBeGreaterThanOrEqual(1);

    // Proficiency & Evasion
    expect(screen.getAllByText('+1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('10')).toBeInTheDocument(); // Calculated Evasion
  });

  it('allows clicking HP heal and mark buttons', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheet
        character={mockCharacter}
        onUpdate={handleUpdate}
        isHouseRulesEnabled={false}
        onToggleHouseRules={vi.fn()}
      />
    );

    const healBtn = screen.getByRole('button', { name: /^Heal 1$/i });
    fireEvent.click(healBtn);
    expect(handleUpdate).toHaveBeenCalled();

    const markBtn = screen.getByRole('button', { name: /^Mark 1$/i });
    fireEvent.click(markBtn);
    expect(handleUpdate).toHaveBeenCalledTimes(2);
  });

  it('displays weapons with damage scaled by proficiency', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheet
        character={mockCharacter}
        onUpdate={handleUpdate}
        isHouseRulesEnabled={false}
        onToggleHouseRules={vi.fn()}
      />
    );

    // Primary weapon longbow with proficiency 1 -> 1d8 phy
    expect(screen.getByText('Longbow')).toBeInTheDocument();
    expect(screen.getByText('1d8 phy')).toBeInTheDocument();
  });

  it('invoking an experience spends 1 Hope', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheet
        character={mockCharacter}
        onUpdate={handleUpdate}
        isHouseRulesEnabled={false}
        onToggleHouseRules={vi.fn()}
      />
    );

    const invokeBtn = screen.getByRole('button', { name: /Invoke/i });
    fireEvent.click(invokeBtn);

    expect(handleUpdate).toHaveBeenCalled();
    // Verify updater reduces Hope from 3 to 2
    const updater = handleUpdate.mock.calls[0][0];
    const updated = updater(mockCharacter);
    expect(updated.hope.current).toBe(2);
  });

  it('displays calculated top info and opens breakdown popover on hover or click', () => {
    const handleUpdate = vi.fn();
    render(
      <CharacterSheet
        character={mockCharacter}
        onUpdate={handleUpdate}
        isHouseRulesEnabled={false}
        onToggleHouseRules={vi.fn()}
      />
    );

    // Evasion badge is rendered in header
    const evasionBtn = screen.getByTestId('stat-breakdown-evasion');
    expect(evasionBtn).toBeInTheDocument();

    // Hover opens breakdown
    fireEvent.mouseEnter(evasionBtn);
    expect(screen.getByText('Evasion Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/Base \(Ranger\)/i)).toBeInTheDocument();

    // Damage thresholds badge in header
    const thresholdsBtn = screen.getByTestId('stat-breakdown-thresholds');
    expect(thresholdsBtn).toBeInTheDocument();
    fireEvent.mouseEnter(thresholdsBtn);
    expect(screen.getByText('Damage Thresholds Breakdown')).toBeInTheDocument();
  });
});
