import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardTray } from '../CardTray';
import { Character, DomainCard } from '../../../types/daggerheart';

const testCard1: DomainCard = {
  id: 'card-1',
  name: 'Deadeye',
  domain: 'Bone',
  level: 1,
  recallCost: 1,
  type: 'Ability',
  text: 'Mark a stress to gain advantage on ranged attacks.',
};

const testCard2: DomainCard = {
  id: 'card-2',
  name: 'Hunter Instinct',
  domain: 'Sage',
  level: 1,
  recallCost: 0,
  type: 'Ability',
  text: 'Track foes in wilderness.',
};

const vaultedCard: DomainCard = {
  id: 'card-3',
  name: 'Rain of Arrows',
  domain: 'Bone',
  level: 1,
  recallCost: 2,
  type: 'Ability',
  text: 'Shoot multiple targets simultaneously.',
};

const mockCharacter: Character = {
  id: 'pc-tray-test',
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
  stress: { max: 6, current: 1 },
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
  experiences: [],
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
  loadout: [testCard1, testCard2],
  vault: [vaultedCard],
  inventory: [],
  gold: { handfuls: 0, bags: 0, chests: 0 },
  advancementHistory: [],
  backgroundNotes: 'Wilderness scout',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('CardTray Component', () => {
  it('renders loadout cards with 2/5 count badge', () => {
    render(<CardTray character={mockCharacter} onUpdate={vi.fn()} />);

    expect(screen.getByText('Loadout')).toBeInTheDocument();
    expect(screen.getByText('2/5')).toBeInTheDocument();
    expect(screen.getByText('Deadeye')).toBeInTheDocument();
    expect(screen.getByText('Hunter Instinct')).toBeInTheDocument();
  });

  it('allows moving an active card to the Vault', () => {
    const handleUpdate = vi.fn();
    render(<CardTray character={mockCharacter} onUpdate={handleUpdate} />);

    // Click Move to Vault on Deadeye
    const vaultButtons = screen.getAllByRole('button', { name: /vault/i });
    // First button is tab "Vault", following buttons are card "Move to Vault"
    const moveToVaultBtn = vaultButtons.find((btn) =>
      btn.textContent?.toLowerCase().includes('move to vault')
    );
    expect(moveToVaultBtn).toBeDefined();
    fireEvent.click(moveToVaultBtn!);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    const updatedChar: Character = handleUpdate.mock.calls[0][0];
    expect(updatedChar.loadout.some((c) => c.id === 'card-1')).toBe(false);
    expect(updatedChar.vault.some((c) => c.id === 'card-1')).toBe(true);
  });

  it('switches to Vault tab and displays vaulted cards and filter controls', () => {
    render(<CardTray character={mockCharacter} onUpdate={vi.fn()} />);

    const vaultTabBtn = screen.getByRole('button', { name: /^Vault/i });
    fireEvent.click(vaultTabBtn);

    expect(screen.getByText('Rain of Arrows')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search vault cards...')).toBeInTheDocument();
  });

  it('opens RecallModal when clicking Equip on a vaulted card and recalls with stress', () => {
    const handleUpdate = vi.fn();
    render(<CardTray character={mockCharacter} onUpdate={handleUpdate} />);

    // Switch to vault
    fireEvent.click(screen.getByRole('button', { name: /^Vault/i }));

    // Click equip
    const equipBtn = screen.getByRole('button', { name: /equip to loadout/i });
    fireEvent.click(equipBtn);

    // Modal should appear with recall details
    expect(screen.getByText(/Equip to Loadout: Rain of Arrows/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Play Recall/i)).toBeInTheDocument();
    expect(screen.getByText(/\+2 Stress/i)).toBeInTheDocument();

    // Confirm recall
    const confirmBtn = screen.getByRole('button', { name: /recall \(mark 2 stress\)/i });
    fireEvent.click(confirmBtn);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    const updatedChar: Character = handleUpdate.mock.calls[0][0];
    expect(updatedChar.loadout.some((c) => c.id === 'card-3')).toBe(true);
    expect(updatedChar.vault.some((c) => c.id === 'card-3')).toBe(false);
    expect(updatedChar.stress.current).toBe(3); // 1 + 2 = 3
  });

  it('allows downtime rest recall with 0 stress cost', () => {
    const handleUpdate = vi.fn();
    render(<CardTray character={mockCharacter} onUpdate={handleUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /^Vault/i }));
    fireEvent.click(screen.getByRole('button', { name: /equip to loadout/i }));

    // Toggle downtime rest
    const downtimeBtn = screen.getByRole('button', { name: /downtime rest/i });
    fireEvent.click(downtimeBtn);

    const equipFreeBtn = screen.getByRole('button', { name: /equip for free/i });
    fireEvent.click(equipFreeBtn);

    expect(handleUpdate).toHaveBeenCalledTimes(1);
    const updatedChar: Character = handleUpdate.mock.calls[0][0];
    expect(updatedChar.stress.current).toBe(1); // Unchanged 0 stress
  });

  it('switches to Features tab displaying Ancestry, Community, Class, and Subclass features', () => {
    render(<CardTray character={mockCharacter} onUpdate={vi.fn()} />);

    const featuresTabBtn = screen.getByRole('button', { name: /features/i });
    fireEvent.click(featuresTabBtn);

    expect(screen.getByText(/Ancestry: Elf/i)).toBeInTheDocument();
    expect(screen.getByText('Keen Senses')).toBeInTheDocument();
    expect(screen.getByText(/Community: Wildborne/i)).toBeInTheDocument();
    expect(screen.getByText('Wild Forager')).toBeInTheDocument();
    expect(screen.getByText(/Class: Ranger/i)).toBeInTheDocument();
  });

  it('toggles between Visual and Compact view modes', () => {
    render(<CardTray character={mockCharacter} onUpdate={vi.fn()} />);

    // By default visual card view has "Active Loadout" in footer
    expect(screen.getAllByText('Active Loadout').length).toBeGreaterThan(0);

    // Switch to compact view
    const compactBtn = screen.getByTitle('Compact Combat List');
    fireEvent.click(compactBtn);

    // In compact view, cards are rows with chevron expanders
    expect(screen.getByText('Deadeye')).toBeInTheDocument();
  });

  it('displays Beastform button for Druid character and opens modal', () => {
    const druidChar: Character = {
      ...mockCharacter,
      className: 'Druid',
      subclassName: 'Warden of the Elements',
    };

    render(<CardTray character={druidChar} onUpdate={vi.fn()} />);

    // Switch to features tab
    const featuresTabBtn = screen.getByRole('button', { name: /features/i });
    fireEvent.click(featuresTabBtn);

    expect(screen.getByText(/Class: Druid/i)).toBeInTheDocument();
    const beastformsBtn = screen.getAllByRole('button', { name: /beastforms/i })[0];
    expect(beastformsBtn).toBeInTheDocument();

    // Click beastforms button
    fireEvent.click(beastformsBtn);

    expect(screen.getByText('Druid Beastform Options')).toBeInTheDocument();
  });
});
