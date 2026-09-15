import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCreationWizard } from '../CharacterCreationWizard';
import { filterLegalDomainCards } from '../../../data/srdService';
import { DomainCard } from '../../../types/daggerheart';

describe('CharacterCreationWizard UI Seam - Ticket 02', () => {
  it('renders Step 1 with classes and advances to Step 2', () => {
    const handleComplete = vi.fn();
    render(<CharacterCreationWizard onComplete={handleComplete} />);

    // Step 1 title
    expect(screen.getByText(/Choose Class & Subclass/i)).toBeInTheDocument();

    // Verify classes are rendered
    expect(screen.getByRole('button', { name: /Druid/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardian/i })).toBeInTheDocument();

    // Next button advances to Step 2
    const nextBtn = screen.getByRole('button', { name: /^Next/i });
    expect(nextBtn).toBeEnabled();

    fireEvent.click(nextBtn);
    expect(screen.getByText(/Select Heritage/i)).toBeInTheDocument();
  });

  it('verifies that Druid selection strictly restricts domain cards to Arcana and Sage', () => {
    const druidCards = filterLegalDomainCards('Druid', 1);
    expect(druidCards.length).toBeGreaterThan(0);
    druidCards.forEach((c: DomainCard) => {
      expect(['Arcana', 'Sage']).toContain(c.domain);
    });

    const warriorCards = filterLegalDomainCards('Warrior', 1);
    expect(warriorCards.length).toBeGreaterThan(0);
    warriorCards.forEach((c: DomainCard) => {
      expect(['Blade', 'Bone']).toContain(c.domain);
    });
  });
});
