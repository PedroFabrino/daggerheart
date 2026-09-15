import { describe, it, expect } from 'vitest';
import {
  CLASSES,
  SUBCLASSES,
  ANCESTRIES,
  COMMUNITIES,
  DOMAIN_CARDS,
  WEAPONS,
  ARMOR,
  filterLegalDomainCards,
  getClass,
  getSubclassesForClass,
} from '../srdService';

describe('SRD Dataset & Rules Engine - Ticket 01', () => {
  it('loads all 9 core classes with exact domains and starting stats', () => {
    expect(CLASSES).toHaveLength(9);

    const classNames = CLASSES.map((c) => c.name).sort();
    expect(classNames).toEqual([
      'Bard',
      'Druid',
      'Guardian',
      'Ranger',
      'Rogue',
      'Seraph',
      'Sorcerer',
      'Warrior',
      'Wizard',
    ]);

    // Check specific class domains
    const druid = getClass('Druid')!;
    expect(druid).toBeDefined();
    expect(druid.domains).toEqual(['Sage', 'Arcana']);
    expect(druid.startingHp).toBe(6);
    expect(druid.startingEvasion).toBe(10);

    const guardian = getClass('Guardian')!;
    expect(guardian.domains).toEqual(['Valor', 'Blade']);

    const wizard = getClass('Wizard')!;
    expect(wizard.domains).toEqual(['Codex', 'Splendor']);
  });

  it('loads all 18 subclasses and pairs them correctly with their classes', () => {
    expect(SUBCLASSES).toHaveLength(18);

    CLASSES.forEach((c) => {
      const subclasses = getSubclassesForClass(c.name);
      expect(subclasses).toHaveLength(2);
      expect(c.subclasses).toContain(subclasses[0].name);
      expect(c.subclasses).toContain(subclasses[1].name);

      // Verify each subclass has foundation, specialization, and mastery features
      subclasses.forEach((s) => {
        expect(s.foundation.length).toBeGreaterThanOrEqual(1);
        expect(s.specialization.length).toBeGreaterThanOrEqual(1);
        expect(s.mastery.length).toBeGreaterThanOrEqual(1);
        expect(s.spellcastTrait).toBeDefined();
      });
    });
  });

  it('loads all 18 ancestries with top and bottom features', () => {
    expect(ANCESTRIES).toHaveLength(18);
    ANCESTRIES.forEach((a) => {
      expect(a.name).toBeTruthy();
      expect(a.features).toHaveLength(2);
      expect(a.features[0].name).toBeTruthy();
      expect(a.features[1].name).toBeTruthy();
    });
  });

  it('loads all 9 communities with their features', () => {
    expect(COMMUNITIES).toHaveLength(9);
    COMMUNITIES.forEach((c) => {
      expect(c.name).toBeTruthy();
      expect(c.feature.name).toBeTruthy();
    });
  });

  it('loads all 189+ domain cards spanning all 9 domains and levels 1 to 10', () => {
    expect(DOMAIN_CARDS.length).toBeGreaterThanOrEqual(189);

    const allDomains = new Set(DOMAIN_CARDS.map((c) => c.domain));
    expect(allDomains.size).toBe(9);
    expect(Array.from(allDomains).sort()).toEqual([
      'Arcana',
      'Blade',
      'Bone',
      'Codex',
      'Grace',
      'Midnight',
      'Sage',
      'Splendor',
      'Valor',
    ]);

    const levels = new Set(DOMAIN_CARDS.map((c) => c.level));
    for (let lvl = 1; lvl <= 10; lvl++) {
      expect(levels.has(lvl)).toBe(true);
    }
  });

  it('loads weapons and armor tables', () => {
    expect(WEAPONS.length).toBeGreaterThan(0);
    expect(ARMOR.length).toBeGreaterThan(0);

    const t1Weapons = WEAPONS.filter((w) => w.tier === 1);
    expect(t1Weapons.length).toBeGreaterThan(10);

    const t1Armor = ARMOR.filter((a) => a.tier === 1);
    expect(t1Armor.length).toBeGreaterThan(3);
  });

  it('strictly filters legal domain cards by class and level', () => {
    // Druid has Arcana and Sage
    const druidLvl1Cards = filterLegalDomainCards('Druid', 1);
    expect(druidLvl1Cards.length).toBeGreaterThan(0);

    druidLvl1Cards.forEach((card) => {
      expect(['Arcana', 'Sage']).toContain(card.domain);
      expect(card.level).toBeLessThanOrEqual(1);
    });

    // Verify no Valor or Blade cards leak to Druid
    const illegalCards = druidLvl1Cards.filter(
      (c) => c.domain === 'Valor' || c.domain === 'Blade'
    );
    expect(illegalCards).toHaveLength(0);

    // At Level 3, Druid sees level 1, 2, 3 cards in Arcana and Sage only
    const druidLvl3Cards = filterLegalDomainCards('Druid', 3);
    expect(druidLvl3Cards.length).toBeGreaterThan(druidLvl1Cards.length);
    druidLvl3Cards.forEach((card) => {
      expect(['Arcana', 'Sage']).toContain(card.domain);
      expect(card.level).toBeLessThanOrEqual(3);
    });
  });
});
