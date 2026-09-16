import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeastformModal } from '../BeastformModal';
import { Character } from '../../../types/daggerheart';

const mockDruid: Character = {
  id: 'druid-test-1',
  name: 'Sylvia Thorn',
  pronouns: 'she/her',
  level: 1,
  className: 'Druid',
  subclassName: 'Warden of the Elements',
  subclassCardState: 'foundation',
  heritage: {
    ancestryName: 'Elf',
    ancestryFeatures: [
      { name: 'Feature 1', text: 'Text 1' },
      { name: 'Feature 2', text: 'Text 2' },
    ],
    communityName: 'Wildborne',
    communityFeature: { name: 'Com Feat', text: 'Com text' },
  },
  traits: {
    Agility: 1,
    Strength: 0,
    Finesse: 1,
    Instinct: 2,
    Presence: -1,
    Knowledge: 0,
  },
  markedTraitsThisTier: [],
  evasion: 10,
  hp: { currentDamage: 0, max: 6 },
  stress: { current: 0, max: 6 },
  hope: { current: 2, max: 6 },
  armor: {
    equipped: null,
    score: 0,
    markedSlots: 0,
    maxSlots: 3,
  },
  damageThresholds: {
    minor: 3,
    major: 7,
    severe: 12,
  },
  proficiency: 1,
  experiences: [],
  weapons: { primary: null, secondary: null },
  inventory: [],
  gold: { handfuls: 0, bags: 0, chests: 0 },
  loadout: [],
  vault: [],
  advancementHistory: [],
  favoriteBeastforms: [],
  backgroundNotes: '',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('BeastformModal Component', () => {
  it('renders modal with all 24 beastforms when open', () => {
    const handleClose = vi.fn();
    const handleUpdate = vi.fn();

    render(
      <BeastformModal
        character={mockDruid}
        isOpen={true}
        onClose={handleClose}
        onUpdate={handleUpdate}
      />
    );

    expect(screen.getByText('Druid Beastform Options')).toBeInTheDocument();
    expect(screen.getByText('Tier 1 Druid')).toBeInTheDocument();
    expect(screen.getByText('All Tiers (24)')).toBeInTheDocument();

    // Contains Tier 1 forms
    expect(screen.getByText('Agile Scout')).toBeInTheDocument();
    expect(screen.getByText('Pack Predator')).toBeInTheDocument();
  });

  it('filters by Tier tabs', () => {
    const handleUpdate = vi.fn();

    render(
      <BeastformModal
        character={mockDruid}
        isOpen={true}
        onClose={() => {}}
        onUpdate={handleUpdate}
      />
    );

    // Click Tier 2 tab
    const tier2Btn = screen.getByRole('button', { name: /Tier 2/i });
    fireEvent.click(tier2Btn);

    // Tier 2 should show Powerful Beast, but not Tier 1 Agile Scout
    expect(screen.getByText('Powerful Beast')).toBeInTheDocument();
    expect(screen.queryByText('Agile Scout')).not.toBeInTheDocument();
  });

  it('searches forms by animal example and name', () => {
    render(
      <BeastformModal
        character={mockDruid}
        isOpen={true}
        onClose={() => {}}
        onUpdate={() => {}}
      />
    );

    const searchInput = screen.getByPlaceholderText(
      /Search by animal \(wolf, eagle, bear\)/i
    );
    fireEvent.change(searchInput, { target: { value: 'bear' } });

    expect(screen.getByText('Powerful Beast')).toBeInTheDocument();
    expect(screen.queryByText('Agile Scout')).not.toBeInTheDocument();
  });

  it('toggles favorite and calls onUpdate to pin form', () => {
    const handleUpdate = vi.fn();

    render(
      <BeastformModal
        character={mockDruid}
        isOpen={true}
        onClose={() => {}}
        onUpdate={handleUpdate}
      />
    );

    // Click favorite star for Pack Predator
    const favBtn = screen.getByRole('button', {
      name: /Favorite Pack Predator/i,
    });
    fireEvent.click(favBtn);

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        favoriteBeastforms: ['beastform-t1-pack-predator'],
      })
    );
  });

  it('sorts favorited forms to the top and displays Pinned badge', () => {
    const charWithFav: Character = {
      ...mockDruid,
      favoriteBeastforms: ['beastform-t4-massive-behemoth'],
    };

    render(
      <BeastformModal
        character={charWithFav}
        isOpen={true}
        onClose={() => {}}
        onUpdate={() => {}}
      />
    );

    expect(screen.getByText('Pinned')).toBeInTheDocument();

    // Forms list should have Massive Behemoth rendered before Agile Scout
    const formHeaders = screen.getAllByRole('heading', { level: 4 });
    expect(formHeaders[0].textContent).toBe('Massive Behemoth');
  });

  it('filters to favorites only when clicking Favorites toggle', () => {
    const charWithFav: Character = {
      ...mockDruid,
      favoriteBeastforms: ['beastform-t2-powerful-beast'],
    };

    render(
      <BeastformModal
        character={charWithFav}
        isOpen={true}
        onClose={() => {}}
        onUpdate={() => {}}
      />
    );

    const favToggle = screen.getByRole('button', { name: /Favorites \(1\)/i });
    fireEvent.click(favToggle);

    expect(screen.getByText('Powerful Beast')).toBeInTheDocument();
    expect(screen.queryByText('Agile Scout')).not.toBeInTheDocument();
  });
});
