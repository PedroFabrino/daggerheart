import React, { useState } from 'react';
import {
  CLASSES,
  SUBCLASSES,
  ANCESTRIES,
  COMMUNITIES,
  WEAPONS,
  ARMOR,
  filterLegalDomainCards,
  getClass,
} from '../../data/srdService';
import {
  TraitName,
  WeaponItem,
  ArmorItem,
  DomainCard,
  Feature,
} from '../../types/daggerheart';
import { CharacterDraft, validateTraitArray } from '../../domain/characterCreation';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';


interface WizardProps {
  onComplete: (draft: CharacterDraft) => Promise<void>;
  onCancel?: () => void;
}

const TRAIT_NAMES: TraitName[] = [
  'Agility',
  'Strength',
  'Finesse',
  'Instinct',
  'Presence',
  'Knowledge',
];

const STANDARD_TRAIT_VALUES = [2, 1, 1, 0, 0, -1];

export const CharacterCreationWizard: React.FC<WizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Class & Subclass
  const [selectedClass, setSelectedClass] = useState<string>('Druid');
  const [selectedSubclass, setSelectedSubclass] = useState<string>('Warden of the Elements');

  // Step 2: Heritage
  const [isMixedAncestry, setIsMixedAncestry] = useState<boolean>(false);
  const [primaryAncestry, setPrimaryAncestry] = useState<string>('Clank');
  const [secondaryAncestry, setSecondaryAncestry] = useState<string>('Faun');
  const [selectedCommunity, setSelectedCommunity] = useState<string>('Wildborne');

  // Step 3: Traits
  const [traits, setTraits] = useState<Record<TraitName, number | null>>({
    Agility: null,
    Strength: null,
    Finesse: null,
    Instinct: null,
    Presence: null,
    Knowledge: null,
  });

  // Step 4: Equipment
  const [isTwoHanded, setIsTwoHanded] = useState<boolean>(false);
  const [primaryWeapon, setPrimaryWeapon] = useState<WeaponItem | null>(null);
  const [secondaryWeapon, setSecondaryWeapon] = useState<WeaponItem | null>(null);
  const [selectedArmor, setSelectedArmor] = useState<ArmorItem | null>(null);
  const [selectedPotion, setSelectedPotion] = useState<
    'Minor Health Potion' | 'Minor Stamina Potion'
  >('Minor Health Potion');

  // Step 5: Profile & Background
  const [charName, setCharName] = useState<string>('');
  const [pronouns, setPronouns] = useState<string>('they/them');
  const [backgroundNotes, setBackgroundNotes] = useState<string>('');

  // Step 6: Experiences
  const [exp1Name, setExp1Name] = useState<string>('Wilderness Tracking');
  const [exp2Name, setExp2Name] = useState<string>('Old Forest Lore');

  // Step 7: Starting Domain Cards
  const [selectedCards, setSelectedCards] = useState<DomainCard[]>([]);

  // Helpers
  const activeClassDef = getClass(selectedClass);
  const availableSubclasses = SUBCLASSES.filter(
    (s) => s.className.toLowerCase() === selectedClass.toLowerCase()
  );

  // Initialize equipment defaults when class changes
  const applyClassDefaults = (className: string) => {
    setSelectedClass(className);
    const cls = getClass(className);
    if (!cls) return;

    if (cls.subclasses.length > 0) {
      setSelectedSubclass(cls.subclasses[0]);
    }

    // Set suggested traits
    setTraits(cls.suggestedTraits);

    // Set suggested armor
    const matchArmor = ARMOR.find(
      (a) => a.name.toLowerCase() === cls.suggestedArmor.toLowerCase() && a.tier === 1
    );
    setSelectedArmor(matchArmor || ARMOR.find((a) => a.tier === 1) || null);

    // Set suggested weapons
    const matchPrimary = WEAPONS.find(
      (w) => w.name.toLowerCase() === cls.suggestedPrimary.toLowerCase() && w.tier === 1
    );
    const defaultPrimary = matchPrimary || WEAPONS.find((w) => w.tier === 1) || null;
    setPrimaryWeapon(defaultPrimary);

    if (defaultPrimary && defaultPrimary.burden === 'Two-Handed') {
      setIsTwoHanded(true);
      setSecondaryWeapon(null);
    } else {
      setIsTwoHanded(false);
      const matchSecondary = WEAPONS.find(
        (w) =>
          w.name.toLowerCase() === cls.suggestedSecondary.toLowerCase() &&
          w.tier === 1 &&
          w.primaryOrSecondary === 'Secondary'
      );
      setSecondaryWeapon(matchSecondary || null);
    }

    // Reset domain cards
    setSelectedCards([]);
  };

  // Trait array tracking
  const assignedValues = Object.values(traits).filter(
    (v): v is number => v !== null
  );

  const getAvailableValues = () => {
    const remaining = [...STANDARD_TRAIT_VALUES];
    for (const val of assignedValues) {
      const idx = remaining.indexOf(val);
      if (idx !== -1) {
        remaining.splice(idx, 1);
      }
    }
    return remaining;
  };

  // Legal Level 1 cards for this class
  const legalCards = filterLegalDomainCards(selectedClass, 1);

  // Validation per step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedClass && !!selectedSubclass;
      case 2:
        return (
          !!primaryAncestry &&
          (!isMixedAncestry || !!secondaryAncestry) &&
          !!selectedCommunity
        );
      case 3: {
        const allSet = TRAIT_NAMES.every((t) => traits[t] !== null);
        if (!allSet) return false;
        return validateTraitArray(traits as Record<TraitName, number>);
      }
      case 4:
        return !!primaryWeapon && !!selectedArmor;
      case 5:
        return charName.trim().length > 0;
      case 6:
        return exp1Name.trim().length > 0 && exp2Name.trim().length > 0;
      case 7:
        return selectedCards.length === 2;
      case 8:
        return true;
      default:
        return false;
    }
  };

  const handleFinish = async () => {
    const primAncestryDef = ANCESTRIES.find((a) => a.name === primaryAncestry)!;
    const commDef = COMMUNITIES.find((c) => c.name === selectedCommunity)!;

    let ancestryFeatures: Feature[];
    if (isMixedAncestry) {
      const secAncestryDef = ANCESTRIES.find((a) => a.name === secondaryAncestry)!;
      ancestryFeatures = [
        primAncestryDef.features[0], // Top feature from primary
        secAncestryDef.features[1], // Bottom feature from secondary
      ];
    } else {
      ancestryFeatures = primAncestryDef.features;
    }

    const draft: CharacterDraft = {
      name: charName.trim(),
      pronouns: pronouns.trim() || 'they/them',
      className: selectedClass,
      subclassName: selectedSubclass,
      heritage: {
        ancestryName: primaryAncestry,
        isMixedAncestry,
        mixedSecondaryAncestryName: isMixedAncestry ? secondaryAncestry : undefined,
        ancestryFeatures,
        communityName: selectedCommunity,
        communityFeature: commDef.feature,
      },
      traits: traits as Record<TraitName, number>,
      startingArmor: selectedArmor,
      startingPrimaryWeapon: primaryWeapon,
      startingSecondaryWeapon: isTwoHanded ? null : secondaryWeapon,
      startingPotion: selectedPotion,
      experiences: [
        { id: `exp-1-${Date.now()}`, name: exp1Name.trim(), bonus: 2 },
        { id: `exp-2-${Date.now()}`, name: exp2Name.trim(), bonus: 2 },
      ],
      startingDomainCards: selectedCards,
      backgroundNotes,
    };

    await onComplete(draft);
  };

  return (
    <div className="max-w-4xl mx-auto bg-bg-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden my-6">
      {/* Header */}
      <div className="border-b border-border-subtle p-6 bg-bg-secondary flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-hope">
            Character Creation &middot; Step {currentStep} of 8
          </span>
          <h2 className="text-2xl font-black text-text-primary mt-1">
            {currentStep === 1 && 'Choose Class & Subclass'}
            {currentStep === 2 && 'Select Heritage (Ancestry & Community)'}
            {currentStep === 3 && 'Assign Character Traits'}
            {currentStep === 4 && 'Equip Starting Gear'}
            {currentStep === 5 && 'Character Details & Background'}
            {currentStep === 6 && 'Create Starting Experiences'}
            {currentStep === 7 && 'Choose Starting Domain Cards'}
            {currentStep === 8 && 'Review & Finalize Character'}
          </h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-bg-primary h-1.5 flex">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
          <div
            key={s}
            className={`flex-1 h-full transition-all duration-300 ${
              s < currentStep
                ? 'bg-hope'
                : s === currentStep
                ? 'bg-hope-light'
                : 'bg-border-subtle'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="p-6 md:p-8 min-h-[480px]">
        {/* STEP 1: CLASS & SUBCLASS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                1. Select Class
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {CLASSES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => applyClassDefaults(c.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedClass === c.name
                        ? 'border-hope bg-hope/10 ring-2 ring-hope/30 font-bold text-text-primary'
                        : 'border-border-subtle bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div className="text-sm">{c.name}</div>
                    <div className="text-[10px] text-text-muted mt-1">
                      {c.domains.join(' & ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {activeClassDef && (
              <div className="bg-bg-secondary/70 border border-border-subtle rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div>
                    <span className="text-text-muted font-medium">Domains: </span>
                    <span className="font-bold text-hope">
                      {activeClassDef.domains.join(' & ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted font-medium">Starting HP: </span>
                    <span className="font-bold text-text-primary">
                      {activeClassDef.startingHp}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted font-medium">Starting Evasion: </span>
                    <span className="font-bold text-text-primary">
                      {activeClassDef.startingEvasion}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border-subtle pt-2">
                  <div className="text-xs font-bold text-text-primary mb-1">
                    Class Feature: {activeClassDef.feature.name}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {activeClassDef.feature.text}
                  </p>
                </div>

                <div className="border-t border-border-subtle pt-2">
                  <div className="text-xs font-bold text-hope mb-1">
                    Hope Feature (Cost: 3 Hope): {activeClassDef.hopeFeature.name}
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {activeClassDef.hopeFeature.text}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                2. Select Subclass
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableSubclasses.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSubclass(s.name)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedSubclass === s.name
                        ? 'border-hope bg-hope/10 ring-2 ring-hope/30 text-text-primary'
                        : 'border-border-subtle bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{s.name}</span>
                        <span className="text-[10px] bg-bg-surface px-2 py-0.5 rounded border border-border-subtle text-text-muted">
                          Spellcast: {s.spellcastTrait}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1 italic">
                        {s.description}
                      </p>
                      {s.foundation.length > 0 && (
                        <div className="mt-2 text-xs">
                          <span className="font-semibold text-hope-light">
                            Foundation: {s.foundation[0].name}
                          </span>
                          <p className="text-[11px] text-text-secondary line-clamp-3 mt-0.5">
                            {s.foundation[0].text}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HERITAGE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                1. Ancestry (Lineage & Physicality)
              </label>
              <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMixedAncestry}
                  onChange={(e) => setIsMixedAncestry(e.target.checked)}
                  className="rounded border-border-subtle text-hope focus:ring-hope bg-bg-primary"
                />
                Mixed Ancestry (Pair Top Feature + Bottom Feature)
              </label>
            </div>

            {!isMixedAncestry ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                {ANCESTRIES.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => setPrimaryAncestry(a.name)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      primaryAncestry === a.name
                        ? 'border-hope bg-hope/10 font-bold text-text-primary'
                        : 'border-border-subtle bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-hope mb-1 block">
                    Primary Ancestry (Top Feature):
                  </span>
                  <select
                    value={primaryAncestry}
                    onChange={(e) => setPrimaryAncestry(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary"
                  >
                    {ANCESTRIES.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs font-semibold text-fear-light mb-1 block">
                    Secondary Ancestry (Bottom Feature):
                  </span>
                  <select
                    value={secondaryAncestry}
                    onChange={(e) => setSecondaryAncestry(e.target.value)}
                    className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary"
                  >
                    {ANCESTRIES.map((a) => (
                      <option key={a.name} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                2. Community (Origin & Culture)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COMMUNITIES.map((comm) => (
                  <button
                    key={comm.name}
                    onClick={() => setSelectedCommunity(comm.name)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedCommunity === comm.name
                        ? 'border-hope bg-hope/10 font-bold text-text-primary'
                        : 'border-border-subtle bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div className="text-xs font-bold">{comm.name}</div>
                    <div className="text-[10px] text-text-muted line-clamp-1 mt-0.5">
                      {comm.feature.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TRAITS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs text-text-secondary">
                  Assign the standard array values: <strong className="text-hope">+2, +1, +1, 0, 0, -1</strong> across your six traits.
                </p>
              </div>
              {activeClassDef && (
                <button
                  onClick={() => setTraits(activeClassDef.suggestedTraits)}
                  className="text-xs bg-bg-secondary border border-border-subtle hover:border-hope px-3 py-1.5 rounded-lg text-text-secondary font-medium transition-colors"
                >
                  Use Class Suggested ({selectedClass})
                </button>
              )}
            </div>

            {/* Unassigned chips */}
            <div className="bg-bg-secondary p-3 rounded-xl border border-border-subtle">
              <span className="text-xs text-text-muted font-medium block mb-2">
                Remaining Values to Place:
              </span>
              <div className="flex gap-2">
                {getAvailableValues().length === 0 ? (
                  <span className="text-xs text-domain-sage font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> All traits assigned correctly!
                  </span>
                ) : (
                  getAvailableValues().map((val, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-bg-surface border border-border-subtle text-xs font-mono font-bold text-hope"
                    >
                      {val > 0 ? `+${val}` : val}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 6 Trait Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TRAIT_NAMES.map((trait) => {
                const currentVal = traits[trait];
                return (
                  <div
                    key={trait}
                    className="p-3.5 bg-bg-secondary rounded-xl border border-border-subtle flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-text-primary">{trait}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        {trait === 'Agility' && 'Sprint, Leap, Maneuver'}
                        {trait === 'Strength' && 'Lift, Smash, Grapple'}
                        {trait === 'Finesse' && 'Control, Hide, Tinker'}
                        {trait === 'Instinct' && 'Perceive, Sense, Navigate'}
                        {trait === 'Presence' && 'Charm, Perform, Deceive'}
                        {trait === 'Knowledge' && 'Recall, Analyze, Comprehend'}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <select
                        value={currentVal !== null ? currentVal : ''}
                        onChange={(e) => {
                          const val =
                            e.target.value === '' ? null : parseInt(e.target.value, 10);
                          setTraits((prev) => ({ ...prev, [trait]: val }));
                        }}
                        className="bg-bg-primary border border-border-subtle rounded px-2 py-1 text-xs font-mono font-bold text-text-primary w-full"
                      >
                        <option value="">Select...</option>
                        {[-1, 0, 1, 2].map((v) => (
                          <option key={v} value={v}>
                            {v > 0 ? `+${v}` : v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: EQUIPMENT */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Primary Weapon */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  1. Primary Weapon (Tier 1)
                </label>
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="burden"
                      checked={!isTwoHanded}
                      onChange={() => setIsTwoHanded(false)}
                      className="text-hope focus:ring-hope"
                    />
                    One-Handed
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="burden"
                      checked={isTwoHanded}
                      onChange={() => {
                        setIsTwoHanded(true);
                        setSecondaryWeapon(null);
                      }}
                      className="text-hope focus:ring-hope"
                    />
                    Two-Handed
                  </label>
                </div>
              </div>

              <select
                value={primaryWeapon?.name || ''}
                onChange={(e) => {
                  const match = WEAPONS.find(
                    (w) => w.name === e.target.value && w.tier === 1
                  );
                  setPrimaryWeapon(match || null);
                  if (match?.burden === 'Two-Handed') {
                    setIsTwoHanded(true);
                    setSecondaryWeapon(null);
                  }
                }}
                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary"
              >
                <option value="">Select Primary Weapon...</option>
                {WEAPONS.filter(
                  (w) =>
                    w.tier === 1 &&
                    (isTwoHanded ? w.burden === 'Two-Handed' : w.burden === 'One-Handed')
                ).map((w) => (
                  <option key={w.name} value={w.name}>
                    {w.name} ({w.damage}, {w.trait}, {w.range})
                  </option>
                ))}
              </select>
            </div>

            {/* Secondary Weapon if One-Handed */}
            {!isTwoHanded && (
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  2. Secondary Weapon (Optional)
                </label>
                <select
                  value={secondaryWeapon?.name || ''}
                  onChange={(e) => {
                    const match = WEAPONS.find(
                      (w) => w.name === e.target.value && w.tier === 1
                    );
                    setSecondaryWeapon(match || null);
                  }}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary"
                >
                  <option value="">None / Shield</option>
                  {WEAPONS.filter(
                    (w) =>
                      w.tier === 1 &&
                      w.burden === 'One-Handed' &&
                      w.primaryOrSecondary === 'Secondary'
                  ).map((w) => (
                    <option key={w.name} value={w.name}>
                      {w.name} ({w.damage}, {w.trait})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Armor */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                3. Armor (Tier 1)
              </label>
              <select
                value={selectedArmor?.name || ''}
                onChange={(e) => {
                  const match = ARMOR.find(
                    (a) => a.name === e.target.value && a.tier === 1
                  );
                  setSelectedArmor(match || null);
                }}
                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary"
              >
                <option value="">Select Armor...</option>
                {ARMOR.filter((a) => a.tier === 1).map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} (Base Score: {a.baseScore}, Thresholds: {a.baseThresholds.join('/')})
                  </option>
                ))}
              </select>
            </div>

            {/* Potion choice */}
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                4. Starting Potion
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPotion('Minor Health Potion')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedPotion === 'Minor Health Potion'
                      ? 'border-hope bg-hope/10 font-bold text-text-primary'
                      : 'border-border-subtle bg-bg-secondary text-text-secondary'
                  }`}
                >
                  <div className="font-bold text-hope">Minor Health Potion</div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Clear 1d4 Hit Points
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPotion('Minor Stamina Potion')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedPotion === 'Minor Stamina Potion'
                      ? 'border-hope bg-hope/10 font-bold text-text-primary'
                      : 'border-border-subtle bg-bg-secondary text-text-secondary'
                  }`}
                >
                  <div className="font-bold text-fear-light">Minor Stamina Potion</div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    Clear 1d4 Stress
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DETAILS & BACKGROUND */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Character Name *
                </label>
                <input
                  type="text"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="e.g. Lyra, Brandon, Oakhaven..."
                  className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-hope"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Pronouns
                </label>
                <input
                  type="text"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="e.g. she/her, they/them, he/him..."
                  className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-hope"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Background & Roleplay Notes
              </label>
              <textarea
                value={backgroundNotes}
                onChange={(e) => setBackgroundNotes(e.target.value)}
                rows={4}
                placeholder="Where did you come from? What drives you into adventure? Note any connections to other party members..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-lg p-3 text-xs text-text-primary focus:outline-none focus:border-hope"
              />
            </div>
          </div>
        )}

        {/* STEP 6: EXPERIENCES */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <p className="text-xs text-text-secondary">
              Experiences capture your character's lived history and knacks. When rolling an action, you can spend a Hope to add the +2 modifier.
            </p>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Experience 1 (+2 Bonus) *
              </label>
              <input
                type="text"
                value={exp1Name}
                onChange={(e) => setExp1Name(e.target.value)}
                placeholder="e.g. Wilderness Survival, Royal Court Etiquette, Clockwork Repair..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-hope"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                Experience 2 (+2 Bonus) *
              </label>
              <input
                type="text"
                value={exp2Name}
                onChange={(e) => setExp2Name(e.target.value)}
                placeholder="e.g. Sneak in Shadows, Ancient Relic Lore, Never Give Up..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-hope"
              />
            </div>
          </div>
        )}

        {/* STEP 7: STARTING DOMAIN CARDS */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary">
                  Select Exactly 2 Level 1 Domain Cards ({selectedCards.length}/2)
                </span>
                <p className="text-[11px] text-text-muted">
                  Filtered strictly to your class domains ({activeClassDef?.domains.join(' & ')}).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {legalCards.map((card) => {
                const isSelected = selectedCards.some((c) => c.id === card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCards((prev) => prev.filter((c) => c.id !== card.id));
                      } else if (selectedCards.length < 2) {
                        setSelectedCards((prev) => [...prev, card]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-hope bg-hope/10 ring-2 ring-hope/40 text-text-primary'
                        : 'border-border-subtle bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-primary border border-border-subtle">
                          Level {card.level} &middot; {card.domain}
                        </span>
                        <span className="text-[10px] font-mono text-hope font-semibold">
                          ⚡ {card.recallCost} Recall
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-text-primary">{card.name}</h4>
                      <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                        {card.text}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-[10px] font-bold text-hope flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: REVIEW & FINALIZE */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="text-xl font-black text-text-primary">{charName}</h3>
                  <p className="text-xs text-text-muted">
                    Level 1 &middot; {primaryAncestry} {selectedClass} ({selectedSubclass})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-text-muted font-medium">Community</div>
                  <div className="text-xs font-bold text-text-primary">{selectedCommunity}</div>
                </div>
              </div>

              {/* Stats Bar Preview */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-bg-surface p-2 rounded-lg border border-border-subtle">
                  <div className="text-[10px] text-text-muted font-bold">HP</div>
                  <div className="text-base font-extrabold text-text-primary">
                    {activeClassDef?.startingHp}
                  </div>
                </div>
                <div className="bg-bg-surface p-2 rounded-lg border border-border-subtle">
                  <div className="text-[10px] text-text-muted font-bold">STRESS</div>
                  <div className="text-base font-extrabold text-fear-light">6</div>
                </div>
                <div className="bg-bg-surface p-2 rounded-lg border border-border-subtle">
                  <div className="text-[10px] text-text-muted font-bold">HOPE</div>
                  <div className="text-base font-extrabold text-hope">2 / 6</div>
                </div>
                <div className="bg-bg-surface p-2 rounded-lg border border-border-subtle">
                  <div className="text-[10px] text-text-muted font-bold">EVASION</div>
                  <div className="text-base font-extrabold text-text-primary">
                    {activeClassDef ? activeClassDef.startingEvasion : 10}
                  </div>
                </div>
              </div>

              {/* Selected Cards */}
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                  Starting Domain Cards (Loadout 2/5)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCards.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 bg-bg-surface border border-border-subtle rounded-lg text-xs"
                    >
                      <div className="font-bold text-hope">{c.name}</div>
                      <div className="text-[10px] text-text-muted">
                        {c.domain} &middot; Level {c.level}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-border-subtle p-4 bg-bg-secondary flex items-center justify-between">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg border border-border-subtle hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {currentStep < 8 ? (
          <button
            onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
            disabled={!isStepValid(currentStep)}
            className="flex items-center gap-1 text-xs font-bold px-5 py-2 rounded-lg bg-hope text-bg-primary hover:bg-hope-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!isStepValid(8)}
            className="flex items-center gap-1 text-xs font-bold px-6 py-2 rounded-lg bg-domain-sage text-bg-primary hover:opacity-90 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4" /> Embark on Adventure
          </button>
        )}
      </div>
    </div>
  );
};
