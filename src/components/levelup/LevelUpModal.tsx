import React, { useState } from 'react';
import {
  Character,
  DomainCard,
  TraitName,
  TRAIT_NAMES,
} from '../../types/daggerheart';
import {
  isTierAchievementLevel,
  validateAdvancements,
  applyLevelUp,
  AdvancementType,
} from '../../domain/levelUp';
import { getTierForLevel } from '../../domain/combatMath';
import { filterLegalDomainCards, getClass } from '../../data/srdService';
import {
  Flame,
  X,
  Sparkles,
  Shield,
  Heart,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Award,
  Wrench,
  Check,
} from 'lucide-react';

interface LevelUpModalProps {
  character: Character;
  onConfirm: (updatedCharacter: Character) => void;
  onClose: () => void;
  isHouseRulesEnabled: boolean;
  onToggleHouseRules: () => void;
}

interface SelectedAdvancement {
  id: string;
  type: AdvancementType;
  slotsCost: number;
  trait?: TraitName;
  experienceId?: string;
  newExperienceName?: string;
  label: string;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  character,
  onConfirm,
  onClose,
  isHouseRulesEnabled,
  onToggleHouseRules,
}) => {
  const newLevel = character.level + 1;
  const newTier = getTierForLevel(newLevel);
  const isTierAchieve = isTierAchievementLevel(newLevel);
  const classDef = getClass(character.className);

  const [step, setStep] = useState<number>(isTierAchieve ? 1 : 2);

  // Step 1 State: Tier Achievement Experience allocation (+2 total)
  const [expAllocMode, setExpAllocMode] = useState<'existing' | 'new'>('existing');
  const [tierExpId, setTierExpId] = useState<string>(character.experiences[0]?.id || '');
  const [newExpName, setNewExpName] = useState<string>('');

  // Step 2 State: Advancements
  const [selectedAdvancements, setSelectedAdvancements] = useState<SelectedAdvancement[]>([]);
  const [advExpMode, setAdvExpMode] = useState<'existing' | 'new'>('existing');
  const [advExpId, setAdvExpId] = useState<string>(character.experiences[0]?.id || '');
  const [advNewExpName, setAdvNewExpName] = useState<string>('');

  // Step 3 State: Domain Card
  const legalCards = filterLegalDomainCards(character.className, newLevel);
  // Exclude cards already owned
  const ownedIds = new Set([
    ...character.loadout.map((c) => c.id),
    ...character.vault.map((c) => c.id),
  ]);
  const availableCards = legalCards.filter((c) => !ownedIds.has(c.id));

  const [selectedCard, setSelectedCard] = useState<DomainCard | null>(
    availableCards[0] || null
  );

  // Optional card exchange
  const [isExchanging, setIsExchanging] = useState<boolean>(false);
  const [exchangeReturnId, setExchangeReturnId] = useState<string>(
    character.loadout[0]?.id || character.vault[0]?.id || ''
  );
  const [exchangeReplacement, setExchangeReplacement] = useState<DomainCard | null>(null);

  // Calculate current slot total
  const totalSlotsChosen = selectedAdvancements.reduce((acc, a) => acc + a.slotsCost, 0);

  // Toggle single-slot advancement
  const toggleAdvancement = (adv: SelectedAdvancement) => {
    const existingIndex = selectedAdvancements.findIndex((a) => a.id === adv.id);
    if (existingIndex >= 0) {
      setSelectedAdvancements((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      if (totalSlotsChosen + adv.slotsCost > 2 && !isHouseRulesEnabled) {
        return; // Max 2 slots unless House Rules
      }
      setSelectedAdvancements((prev) => [...prev, adv]);
    }
  };

  const validation = validateAdvancements(
    character,
    selectedAdvancements,
    isHouseRulesEnabled
  );

  const handleFinalSubmit = () => {
    if (!validation.valid && !isHouseRulesEnabled) return;
    if (!selectedCard && !isHouseRulesEnabled) return;

    const payload = {
      advancements: selectedAdvancements,
      newCard: selectedCard || legalCards[0],
      cardExchange:
        isExchanging && exchangeReturnId && exchangeReplacement
          ? {
              returnCardId: exchangeReturnId,
              replacementCard: exchangeReplacement,
            }
          : undefined,
      tierExperienceAllocations: isTierAchieve
        ? [
            expAllocMode === 'existing' && tierExpId
              ? { experienceId: tierExpId, bonusAmount: 2 }
              : { newExperienceName: newExpName || 'New Specialty', bonusAmount: 2 },
          ]
        : undefined,
      houseRulesOverride: isHouseRulesEnabled,
    };

    const updated = applyLevelUp(character, payload);
    onConfirm(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-hope/20 text-hope flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-text-primary">
                  Level Up: Level {character.level} &rarr; Level {newLevel}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-bg-secondary text-text-muted border border-border-subtle">
                  Tier {newTier}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {classDef?.name} &middot; Automatic Thresholds +1 &amp; Tier Advancements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleHouseRules}
              className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 transition-colors ${
                isHouseRulesEnabled
                  ? 'bg-hope/20 text-hope border-hope/40'
                  : 'bg-bg-secondary hover:bg-bg-hover text-text-muted border-border-subtle'
              }`}
              title="Toggle House Rules override"
            >
              <Wrench className="w-3 h-3" />
              {isHouseRulesEnabled ? 'Override ON' : 'Override'}
            </button>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 px-2">
          {isTierAchieve && (
            <div
              className={`flex-1 text-center pb-2 border-b-2 font-bold text-xs ${
                step === 1
                  ? 'border-hope text-hope'
                  : step > 1
                  ? 'border-border-highlight text-text-primary'
                  : 'border-border-subtle text-text-muted'
              }`}
            >
              1. Tier Achievement
            </div>
          )}
          <div
            className={`flex-1 text-center pb-2 border-b-2 font-bold text-xs ${
              step === 2
                ? 'border-hope text-hope'
                : step > 2
                ? 'border-border-highlight text-text-primary'
                : 'border-border-subtle text-text-muted'
            }`}
          >
            {isTierAchieve ? '2. Advancements' : '1. Advancements'}
          </div>
          <div
            className={`flex-1 text-center pb-2 border-b-2 font-bold text-xs ${
              step === 3
                ? 'border-hope text-hope'
                : step > 3
                ? 'border-border-highlight text-text-primary'
                : 'border-border-subtle text-text-muted'
            }`}
          >
            {isTierAchieve ? '3. Domain Card' : '2. Domain Card'}
          </div>
          <div
            className={`flex-1 text-center pb-2 border-b-2 font-bold text-xs ${
              step === 4
                ? 'border-hope text-hope'
                : 'border-border-subtle text-text-muted'
            }`}
          >
            {isTierAchieve ? '4. Review' : '3. Review'}
          </div>
        </div>

        {/* STEP 1: TIER ACHIEVEMENT */}
        {step === 1 && isTierAchieve && (
          <div className="space-y-4">
            <div className="bg-hope/10 border border-hope/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-hope" />
                <h3 className="font-extrabold text-sm text-text-primary">
                  Tier {newTier} Milestone Achievement Unlocked!
                </h3>
              </div>
              <ul className="text-xs text-text-secondary space-y-1.5 list-disc list-inside">
                <li>
                  <strong className="text-text-primary">Proficiency:</strong> Increases by +1 (Now{' '}
                  <span className="text-hope font-mono font-bold">+{character.proficiency + 1}</span>).
                </li>
                {newLevel === 5 && (
                  <li>
                    <strong className="text-text-primary">Subclass Specialization:</strong> Unlocks your Subclass Specialization card features!
                  </li>
                )}
                {newLevel === 8 && (
                  <li>
                    <strong className="text-text-primary">Subclass Mastery:</strong> Unlocks your Subclass Mastery card features!
                  </li>
                )}
                <li>
                  <strong className="text-text-primary">Trait Mark Clearance:</strong> All traits marked in the previous tier are cleared, allowing you to advance them again.
                </li>
                <li>
                  <strong className="text-text-primary">Experience Bonus:</strong> Gain +2 Experience points to allocate.
                </li>
              </ul>
            </div>

            {/* Experience Allocation Selection */}
            <div className="bg-bg-secondary p-4 rounded-2xl border border-border-subtle space-y-3">
              <label className="block text-xs font-bold text-text-primary">
                Allocate +2 Experience Bonus:
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExpAllocMode('existing')}
                  className={`p-2.5 rounded-xl border font-bold transition-all ${
                    expAllocMode === 'existing'
                      ? 'border-hope bg-hope/10 text-hope'
                      : 'border-border-subtle bg-bg-surface text-text-muted'
                  }`}
                >
                  Upgrade Existing (+2)
                </button>
                <button
                  type="button"
                  onClick={() => setExpAllocMode('new')}
                  className={`p-2.5 rounded-xl border font-bold transition-all ${
                    expAllocMode === 'new'
                      ? 'border-hope bg-hope/10 text-hope'
                      : 'border-border-subtle bg-bg-surface text-text-muted'
                  }`}
                >
                  Create New (+2)
                </button>
              </div>

              {expAllocMode === 'existing' && character.experiences.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-text-muted font-semibold">
                    Select Experience:
                  </span>
                  <select
                    value={tierExpId}
                    onChange={(e) => setTierExpId(e.target.value)}
                    className="w-full bg-bg-surface border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
                  >
                    {character.experiences.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.name} (+{exp.bonus} &rarr; +{exp.bonus + 2})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {expAllocMode === 'new' && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-text-muted font-semibold">
                    New Experience Name:
                  </span>
                  <input
                    type="text"
                    value={newExpName}
                    onChange={(e) => setNewExpName(e.target.value)}
                    placeholder="e.g. Arcane Historian, Wilderness Scout"
                    className="w-full bg-bg-surface border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: ADVANCEMENTS */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-bg-secondary p-3 rounded-2xl border border-border-subtle">
              <div>
                <h3 className="text-xs font-bold text-text-primary">
                  Choose 2 Advancements ({totalSlotsChosen}/2 Slots)
                </h3>
                <p className="text-[11px] text-text-muted">
                  Traits marked this tier cannot be marked again until next tier.
                </p>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                  totalSlotsChosen === 2
                    ? 'bg-domain-sage/20 text-domain-sage border border-domain-sage/40'
                    : 'bg-hope/20 text-hope border border-hope/40'
                }`}
              >
                {totalSlotsChosen} / 2
              </span>
            </div>

            {/* Validation warning */}
            {!validation.valid && !isHouseRulesEnabled && (
              <div className="bg-fear/10 border border-fear/30 text-fear p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{validation.errors[0]}</span>
              </div>
            )}

            {/* 1. Trait Advancements */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Trait Boosts (+1 to Trait)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRAIT_NAMES.map((trait) => {
                  const isMarkedInTier =
                    !isTierAchieve && character.markedTraitsThisTier.includes(trait);
                  const isSelected = selectedAdvancements.some(
                    (a) => a.type === 'trait' && a.trait === trait
                  );

                  return (
                    <button
                      key={trait}
                      type="button"
                      disabled={isMarkedInTier && !isHouseRulesEnabled}
                      onClick={() =>
                        toggleAdvancement({
                          id: `adv-trait-${trait}`,
                          type: 'trait',
                          trait,
                          slotsCost: 1,
                          label: `+1 ${trait}`,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-hope bg-hope/10 text-text-primary ring-2 ring-hope/30 font-bold'
                          : isMarkedInTier && !isHouseRulesEnabled
                          ? 'opacity-40 bg-bg-secondary border-border-subtle cursor-not-allowed text-text-muted'
                          : 'bg-bg-surface border-border-subtle text-text-secondary hover:bg-bg-hover'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{trait}</div>
                        <div className="text-[10px] text-text-muted">
                          Current: {character.traits[trait] >= 0 ? `+${character.traits[trait]}` : character.traits[trait]}
                          {isMarkedInTier && ' (Marked)'}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-hope" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Vitals & Combat Advancements */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Combat Resources &amp; Vitals
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'adv-hp',
                    type: 'hp' as AdvancementType,
                    label: '+1 Max HP',
                    sub: `Current: ${character.hp.max}`,
                    icon: Heart,
                  },
                  {
                    id: 'adv-stress',
                    type: 'stress' as AdvancementType,
                    label: '+1 Max Stress',
                    sub: `Current: ${character.stress.max}`,
                    icon: Zap,
                  },
                  {
                    id: 'adv-evasion',
                    type: 'evasion' as AdvancementType,
                    label: '+1 Evasion',
                    sub: `Current: ${character.evasion}`,
                    icon: Shield,
                  },
                  {
                    id: 'adv-hope',
                    type: 'hope' as AdvancementType,
                    label: '+1 Max Hope',
                    sub: `Current: ${character.hope.max}`,
                    icon: Sparkles,
                  },
                  {
                    id: 'adv-armor',
                    type: 'armor_slot' as AdvancementType,
                    label: '+1 Armor Slot',
                    sub: `Current: ${character.armor.maxSlots}`,
                    icon: Shield,
                  },
                ].map((item) => {
                  const isSelected = selectedAdvancements.some((a) => a.id === item.id);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        toggleAdvancement({
                          id: item.id,
                          type: item.type,
                          slotsCost: 1,
                          label: item.label,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-hope bg-hope/10 text-text-primary ring-2 ring-hope/30 font-bold'
                          : 'bg-bg-surface border-border-subtle text-text-secondary hover:bg-bg-hover'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-hope" />
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-text-muted">{item.sub}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-hope" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Experience Advancement */}
            <div className="bg-bg-secondary p-3.5 rounded-2xl border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">
                  Experience Advancement (+1)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const isSelected = selectedAdvancements.some((a) => a.id === 'adv-exp');
                    if (isSelected) {
                      setSelectedAdvancements((prev) => prev.filter((a) => a.id !== 'adv-exp'));
                    } else {
                      toggleAdvancement({
                        id: 'adv-exp',
                        type: 'experience',
                        slotsCost: 1,
                        experienceId: advExpMode === 'existing' ? advExpId : undefined,
                        newExperienceName: advExpMode === 'new' ? advNewExpName : undefined,
                        label:
                          advExpMode === 'existing'
                            ? `+1 to ${character.experiences.find((e) => e.id === advExpId)?.name || 'Exp'}`
                            : `New Exp: ${advNewExpName || 'Skill'}`,
                      });
                    }
                  }}
                  className={`text-xs px-3 py-1 rounded-lg border font-bold ${
                    selectedAdvancements.some((a) => a.id === 'adv-exp')
                      ? 'border-hope bg-hope text-bg-primary'
                      : 'border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  {selectedAdvancements.some((a) => a.id === 'adv-exp') ? 'Selected' : 'Select'}
                </button>
              </div>

              {selectedAdvancements.some((a) => a.id === 'adv-exp') && (
                <div className="pt-2 border-t border-border-subtle space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setAdvExpMode('existing')}
                      className={`p-2 rounded-lg border text-xs font-bold ${
                        advExpMode === 'existing'
                          ? 'border-hope bg-hope/10 text-hope'
                          : 'border-border-subtle bg-bg-surface text-text-muted'
                      }`}
                    >
                      Existing (+1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdvExpMode('new')}
                      className={`p-2 rounded-lg border text-xs font-bold ${
                        advExpMode === 'new'
                          ? 'border-hope bg-hope/10 text-hope'
                          : 'border-border-subtle bg-bg-surface text-text-muted'
                      }`}
                    >
                      New Experience (+2)
                    </button>
                  </div>

                  {advExpMode === 'existing' && (
                    <select
                      value={advExpId}
                      onChange={(e) => setAdvExpId(e.target.value)}
                      className="w-full bg-bg-surface border border-border-subtle rounded-xl p-2 text-xs text-text-primary"
                    >
                      {character.experiences.map((exp) => (
                        <option key={exp.id} value={exp.id}>
                          {exp.name} (+{exp.bonus} &rarr; +{exp.bonus + 1})
                        </option>
                      ))}
                    </select>
                  )}

                  {advExpMode === 'new' && (
                    <input
                      type="text"
                      placeholder="New experience name"
                      value={advNewExpName}
                      onChange={(e) => setAdvNewExpName(e.target.value)}
                      className="w-full bg-bg-surface border border-border-subtle rounded-xl p-2 text-xs text-text-primary"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: DOMAIN CARD PICKER */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-bg-secondary p-3 rounded-2xl border border-border-subtle">
              <h3 className="text-xs font-bold text-text-primary">
                Select 1 New Domain Card (Class Domains &middot; Level &le; {newLevel})
              </h3>
              <p className="text-[11px] text-text-muted">
                Eligible domains: {classDef?.domains.join(' & ')}
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {availableCards.map((card) => {
                const isSelected = selectedCard?.id === card.id;

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setSelectedCard(card)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-hope bg-hope/10 ring-2 ring-hope/30 font-bold'
                        : 'border-border-subtle bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-surface text-text-muted border border-border-subtle font-mono">
                          Lvl {card.level} &middot; {card.domain}
                        </span>
                        <span className="text-[10px] font-mono text-hope font-bold">
                          ⚡ {card.recallCost} Recall
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-text-primary">{card.name}</h4>
                      <p className="text-[11px] text-text-muted mt-1 line-clamp-2 leading-relaxed">
                        {card.text}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="mt-2 text-[10px] text-hope font-bold uppercase flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Optional Card Exchange Toggle */}
            <div className="bg-bg-secondary p-3.5 rounded-2xl border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-text-muted" /> Exchange 1 Card (Optional)
                  </span>
                  <p className="text-[10px] text-text-muted">
                    Swap 1 previously acquired domain card for another card.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExchanging((prev) => !prev)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                    isExchanging
                      ? 'border-hope bg-hope/20 text-hope'
                      : 'border-border-subtle bg-bg-surface text-text-muted'
                  }`}
                >
                  {isExchanging ? 'Enabled' : 'Enable'}
                </button>
              </div>

              {isExchanging && (
                <div className="pt-2 border-t border-border-subtle space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase">
                      Card to Return:
                    </span>
                    <select
                      value={exchangeReturnId}
                      onChange={(e) => setExchangeReturnId(e.target.value)}
                      className="w-full bg-bg-surface border border-border-subtle rounded-xl p-2 text-xs text-text-primary"
                    >
                      {[...character.loadout, ...character.vault].map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.domain} Lvl {c.level})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase">
                      Replacement Card:
                    </span>
                    <select
                      value={exchangeReplacement?.id || ''}
                      onChange={(e) => {
                        const found = legalCards.find((c) => c.id === e.target.value);
                        setExchangeReplacement(found || null);
                      }}
                      className="w-full bg-bg-surface border border-border-subtle rounded-xl p-2 text-xs text-text-primary"
                    >
                      <option value="">-- Choose replacement --</option>
                      {legalCards
                        .filter((c) => c.id !== selectedCard?.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.domain} Lvl {c.level})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-bg-secondary rounded-2xl p-4 border border-border-subtle space-y-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Advancement Summary
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-text-muted block text-[11px]">Level:</span>
                  <span className="font-bold text-text-primary">
                    {character.level} &rarr;{' '}
                    <span className="text-hope font-extrabold">{newLevel}</span>
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">Damage Thresholds:</span>
                  <span className="font-bold text-text-primary">
                    {character.damageThresholds.minor + 1} /{' '}
                    {character.damageThresholds.major + 1} /{' '}
                    {character.damageThresholds.severe + 1}{' '}
                    <span className="text-domain-sage font-mono text-[10px]">(+1 each)</span>
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[11px]">Proficiency:</span>
                  <span className="font-bold text-text-primary">
                    +{character.proficiency}
                    {isTierAchieve && (
                      <span className="text-hope font-extrabold ml-1">
                        &rarr; +{character.proficiency + 1}
                      </span>
                    )}
                  </span>
                </div>

                {isTierAchieve && newLevel >= 5 && (
                  <div>
                    <span className="text-text-muted block text-[11px]">Subclass Card:</span>
                    <span className="font-bold text-hope uppercase">
                      {newLevel === 5 ? 'Specialization' : 'Mastery'}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border-subtle text-xs space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase block">
                  Chosen Advancements:
                </span>
                {selectedAdvancements.map((a) => (
                  <div key={a.id} className="text-text-primary font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-hope" />
                    <span>{a.label}</span>
                  </div>
                ))}
              </div>

              {selectedCard && (
                <div className="pt-2 border-t border-border-subtle text-xs space-y-1">
                  <span className="text-[11px] font-bold text-text-muted uppercase block">
                    Acquired Domain Card:
                  </span>
                  <div className="text-text-primary font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-hope" />
                    <span>{selectedCard.name}</span>
                    <span className="text-[10px] text-text-muted font-normal">
                      ({selectedCard.domain} Lvl {selectedCard.level})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={() => {
              if (step > (isTierAchieve ? 1 : 2)) {
                setStep((prev) => prev - 1);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-border-subtle transition-colors"
          >
            {step === (isTierAchieve ? 1 : 2) ? 'Cancel' : 'Back'}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && !validation.valid && !isHouseRulesEnabled) {
                  return;
                }
                setStep((prev) => prev + 1);
              }}
              disabled={step === 2 && !validation.valid && !isHouseRulesEnabled}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-hope text-bg-primary hover:bg-hope-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={!validation.valid && !isHouseRulesEnabled}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-hope text-bg-primary hover:bg-hope-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Confirm Level Up to {newLevel}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
