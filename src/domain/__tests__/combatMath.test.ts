import { describe, it, expect } from 'vitest';
import {
  calculateWeaponDamage,
  calculateDamageSeverity,
  getTierForLevel,
} from '../combatMath';

describe('Combat Math & Rules Engine - Ticket 03', () => {
  it('scales weapon damage dice by Proficiency correctly', () => {
    // Proficiency 1
    expect(calculateWeaponDamage('d8 phy', 1)).toBe('1d8 phy');
    expect(calculateWeaponDamage('d10+2 mag', 1)).toBe('1d10+2 mag');

    // Proficiency 2
    expect(calculateWeaponDamage('d8 phy', 2)).toBe('2d8 phy');
    expect(calculateWeaponDamage('d6+1 phy', 2)).toBe('2d6+1 phy');

    // Proficiency 3
    expect(calculateWeaponDamage('d12 phy', 3)).toBe('3d12 phy');
    expect(calculateWeaponDamage('2d6 mag', 2)).toBe('4d6 mag'); // 2 * 2 = 4 dice
  });

  it('evaluates damage severity against damage thresholds', () => {
    const thresholds = { minor: 6, major: 12, severe: 13 };

    // Below minor: 0 HP damage
    expect(calculateDamageSeverity(4, thresholds)).toEqual({
      severity: 'None',
      hpDamage: 0,
    });

    // At or above minor, below major: 1 HP damage
    expect(calculateDamageSeverity(6, thresholds)).toEqual({
      severity: 'Minor',
      hpDamage: 1,
    });
    expect(calculateDamageSeverity(11, thresholds)).toEqual({
      severity: 'Minor',
      hpDamage: 1,
    });

    // At or above major, below severe: 2 HP damage
    expect(calculateDamageSeverity(12, thresholds)).toEqual({
      severity: 'Major',
      hpDamage: 2,
    });

    // At or above severe: 3 HP damage
    expect(calculateDamageSeverity(13, thresholds)).toEqual({
      severity: 'Severe',
      hpDamage: 3,
    });
    expect(calculateDamageSeverity(25, thresholds)).toEqual({
      severity: 'Severe',
      hpDamage: 3,
    });
  });

  it('determines correct Tier for PC Level', () => {
    expect(getTierForLevel(1)).toBe(1);
    expect(getTierForLevel(2)).toBe(2);
    expect(getTierForLevel(4)).toBe(2);
    expect(getTierForLevel(5)).toBe(3);
    expect(getTierForLevel(7)).toBe(3);
    expect(getTierForLevel(8)).toBe(4);
    expect(getTierForLevel(10)).toBe(4);
  });
});
