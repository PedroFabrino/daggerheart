import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormattedFeatureText } from '../FormattedFeatureText';

describe('FormattedFeatureText Component', () => {
  it('renders simple paragraph text with bold and italic elements', () => {
    const text = 'This is **bold text** and this is _italic text_.';
    render(<FormattedFeatureText text={text} />);

    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText('bold text').tagName).toBe('STRONG');

    expect(screen.getByText('italic text')).toBeInTheDocument();
    expect(screen.getByText('italic text').tagName).toBe('EM');
  });

  it('correctly splits elemental features into bullet items on new lines', () => {
    const elementalIncarnationText = `**Mark a Stress** to _Channel_ one of the following elements until you take Severe damage or until your next rest:

- _Fire:_ When an adversary within Melee range deals damage to you, they take **1d10** magic damage.
- _Earth:_ Gain a bonus to your damage thresholds equal to your Proficiency.
- _Water:_ When you deal damage to an adversary within Melee range, all other adversaries within Very Close range must mark a Stress.
- _Air:_ You can hover, gaining advantage on Agility Rolls.`;

    const { container } = render(
      <FormattedFeatureText text={elementalIncarnationText} />
    );

    // Initial paragraph
    expect(screen.getByText('Mark a Stress')).toBeInTheDocument();
    expect(screen.getByText('Channel')).toBeInTheDocument();

    // 4 distinct bullet items
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(4);

    expect(screen.getByText('Fire:')).toBeInTheDocument();
    expect(screen.getByText('Earth:')).toBeInTheDocument();
    expect(screen.getByText('Water:')).toBeInTheDocument();
    expect(screen.getByText('Air:')).toBeInTheDocument();
    expect(screen.getByText('1d10')).toBeInTheDocument();
  });

  it('handles single line text with inline bullets separated by dashes', () => {
    const inlineBulletText =
      'Choose one benefit: - Option A: gain 1 Hope. - Option B: clear 1 Stress.';
    const { container } = render(
      <FormattedFeatureText text={inlineBulletText} />
    );

    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(2);
    expect(container.textContent).toContain('Option A: gain 1 Hope.');
    expect(container.textContent).toContain('Option B: clear 1 Stress.');
  });
});
