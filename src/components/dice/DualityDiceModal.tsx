import React, { useState } from 'react';
import { Character, TraitName, TRAIT_NAMES } from '../../types/daggerheart';
import {
  calculateDualityRoll,
  calculateWeaponDamageRoll,
  DualityRollResult,
} from '../../domain/dualityDice';
import {
  Sparkles,
  Flame,
  X,
  Dices,
  ShieldAlert,
  Swords,
} from 'lucide-react';

interface DualityDiceModalProps {
  character: Character;
  onClose: () => void;
  initialTrait?: TraitName;
  initialWeaponName?: string;
  initialWeaponDamage?: string;
}

export const DualityDiceModal: React.FC<DualityDiceModalProps> = ({
  character,
  onClose,
  initialTrait,
  initialWeaponName,
  initialWeaponDamage,
}) => {
  // Mode: Digital Roller vs Physical Dice Manual Entry
  const [rollerMode, setRollerMode] = useState<'digital' | 'physical'>('digital');

  // Duality Roll Config
  const [selectedTrait, setSelectedTrait] = useState<TraitName | 'NONE'>(
    initialTrait || 'NONE'
  );
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>('NONE');
  const [hopeDieInput, setHopeDieInput] = useState<number>(8);
  const [fearDieInput, setFearDieInput] = useState<number>(5);

  // Digital Roll Result State
  const [rollResult, setRollResult] = useState<DualityRollResult | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Weapon Damage State
  const [weaponDamageFormula, setWeaponDamageFormula] = useState<string>(
    initialWeaponDamage || ''
  );
  const [scaleWithProficiency, setScaleWithProficiency] = useState<boolean>(true);
  const [damageResult, setDamageResult] = useState<ReturnType<
    typeof calculateWeaponDamageRoll
  > | null>(null);

  const traitModifier =
    selectedTrait !== 'NONE' ? character.traits[selectedTrait] || 0 : 0;
  const experienceBonus =
    selectedExperienceId !== 'NONE'
      ? character.experiences.find((e) => e.id === selectedExperienceId)?.bonus || 0
      : 0;

  // Perform Digital Roll
  const handleDigitalRoll = () => {
    setIsRolling(true);
    setTimeout(() => {
      const hope = Math.floor(Math.random() * 12) + 1;
      const fear = Math.floor(Math.random() * 12) + 1;
      const res = calculateDualityRoll(
        hope,
        fear,
        traitModifier,
        experienceBonus,
        selectedTrait !== 'NONE' ? selectedTrait : undefined
      );
      setRollResult(res);
      setIsRolling(false);
    }, 250);
  };

  // Perform Physical Entry Calculation
  const handlePhysicalEntry = () => {
    const res = calculateDualityRoll(
      hopeDieInput,
      fearDieInput,
      traitModifier,
      experienceBonus,
      selectedTrait !== 'NONE' ? selectedTrait : undefined
    );
    setRollResult(res);
  };

  // Roll Weapon Damage
  const handleRollDamage = () => {
    if (!weaponDamageFormula.trim()) return;
    const res = calculateWeaponDamageRoll(
      weaponDamageFormula,
      scaleWithProficiency ? character.proficiency : 1
    );
    setDamageResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-hope/20 text-hope flex items-center justify-center font-bold">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-text-primary">
                Duality Dice Roller
              </h3>
              <p className="text-[11px] text-text-muted">
                1d12 Hope (Gold) + 1d12 Fear (Purple) + Modifiers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Roller Mode Selector: Digital vs Physical Dice Preference */}
        <div className="bg-bg-secondary p-1 rounded-xl border border-border-subtle grid grid-cols-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setRollerMode('digital')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              rollerMode === 'digital'
                ? 'bg-bg-surface text-hope shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>Digital Roller</span>
          </button>
          <button
            type="button"
            onClick={() => setRollerMode('physical')}
            className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
              rollerMode === 'physical'
                ? 'bg-bg-surface text-hope shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Enter Physical Roll</span>
          </button>
        </div>

        {/* Modifiers Picker */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Trait Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">
              Trait Modifier:
            </label>
            <select
              value={selectedTrait}
              onChange={(e) => setSelectedTrait(e.target.value as TraitName | 'NONE')}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
            >
              <option value="NONE">None (+0)</option>
              {TRAIT_NAMES.map((t) => (
                <option key={t} value={t}>
                  {t} ({character.traits[t] >= 0 ? `+${character.traits[t]}` : character.traits[t]})
                </option>
              ))}
            </select>
          </div>

          {/* Experience Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-text-muted uppercase">
              Experience Bonus:
            </label>
            <select
              value={selectedExperienceId}
              onChange={(e) => setSelectedExperienceId(e.target.value)}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
            >
              <option value="NONE">None (+0)</option>
              {character.experiences.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name} (+{exp.bonus})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PHYSICAL DICE MANUAL INPUT */}
        {rollerMode === 'physical' && (
          <div className="bg-bg-secondary p-4 rounded-2xl border border-border-subtle space-y-3">
            <span className="text-xs font-bold text-text-primary block">
              Enter your physical die roll numbers:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-hope font-bold uppercase block">
                  Hope Die (1-12):
                </span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={hopeDieInput}
                  onChange={(e) =>
                    setHopeDieInput(
                      Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1))
                    )
                  }
                  className="w-full bg-bg-surface border border-hope/40 rounded-xl p-2.5 text-center text-sm font-black text-hope focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-fear-light font-bold uppercase block">
                  Fear Die (1-12):
                </span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={fearDieInput}
                  onChange={(e) =>
                    setFearDieInput(
                      Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1))
                    )
                  }
                  className="w-full bg-bg-surface border border-fear/40 rounded-xl p-2.5 text-center text-sm font-black text-fear-light focus:outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePhysicalEntry}
              className="w-full py-2.5 rounded-xl bg-hope text-bg-primary font-bold text-xs hover:bg-hope-light transition-all shadow-md"
            >
              Calculate Result
            </button>
          </div>
        )}

        {/* DIGITAL ROLLER ACTION BUTTON */}
        {rollerMode === 'digital' && (
          <button
            type="button"
            onClick={handleDigitalRoll}
            disabled={isRolling}
            className="w-full py-3.5 rounded-2xl bg-hope text-bg-primary font-black text-sm hover:bg-hope-light transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{isRolling ? 'Rolling Duality Dice...' : 'Roll Duality Dice'}</span>
          </button>
        )}

        {/* VISUAL DIE FACES & OUTCOME BANNER */}
        {rollResult && (
          <div className="space-y-4 pt-2 border-t border-border-subtle animate-fade-in">
            {/* Visual Dice Display */}
            <div className="grid grid-cols-2 gap-4">
              {/* Hope Die (Gold) */}
              <div className="bg-bg-secondary p-4 rounded-2xl border-2 border-hope/50 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-hope">
                  Hope (d12)
                </div>
                <div className="w-16 h-16 rounded-2xl bg-hope text-bg-primary flex items-center justify-center text-3xl font-black shadow-md mt-2">
                  {rollResult.hopeDie}
                </div>
              </div>

              {/* Fear Die (Purple) */}
              <div className="bg-bg-secondary p-4 rounded-2xl border-2 border-fear/50 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider text-fear-light">
                  Fear (d12)
                </div>
                <div className="w-16 h-16 rounded-2xl bg-fear text-white flex items-center justify-center text-3xl font-black shadow-md mt-2">
                  {rollResult.fearDie}
                </div>
              </div>
            </div>

            {/* Total Math Formula */}
            <div className="bg-bg-secondary p-3 rounded-xl border border-border-subtle text-center text-xs space-y-1">
              <div className="text-text-muted">
                <span className="font-bold text-hope">{rollResult.hopeDie}</span> (Hope) +{' '}
                <span className="font-bold text-fear-light">{rollResult.fearDie}</span> (Fear)
                {rollResult.traitModifier !== 0 && (
                  <span>
                    {' '}
                    + {rollResult.traitModifier} ({rollResult.traitName})
                  </span>
                )}
                {rollResult.experienceBonus > 0 && (
                  <span> + {rollResult.experienceBonus} (Exp)</span>
                )}
              </div>
              <div className="text-2xl font-black text-text-primary">
                Total:{' '}
                <span className="text-hope font-mono font-black">
                  {rollResult.total}
                </span>
              </div>
            </div>

            {/* Narrative Outcome Banner */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                rollResult.outcome === 'critical'
                  ? 'bg-domain-splendor/20 border-domain-splendor text-amber-300'
                  : rollResult.outcome === 'hope'
                  ? 'bg-hope/15 border-hope text-hope'
                  : 'bg-fear/20 border-fear text-purple-300'
              }`}
            >
              {rollResult.outcome === 'critical' ? (
                <Flame className="w-6 h-6 flex-shrink-0 text-amber-400" />
              ) : rollResult.outcome === 'hope' ? (
                <Sparkles className="w-6 h-6 flex-shrink-0 text-hope" />
              ) : (
                <ShieldAlert className="w-6 h-6 flex-shrink-0 text-fear-light" />
              )}
              <div className="text-xs">
                <div className="font-extrabold uppercase tracking-wide">
                  {rollResult.outcome === 'critical'
                    ? 'Critical Success!'
                    : rollResult.outcome === 'hope'
                    ? 'Roll with Hope'
                    : 'Roll with Fear'}
                </div>
                <div className="text-[11px] leading-relaxed mt-0.5 opacity-90">
                  {rollResult.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OPTIONAL WEAPON DAMAGE ROLL (Scaled by Proficiency) */}
        <div className="bg-bg-secondary p-4 rounded-2xl border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-hope" />
              Weapon Damage {initialWeaponName ? `(${initialWeaponName})` : 'Roll'}
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              Proficiency: +{character.proficiency}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. d8 phy or d10+2 mag"
              value={weaponDamageFormula}
              onChange={(e) => setWeaponDamageFormula(e.target.value)}
              className="flex-1 bg-bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-hope"
            />
            <button
              type="button"
              onClick={handleRollDamage}
              className="px-4 py-2 rounded-xl bg-bg-surface hover:bg-bg-hover text-text-primary border border-border-subtle text-xs font-bold transition-all shadow-xs"
            >
              Roll Damage
            </button>
          </div>

          {/* Proficiency Scaling Option */}
          <div className="flex items-center justify-between text-[11px] bg-bg-surface/60 px-3 py-2 rounded-xl border border-border-subtle">
            <label className="flex items-center gap-2 cursor-pointer select-none text-text-secondary hover:text-text-primary">
              <input
                type="checkbox"
                checked={scaleWithProficiency}
                onChange={(e) => setScaleWithProficiency(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border-subtle text-hope focus:ring-hope/20 accent-hope"
              />
              <span className="font-semibold">
                Scale dice with Proficiency ({scaleWithProficiency ? `×${character.proficiency}` : 'Off'})
              </span>
            </label>
            <span className="text-[10px] text-text-muted italic">
              {scaleWithProficiency
                ? `1 die → ${character.proficiency} dice`
                : 'Roll exact formula'}
            </span>
          </div>

          {damageResult && (
            <div className="p-3 bg-bg-surface rounded-xl border border-border-subtle text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-muted uppercase block">
                  Rolled {damageResult.diceCount}d{damageResult.dieSides} ({damageResult.damageType}):
                </span>
                <span className="font-mono text-text-secondary">
                  [{damageResult.rolls.join(', ')}]
                  {damageResult.flatBonus > 0 && ` + ${damageResult.flatBonus}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-text-muted uppercase block">
                  Total Damage
                </span>
                <span className="text-lg font-black text-hope font-mono">
                  {damageResult.totalDamage}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
