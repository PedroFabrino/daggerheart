import { describe, it, expect } from 'vitest';
import {
  calculateWeaponDamage,
  calculateDamageSeverity,
  reduceSeverityByThreshold,
  getTierForLevel,
  calculateEvasionBreakdown,
  calculateThresholdsBreakdown,
  calculateProficiencyBreakdown,
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

    // Composite dice (e.g., Brawler's Strike: d8+d6 phy)
    expect(calculateWeaponDamage('d8+d6 phy', 1)).toBe('1d8 + 1d6 phy');
    expect(calculateWeaponDamage('d8+d6 phy', 2)).toBe('2d8 + 2d6 phy');
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

  it('reduces damage severity by one threshold when marking armor slot', () => {
    // Severe (3 HP) -> Major (2 HP)
    expect(reduceSeverityByThreshold({ severity: 'Severe', hpDamage: 3 }, 1)).toEqual({
      severity: 'Major',
      hpDamage: 2,
    });

    // Major (2 HP) -> Minor (1 HP)
    expect(reduceSeverityByThreshold({ severity: 'Major', hpDamage: 2 }, 1)).toEqual({
      severity: 'Minor',
      hpDamage: 1,
    });

    // Minor (1 HP) -> None (0 HP)
    expect(reduceSeverityByThreshold({ severity: 'Minor', hpDamage: 1 }, 1)).toEqual({
      severity: 'None',
      hpDamage: 0,
    });

    // None (0 HP) -> None (0 HP)
    expect(reduceSeverityByThreshold({ severity: 'None', hpDamage: 0 }, 1)).toEqual({
      severity: 'None',
      hpDamage: 0,
    });
  });

  it('calculates full Evasion breakdown with class, ancestry, advancements, gear, and domain cards', () => {
    // Test 1: Bruce Leeson (Brawler, mixed Simiah without nimble, level 2 with +1 evasion advancement, sword equipped)
    const pc1 = {
      level: 2,
      className: 'Brawler',
      traits: { Agility: 3, Strength: 1, Finesse: 0, Instinct: 1, Presence: -1, Knowledge: 0 },
      heritage: {
        ancestryName: 'Simiah',
        isMixedAncestry: true,
        ancestryFeatures: [
          { name: 'Natural Climber', text: 'Advantage on climbing' },
          { name: 'Wings', text: 'Fly' },
        ],
      },
      advancementHistory: [{ advancements: ['+1 Agility', '+1 Evasion'] }],
      armor: { equipped: { name: 'Leather Armor', features: [] } },
      weapons: {
        primary: { name: 'Broadsword', features: [] },
        secondary: null,
      },
      loadout: [],
    };

    const res1 = calculateEvasionBreakdown(pc1);
    // Base 10 + Level Up 1 = 11
    expect(res1.total).toBe(11);
    expect(res1.breakdown.some((b) => b.source.includes('Base'))).toBe(true);
    expect(res1.breakdown.some((b) => b.source.includes('Level Up'))).toBe(true);

    // Test 2: Unarmed Brawler with Untouchable card active (+half Agility rounded up)
    const pc2 = {
      ...pc1,
      weapons: { primary: null, secondary: null },
      loadout: [{ name: 'Untouchable', text: 'Gain a bonus to your Evasion equal to half your Agility.' }],
    };

    const res2 = calculateEvasionBreakdown(pc2);
    // Base 10 + Level Up 1 + Unarmed I Am the Weapon 1 + Untouchable (ceil(3/2) = 2) = 14
    expect(res2.total).toBe(14);
    expect(res2.breakdown.some((b) => b.source.includes('I Am the Weapon'))).toBe(true);
    expect(res2.breakdown.some((b) => b.source.includes('Untouchable'))).toBe(true);
  });

  it('calculates Damage Thresholds and Armor Score with Bare Bones and standard armor', () => {
    // Test 1: Bare Bones at Tier 2 (Level 2) with Strength 1 and unarmored
    const bareBonesPC = {
      level: 2,
      traits: { Agility: 3, Strength: 1 },
      armor: { equipped: null, score: 0, maxSlots: 0 },
      loadout: [{ name: 'Bare Bones', text: 'Base thresholds: Tier 2: 11/24, Armor score 3 + Strength' }],
    };

    const th1 = calculateThresholdsBreakdown(bareBonesPC);
    expect(th1.isBareBones).toBe(true);
    expect(th1.thresholds).toEqual({ minor: 11, major: 24, severe: 25 });
    // Armor score: 3 + Strength (1) = 4
    expect(th1.armorScore).toBe(4);
    expect(th1.maxArmorSlots).toBe(4);
    expect(th1.breakdown.some((b) => b.source.includes('Bare Bones'))).toBe(true);

    // Test 2: Equipped Leather Armor (Base 6/13, baseScore 3) at Level 2
    const armoredPC = {
      level: 2,
      traits: { Agility: 3, Strength: 1 },
      armor: {
        equipped: { name: 'Leather Armor', baseScore: 3, baseThresholds: [6, 13] as [number, number] },
        score: 3,
        maxSlots: 3,
      },
      loadout: [],
    };

    const th2 = calculateThresholdsBreakdown(armoredPC);
    expect(th2.isBareBones).toBe(false);
    // Minor: 6 + 2 = 8, Major: 13 + 2 = 15, Severe: 15 + 1 = 16
    expect(th2.thresholds).toEqual({ minor: 8, major: 15, severe: 16 });
    expect(th2.armorScore).toBe(3);
  });

  it('calculates Proficiency breakdown with base and advancements', () => {
    const res = calculateProficiencyBreakdown({
      proficiency: 2,
      advancementHistory: [{ advancements: ['+1 Agility', '+1 Proficiency'] }],
    });

    expect(res.total).toBe(2);
    expect(res.breakdown.length).toBeGreaterThanOrEqual(2);
    expect(res.breakdown[0].source).toBe('Base Proficiency');
  });
});

