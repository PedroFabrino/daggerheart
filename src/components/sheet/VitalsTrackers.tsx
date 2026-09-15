import React, { useState } from 'react';
import { Character } from '../../types/daggerheart';
import { calculateDamageSeverity } from '../../domain/combatMath';
import { Shield, Heart, Zap, Sparkles, Plus, Minus, RotateCcw } from 'lucide-react';

interface VitalsTrackersProps {
  character: Character;
  onUpdate: (updater: (prev: Character) => Character) => void;
}

export const VitalsTrackers: React.FC<VitalsTrackersProps> = ({
  character,
  onUpdate,
}) => {
  const [incomingDamageInput, setIncomingDamageInput] = useState<string>('');
  const [useArmorReduction, setUseArmorReduction] = useState<boolean>(true);

  // HP manipulation
  const setDamage = (newDamage: number) => {
    const bounded = Math.max(0, Math.min(character.hp.max, newDamage));
    onUpdate((prev) => ({
      ...prev,
      hp: { ...prev.hp, currentDamage: bounded },
    }));
  };

  // Stress manipulation
  const setStress = (newStress: number) => {
    const bounded = Math.max(0, Math.min(character.stress.max, newStress));
    onUpdate((prev) => ({
      ...prev,
      stress: { ...prev.stress, current: bounded },
    }));
  };

  // Hope manipulation
  const setHope = (newHope: number) => {
    const bounded = Math.max(0, Math.min(character.hope.max, newHope));
    onUpdate((prev) => ({
      ...prev,
      hope: { ...prev.hope, current: bounded },
    }));
  };

  // Armor marked slots manipulation
  const toggleArmorSlot = (index: number) => {
    onUpdate((prev) => {
      const current = prev.armor.markedSlots;
      const next = index < current ? index : index + 1;
      return {
        ...prev,
        armor: { ...prev.armor, markedSlots: next },
      };
    });
  };

  // Quick damage resolution
  const parsedDamage = parseInt(incomingDamageInput, 10);
  const effectiveDamage =
    !isNaN(parsedDamage) && parsedDamage > 0
      ? useArmorReduction && character.armor.markedSlots < character.armor.maxSlots
        ? Math.max(0, parsedDamage - character.armor.score)
        : parsedDamage
      : 0;

  const evaluation = !isNaN(parsedDamage) && parsedDamage > 0
    ? calculateDamageSeverity(effectiveDamage, character.damageThresholds)
    : null;

  const applyEvaluatedDamage = () => {
    if (!evaluation) return;
    onUpdate((prev) => {
      let nextMarkedArmor = prev.armor.markedSlots;
      if (
        useArmorReduction &&
        prev.armor.markedSlots < prev.armor.maxSlots &&
        parsedDamage > 0
      ) {
        nextMarkedArmor = Math.min(prev.armor.maxSlots, prev.armor.markedSlots + 1);
      }
      const newDamage = Math.min(prev.hp.max, prev.hp.currentDamage + evaluation.hpDamage);
      return {
        ...prev,
        hp: { ...prev.hp, currentDamage: newDamage },
        armor: { ...prev.armor, markedSlots: nextMarkedArmor },
      };
    });
    setIncomingDamageInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Hit Points & Damage Track */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-fear" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Hit Points
              </h3>
            </div>
            <div className="text-xs font-mono font-bold text-text-muted">
              <span className="text-text-primary">
                {character.hp.max - character.hp.currentDamage}
              </span>{' '}
              / {character.hp.max}
            </div>
          </div>

          {/* Clickable HP Slots */}
          <div className="flex gap-1.5 my-3">
            {Array.from({ length: character.hp.max }).map((_, i) => {
              const isMarked = i < character.hp.currentDamage;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDamage(isMarked ? i : i + 1)}
                  className={`flex-1 h-9 rounded-lg border transition-all flex items-center justify-center ${
                    isMarked
                      ? 'bg-fear/30 border-fear text-fear font-bold shadow-inner'
                      : 'bg-bg-secondary hover:bg-bg-hover border-border-subtle'
                  }`}
                  title={isMarked ? `Slot ${i + 1} Marked (Click to clear)` : `Slot ${i + 1} Clear (Click to mark)`}
                >
                  {isMarked ? '✕' : ''}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-3 text-xs">
          <button
            onClick={() => setDamage(character.hp.currentDamage - 1)}
            disabled={character.hp.currentDamage <= 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary hover:bg-bg-hover border border-border-subtle disabled:opacity-30 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" /> Heal 1
          </button>
          <button
            onClick={() => setDamage(0)}
            disabled={character.hp.currentDamage <= 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-secondary hover:bg-bg-hover border border-border-subtle text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear All
          </button>
          <button
            onClick={() => setDamage(character.hp.currentDamage + 1)}
            disabled={character.hp.currentDamage >= character.hp.max}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-fear/20 hover:bg-fear/30 text-fear-light font-bold border border-fear/30 disabled:opacity-30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Mark 1
          </button>
        </div>
      </div>

      {/* 2. Stress & Hope Resource Pools */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
        {/* Stress Track */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-fear-light" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Stress
              </h3>
            </div>
            <div className="text-xs font-mono font-bold text-fear-light">
              {character.stress.current} / {character.stress.max}
            </div>
          </div>

          <div className="flex gap-1.5 my-2">
            {Array.from({ length: character.stress.max }).map((_, i) => {
              const isMarked = i < character.stress.current;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStress(isMarked ? i : i + 1)}
                  className={`flex-1 h-7 rounded-md border transition-all flex items-center justify-center text-xs ${
                    isMarked
                      ? 'bg-fear border-fear-light text-text-primary font-bold shadow'
                      : 'bg-bg-secondary hover:bg-bg-hover border-border-subtle'
                  }`}
                  title={isMarked ? 'Click to clear' : 'Click to mark'}
                >
                  {isMarked ? '✕' : ''}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <button
              onClick={() => setStress(character.stress.current - 1)}
              disabled={character.stress.current <= 0}
              className="hover:text-text-primary disabled:opacity-30"
            >
              -1 Clear
            </button>
            <button
              onClick={() => setStress(0)}
              disabled={character.stress.current <= 0}
              className="hover:text-text-primary disabled:opacity-30"
            >
              Clear All
            </button>
            <button
              onClick={() => setStress(character.stress.current + 1)}
              disabled={character.stress.current >= character.stress.max}
              className="hover:text-fear-light font-bold disabled:opacity-30"
            >
              +1 Mark
            </button>
          </div>
        </div>

        {/* Hope Track */}
        <div className="border-t border-border-subtle pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-hope" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Hope
              </h3>
            </div>
            <div className="text-xs font-mono font-bold text-hope">
              {character.hope.current} / {character.hope.max}
            </div>
          </div>

          <div className="flex gap-1.5 my-2">
            {Array.from({ length: character.hope.max }).map((_, i) => {
              const isMarked = i < character.hope.current;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setHope(isMarked ? i : i + 1)}
                  className={`flex-1 h-7 rounded-full border transition-all ${
                    isMarked
                      ? 'bg-hope border-hope-light shadow-md shadow-hope/30'
                      : 'bg-bg-secondary hover:bg-bg-hover border-border-subtle'
                  }`}
                  title={isMarked ? 'Click to spend' : 'Click to gain'}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <button
              onClick={() => setHope(character.hope.current - 1)}
              disabled={character.hope.current <= 0}
              className="hover:text-text-primary disabled:opacity-30"
            >
              Spend 1
            </button>
            <button
              onClick={() => setHope(2)}
              className="hover:text-text-primary"
            >
              Reset to 2
            </button>
            <button
              onClick={() => setHope(character.hope.current + 1)}
              disabled={character.hope.current >= character.hope.max}
              className="hover:text-hope font-bold disabled:opacity-30"
            >
              +1 Gain
            </button>
          </div>
        </div>
      </div>

      {/* 3. Armor, Damage Thresholds & Quick Resolver */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
        {/* Armor & Thresholds Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-hope" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Armor & Thresholds
              </h3>
            </div>
            <span className="text-xs font-bold text-text-primary">
              Score: <span className="text-hope font-mono text-sm">{character.armor.score}</span>
            </span>
          </div>

          {/* Armor Slots */}
          <div className="bg-bg-secondary p-2.5 rounded-xl border border-border-subtle">
            <div className="flex items-center justify-between text-[10px] text-text-muted font-bold mb-1.5">
              <span>ARMOR SLOTS</span>
              <span>
                {character.armor.maxSlots - character.armor.markedSlots} available
              </span>
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: character.armor.maxSlots }).map((_, i) => {
                const isMarked = i < character.armor.markedSlots;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleArmorSlot(i)}
                    className={`flex-1 h-6 rounded border transition-all text-xs font-bold flex items-center justify-center ${
                      isMarked
                        ? 'bg-border-subtle/80 border-border-highlight text-text-muted'
                        : 'bg-hope/20 border-hope text-hope-light hover:bg-hope/30 shadow-sm'
                    }`}
                    title={isMarked ? 'Armor Slot Marked (Absorbed damage)' : 'Armor Slot Clear'}
                  >
                    {isMarked ? '✕' : <Shield className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thresholds Display */}
          <div className="grid grid-cols-3 gap-2 text-center mt-3">
            <div className="bg-bg-secondary p-2 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-text-muted font-bold block">MINOR</span>
              <span className="text-sm font-black text-text-primary">
                {character.damageThresholds.minor}
              </span>
              <span className="text-[9px] text-text-muted block">Mark 1 HP</span>
            </div>
            <div className="bg-bg-secondary p-2 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-text-muted font-bold block">MAJOR</span>
              <span className="text-sm font-black text-hope">
                {character.damageThresholds.major}
              </span>
              <span className="text-[9px] text-text-muted block">Mark 2 HP</span>
            </div>
            <div className="bg-bg-secondary p-2 rounded-lg border border-border-subtle">
              <span className="text-[10px] text-text-muted font-bold block">SEVERE</span>
              <span className="text-sm font-black text-fear-light">
                {character.damageThresholds.severe}+
              </span>
              <span className="text-[9px] text-text-muted block">Mark 3 HP</span>
            </div>
          </div>
        </div>

        {/* Incoming Damage Quick Resolver */}
        <div className="border-t border-border-subtle pt-3">
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1.5">
            Incoming Damage Calculator
          </span>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="Damage"
              value={incomingDamageInput}
              onChange={(e) => setIncomingDamageInput(e.target.value)}
              className="w-20 bg-bg-secondary border border-border-subtle rounded-lg px-2 py-1 text-xs text-center font-mono font-bold text-text-primary focus:outline-none focus:border-hope"
            />

            {evaluation && (
              <div className="flex-1 flex items-center justify-between bg-bg-secondary px-2.5 py-1 rounded-lg border border-border-subtle text-xs">
                <span className="text-text-muted">
                  {evaluation.severity}: <strong className="text-hope">Mark {evaluation.hpDamage} HP</strong>
                </span>
                <button
                  onClick={applyEvaluatedDamage}
                  className="px-2.5 py-0.5 bg-fear text-text-primary rounded font-bold hover:bg-fear-light transition-colors text-[11px]"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
          {character.armor.markedSlots < character.armor.maxSlots && (
            <label className="flex items-center gap-1.5 text-[10px] text-text-muted cursor-pointer mt-1.5">
              <input
                type="checkbox"
                checked={useArmorReduction}
                onChange={(e) => setUseArmorReduction(e.target.checked)}
                className="rounded border-border-subtle text-hope bg-bg-secondary"
              />
              Mark 1 Armor Slot to absorb {character.armor.score} damage
            </label>
          )}
        </div>
      </div>
    </div>
  );
};
