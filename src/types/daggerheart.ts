export type Domain =
  | 'Arcana'
  | 'Blade'
  | 'Bone'
  | 'Codex'
  | 'Grace'
  | 'Midnight'
  | 'Sage'
  | 'Splendor'
  | 'Valor';

export type TraitName =
  | 'Agility'
  | 'Strength'
  | 'Finesse'
  | 'Instinct'
  | 'Presence'
  | 'Knowledge';

export const TRAIT_NAMES: TraitName[] = [
  'Agility',
  'Strength',
  'Finesse',
  'Instinct',
  'Presence',
  'Knowledge',
];

export type CardType = 'Spell' | 'Ability' | 'Grimoire';

export interface DomainCard {
  id: string;
  name: string;
  domain: Domain;
  level: number;
  recallCost: number;
  type: CardType;
  text: string;
  isHomebrew?: boolean;
}

export interface Feature {
  name: string;
  text: string;
}

export interface SubclassDefinition {
  name: string;
  className: string;
  description: string;
  spellcastTrait: TraitName;
  foundation: Feature[];
  specialization: Feature[];
  mastery: Feature[];
}

export interface ClassDefinition {
  name: string;
  description: string;
  domains: [Domain, Domain];
  startingHp: number;
  startingEvasion: number;
  feature: Feature;
  hopeFeature: Feature;
  subclasses: [string, string];
  suggestedTraits: Record<TraitName, number>;
  suggestedPrimary: string;
  suggestedSecondary: string;
  suggestedArmor: string;
  items: string[];
}

export interface AncestryDefinition {
  name: string;
  description: string;
  features: [Feature, Feature]; // Top and bottom features
}

export interface CommunityDefinition {
  name: string;
  description: string;
  feature: Feature;
}

export interface WeaponItem {
  name: string;
  tier: number;
  burden: 'One-Handed' | 'Two-Handed';
  damage: string; // e.g. "d8 phy" or "d6+2 mag"
  physicalOrMagical: 'Physical' | 'Magical';
  primaryOrSecondary: 'Primary' | 'Secondary';
  range: 'Melee' | 'Very Close' | 'Close' | 'Far' | 'Very Far';
  trait: TraitName;
  features: Feature[];
}

export interface ArmorItem {
  name: string;
  tier: number;
  baseScore: number;
  baseThresholds: [number, number]; // Minor / Major thresholds (Severe is Major + 1 or higher)
  features: Feature[];
}

export interface CharacterExperience {
  id: string;
  name: string;
  bonus: number;
}

export interface CharacterAdvancementRecord {
  tier: number; // Tier 2 (levels 2-4), Tier 3 (levels 5-7), Tier 4 (levels 8-10)
  level: number;
  advancements: string[]; // IDs/names of chosen advancements
  markedTraits?: TraitName[];
}

export interface Character {
  id: string;
  name: string;
  pronouns: string;
  level: number;
  className: string;
  subclassName: string;
  subclassCardState: 'foundation' | 'specialization' | 'mastery';
  heritage: {
    ancestryName: string;
    isMixedAncestry?: boolean;
    mixedSecondaryAncestryName?: string;
    ancestryFeatures: Feature[];
    communityName: string;
    communityFeature: Feature;
  };
  traits: Record<TraitName, number>;
  markedTraitsThisTier: TraitName[];
  evasion: number;
  hp: {
    currentDamage: number; // Number of marked HP slots
    max: number;
  };
  stress: {
    current: number; // Number of marked Stress slots
    max: number;
  };
  hope: {
    current: number; // 0 to 6
    max: number;
  };
  armor: {
    equipped: ArmorItem | null;
    score: number;
    markedSlots: number;
    maxSlots: number;
  };
  damageThresholds: {
    minor: number;
    major: number;
    severe: number;
  };
  proficiency: number;
  experiences: CharacterExperience[];
  weapons: {
    primary: WeaponItem | null;
    secondary: WeaponItem | null;
  };
  inventory: string[];
  gold: {
    handfuls: number;
    bags: number;
    chests: number;
  };
  loadout: DomainCard[]; // Max 5 active cards
  vault: DomainCard[];   // Reserve cards
  advancementHistory: CharacterAdvancementRecord[];
  backgroundNotes: string;
  createdAt: string;
  updatedAt: string;
}
