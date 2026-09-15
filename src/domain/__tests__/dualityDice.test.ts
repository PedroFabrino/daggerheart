import { describe, it, expect } from 'vitest';
import {
  calculateDualityRoll,
  calculateWeaponDamageRoll,
} from '../dualityDice';

describe('Duality Dice Domain Engine - Ticket 06', () => {
  it('identifies roll with Hope when Hope Die > Fear Die', () => {
    const res = calculateDualityRoll(10, 4, 2, 1, 'Agility');
    expect(res.outcome).toBe('hope');
    expect(res.isCritical).toBe(false);
    expect(res.total).toBe(10 + 4 + 2 + 1); // 17
    expect(res.description).toContain('Rolled with Hope');
  });

  it('identifies roll with Fear when Fear Die > Hope Die', () => {
    const res = calculateDualityRoll(3, 9, 1, 0, 'Strength');
    expect(res.outcome).toBe('fear');
    expect(res.isCritical).toBe(false);
    expect(res.total).toBe(13);
    expect(res.description).toContain('Rolled with Fear');
  });

  it('identifies Critical Success when Hope Die matches Fear Die', () => {
    const res = calculateDualityRoll(7, 7, 3, 0, 'Instinct');
    expect(res.outcome).toBe('critical');
    expect(res.isCritical).toBe(true);
    expect(res.total).toBe(17);
    expect(res.description).toContain('Critical Success! Both dice rolled 7');
  });

  it('scales weapon damage dice by proficiency', () => {
    const res1 = calculateWeaponDamageRoll('d8 phy', 1);
    expect(res1.diceCount).toBe(1);
    expect(res1.dieSides).toBe(8);
    expect(res1.rolls.length).toBe(1);

    const res2 = calculateWeaponDamageRoll('d8 phy', 3);
    expect(res2.diceCount).toBe(3);
    expect(res2.rolls.length).toBe(3);
    expect(res2.totalDamage).toBeGreaterThanOrEqual(3);
    expect(res2.totalDamage).toBeLessThanOrEqual(24);
  });
});
