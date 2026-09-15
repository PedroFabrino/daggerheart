import rawClasses from './srd/classes.json';
import rawSubclasses from './srd/subclasses.json';
import rawAncestries from './srd/ancestries.json';
import rawCommunities from './srd/communities.json';
import rawAbilities from './srd/abilities.json';
import rawWeapons from './srd/weapons.json';
import rawArmor from './srd/armor.json';

import {
  Domain,
  DomainCard,
  ClassDefinition,
  SubclassDefinition,
  AncestryDefinition,
  CommunityDefinition,
  WeaponItem,
  ArmorItem,
  TraitName,
  CardType,
} from '../types/daggerheart';

// Normalized Domain Cards
export const DOMAIN_CARDS: DomainCard[] = rawAbilities.map((a: any, idx: number) => ({
  id: `srd-card-${idx + 1}-${a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: a.name,
  domain: a.domain as Domain,
  level: parseInt(a.level, 10),
  recallCost: parseInt(a.recall, 10) || 0,
  type: a.type as CardType,
  text: a.text,
}));

// Normalized Classes
export const CLASSES: ClassDefinition[] = rawClasses.map((c: any) => {
  // Parse suggested traits if present
  const suggestedTraits: Record<TraitName, number> = {
    Agility: 0,
    Strength: 0,
    Finesse: 0,
    Instinct: 0,
    Presence: 0,
    Knowledge: 0,
  };

  if (Array.isArray(c.suggested_traits)) {
    c.suggested_traits.forEach((t: any) => {
      const traitKey = t.name as TraitName;
      if (traitKey in suggestedTraits) {
        suggestedTraits[traitKey] = parseInt(t.value, 10) || 0;
      }
    });
  }

  return {
    name: c.name,
    description: c.description || '',
    domains: [c.domain_1 as Domain, c.domain_2 as Domain],
    startingHp: parseInt(c.hp, 10) || 5,
    startingEvasion: parseInt(c.evasion, 10) || 10,
    feature: Array.isArray(c.feature) && c.feature.length > 0
      ? { name: c.feature[0].name, text: c.feature[0].text }
      : { name: 'Class Feature', text: String(c.feature || '') },
    hopeFeature: {
      name: c.hope_feature_name || 'Hope Feature',
      text: c.hope_feature_text || '',
    },
    subclasses: [c.subclass_1, c.subclass_2],
    suggestedTraits,
    suggestedPrimary: c.suggested_primary || '',
    suggestedSecondary: c.suggested_secondary || '',
    suggestedArmor: c.suggested_armor || '',
    items: Array.isArray(c.items) ? c.items.map((i: any) => i.name || String(i)) : [],
  };
});

// Normalized Subclasses
export const SUBCLASSES: SubclassDefinition[] = rawSubclasses.map((s: any) => {
  // Find associated class
  const matchedClass = CLASSES.find(
    (c) => c.subclasses[0] === s.name || c.subclasses[1] === s.name
  );

  return {
    name: s.name,
    className: matchedClass ? matchedClass.name : '',
    description: s.description || '',
    spellcastTrait: (s.spellcast_trait || 'Instinct') as TraitName,
    foundation: Array.isArray(s.foundation) ? s.foundation : [],
    specialization: Array.isArray(s.specialization) ? s.specialization : [],
    mastery: Array.isArray(s.mastery) ? s.mastery : [],
  };
});

// Normalized Ancestries
export const ANCESTRIES: AncestryDefinition[] = rawAncestries.map((a: any) => ({
  name: a.name,
  description: a.description || '',
  features: [
    a.feature?.[0] || { name: 'Feature 1', text: '' },
    a.feature?.[1] || { name: 'Feature 2', text: '' },
  ],
}));

// Normalized Communities
export const COMMUNITIES: CommunityDefinition[] = rawCommunities.map((c: any) => ({
  name: c.name,
  description: c.description || '',
  feature: Array.isArray(c.feature) ? c.feature[0] : (c.feature || { name: 'Community Feature', text: '' }),
}));

// Normalized Weapons
export const WEAPONS: WeaponItem[] = rawWeapons.map((w: any) => ({
  name: w.name,
  tier: parseInt(w.tier, 10) || 1,
  burden: (w.burden === 'Two-Handed' ? 'Two-Handed' : 'One-Handed'),
  damage: w.damage || 'd6 phy',
  physicalOrMagical: (w.physical_or_magical === 'Magical' ? 'Magical' : 'Physical'),
  primaryOrSecondary: (w.primary_or_secondary === 'Secondary' ? 'Secondary' : 'Primary'),
  range: (w.range || 'Melee') as any,
  trait: (w.trait || 'Strength') as TraitName,
  features: Array.isArray(w.feature) ? w.feature : [],
}));

// Normalized Armor
export const ARMOR: ArmorItem[] = rawArmor.map((ar: any) => {
  let thresholds: [number, number] = [5, 11];
  if (ar.base_thresholds && typeof ar.base_thresholds === 'string') {
    const parts = ar.base_thresholds.split('/').map((s: string) => parseInt(s.trim(), 10));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      thresholds = [parts[0], parts[1]];
    }
  }

  return {
    name: ar.name,
    tier: parseInt(ar.tier, 10) || 1,
    baseScore: parseInt(ar.base_score, 10) || 0,
    baseThresholds: thresholds,
    features: Array.isArray(ar.feature) ? ar.feature : [],
  };
});

// Lookup functions
export function getClass(name: string): ClassDefinition | undefined {
  return CLASSES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getSubclass(name: string): SubclassDefinition | undefined {
  return SUBCLASSES.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

export function getSubclassesForClass(className: string): SubclassDefinition[] {
  return SUBCLASSES.filter(
    (s) => s.className.toLowerCase() === className.toLowerCase()
  );
}

export function getAncestry(name: string): AncestryDefinition | undefined {
  return ANCESTRIES.find((a) => a.name.toLowerCase() === name.toLowerCase());
}

export function getCommunity(name: string): CommunityDefinition | undefined {
  return COMMUNITIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Filter legal domain cards strictly matching the class's 2 domains and <= maxLevel.
 */
export function filterLegalDomainCards(
  className: string,
  maxLevel: number = 1
): DomainCard[] {
  const cls = getClass(className);
  if (!cls) return [];

  const [d1, d2] = cls.domains;
  return DOMAIN_CARDS.filter(
    (card) =>
      (card.domain === d1 || card.domain === d2) &&
      card.level <= maxLevel
  ).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}
