import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddCustomCardModal } from '../AddCustomCardModal';
import { Character, DomainCard } from '../../../types/daggerheart';

const mockCharacter: Character = {
  id: 'pc-custom-card-test',
  name: 'Vael',
  pronouns: 'they/them',
  level: 2,
  className: 'Rogue',
  subclassName: 'Syndicate',
  subclassCardState: 'foundation',
  heritage: {
    ancestryName: 'Katari',
    isMixedAncestry: false,
    ancestryFeatures: [],
    communityName: 'Slyborne',
    communityFeature: { name: 'Streetwise', text: 'Know streets' },
  },
  traits: {
    Agility: 3,
    Strength: 0,
    Finesse: 2,
    Instinct: 1,
    Presence: 0,
    Knowledge: -1,
  },
  markedTraitsThisTier: [],
  evasion: 12,
  hp: { max: 6, currentDamage: 0 },
  stress: { max: 6, current: 0 },
  hope: { max: 6, current: 2 },
  armor: {
    equipped: null,
    score: 1,
    markedSlots: 0,
    maxSlots: 2,
  },
  damageThresholds: { minor: 6, major: 11, severe: 12 },
  proficiency: 2,
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

describe('AddCustomCardModal Component - Ticket 07', () => {
  it('renders modal inputs and title', () => {
    render(
      <AddCustomCardModal
        character={mockCharacter}
        onAddCard={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Add Custom / Homebrew Card')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e\.g\. Phoenix Feather Ward/i)
    ).toBeInTheDocument();
  });

  it('submits a valid custom card with isHomebrew: true and target destination', () => {
    const handleAddCard = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddCustomCardModal
        character={mockCharacter}
        onAddCard={handleAddCard}
        onClose={handleClose}
      />
    );

    // Enter name
    const nameInput = screen.getByPlaceholderText(/e\.g\. Phoenix Feather Ward/i);
    fireEvent.change(nameInput, { target: { value: 'Shadowstep Strike' } });

    // Enter description
    const descInput = screen.getByPlaceholderText(
      /describe the card rules/i
    );
    fireEvent.change(descInput, {
      target: { value: 'Teleport behind target and deal extra damage.' },
    });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /add custom card/i });
    fireEvent.click(submitBtn);

    expect(handleAddCard).toHaveBeenCalledTimes(1);
    const addedCard: DomainCard = handleAddCard.mock.calls[0][0];
    const destination: string = handleAddCard.mock.calls[0][1];

    expect(addedCard.name).toBe('Shadowstep Strike');
    expect(addedCard.isHomebrew).toBe(true);
    expect(addedCard.text).toContain('Teleport behind target');
    expect(destination).toBe('loadout');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
