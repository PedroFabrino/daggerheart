import React, { useState } from 'react';
import { Character } from '../../types/daggerheart';
import {
  applyShortRest,
  applyLongRest,
  ShortRestMoveType,
} from '../../domain/rest';
import {
  BedDouble,
  X,
  Heart,
  Zap,
  Shield,
  Sparkles,
  Dices,
  Check,
  Info,
} from 'lucide-react';

interface RestModalProps {
  character: Character;
  onConfirm: (updated: Character) => void;
  onClose: () => void;
}

export const RestModal: React.FC<RestModalProps> = ({
  character,
  onConfirm,
  onClose,
}) => {
  const [restType, setRestType] = useState<'short' | 'long'>('short');
  const [diceMode, setDiceMode] = useState<'digital' | 'manual'>('digital');

  // Short Rest: select up to 2 moves
  const [selectedMoves, setSelectedMoves] = useState<
    { type: ShortRestMoveType; amount: number; rolledValue?: number }[]
  >([]);

  const toggleMove = (type: ShortRestMoveType) => {
    const existingIndex = selectedMoves.findIndex((m) => m.type === type);
    if (existingIndex >= 0) {
      setSelectedMoves((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      if (selectedMoves.length >= 2) return;
      // If digital, roll 1d4 (or 1 for prepare)
      const rolled = type === 'prepare' ? 1 : Math.floor(Math.random() * 4) + 1;
      setSelectedMoves((prev) => [
        ...prev,
        {
          type,
          amount: rolled,
          rolledValue: rolled,
        },
      ]);
    }
  };

  const updateMoveAmount = (type: ShortRestMoveType, amount: number) => {
    setSelectedMoves((prev) =>
      prev.map((m) => (m.type === type ? { ...m, amount } : m))
    );
  };

  const handleConfirmRest = () => {
    if (restType === 'long') {
      const updated = applyLongRest(character);
      onConfirm(updated);
    } else {
      const updated = applyShortRest(character, selectedMoves);
      onConfirm(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-domain-sage/20 text-domain-sage flex items-center justify-center font-bold">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-text-primary">
                Downtime Rest
              </h3>
              <p className="text-[11px] text-text-muted">
                Recover resources &amp; freely adjust active domain cards
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

        {/* Rest Type Selector */}
        <div className="bg-bg-secondary p-1 rounded-xl border border-border-subtle grid grid-cols-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setRestType('short')}
            className={`py-2 px-3 rounded-lg font-bold transition-all ${
              restType === 'short'
                ? 'bg-bg-surface text-domain-sage shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Short Rest (Pick 2 Moves)
          </button>
          <button
            type="button"
            onClick={() => setRestType('long')}
            className={`py-2 px-3 rounded-lg font-bold transition-all ${
              restType === 'long'
                ? 'bg-bg-surface text-hope shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Long Rest (Full Recovery)
          </button>
        </div>

        {/* SHORT REST CONTENT */}
        {restType === 'short' && (
          <div className="space-y-4">
            {/* Digital vs Physical Dice Toggle */}
            <div className="flex items-center justify-between bg-bg-secondary/70 p-2.5 rounded-xl border border-border-subtle text-xs">
              <span className="text-text-muted font-medium flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-text-muted" /> Recovery Die Rolling:
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setDiceMode('digital')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    diceMode === 'digital'
                      ? 'bg-domain-sage text-bg-primary'
                      : 'bg-bg-surface text-text-muted hover:text-text-primary'
                  }`}
                >
                  Digital (1d4)
                </button>
                <button
                  type="button"
                  onClick={() => setDiceMode('manual')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    diceMode === 'manual'
                      ? 'bg-domain-sage text-bg-primary'
                      : 'bg-bg-surface text-text-muted hover:text-text-primary'
                  }`}
                >
                  Physical Die (Manual)
                </button>
              </div>
            </div>

            {/* Downtime Moves Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">
                  Choose up to 2 Downtime Moves ({selectedMoves.length}/2):
                </span>
              </div>

              <div className="space-y-2">
                {[
                  {
                    type: 'tend_wounds' as ShortRestMoveType,
                    title: 'Tend Wounds',
                    sub: `Clear HP damage (Marked: ${character.hp.currentDamage}/${character.hp.max})`,
                    icon: Heart,
                    color: 'text-fear-light',
                  },
                  {
                    type: 'clear_stress' as ShortRestMoveType,
                    title: 'Clear Stress',
                    sub: `Clear stress slots (Marked: ${character.stress.current}/${character.stress.max})`,
                    icon: Zap,
                    color: 'text-hope',
                  },
                  {
                    type: 'repair_armor' as ShortRestMoveType,
                    title: 'Repair Armor',
                    sub: `Clear marked armor slots (Marked: ${character.armor.markedSlots}/${character.armor.maxSlots})`,
                    icon: Shield,
                    color: 'text-domain-blade',
                  },
                  {
                    type: 'prepare' as ShortRestMoveType,
                    title: 'Prepare',
                    sub: `Gain 1 Hope (Current: ${character.hope.current}/${character.hope.max})`,
                    icon: Sparkles,
                    color: 'text-amber-400',
                  },
                ].map((item) => {
                  const isSelected = selectedMoves.some((m) => m.type === item.type);
                  const currentMove = selectedMoves.find((m) => m.type === item.type);
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.type}
                      className={`p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-domain-sage bg-domain-sage/10'
                          : 'border-border-subtle bg-bg-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleMove(item.type)}
                          className="flex items-center gap-2.5 flex-1 text-left"
                        >
                          <Icon className={`w-4 h-4 ${item.color}`} />
                          <div>
                            <div className="text-xs font-bold text-text-primary">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-text-muted">{item.sub}</div>
                          </div>
                        </button>

                        <div className="flex items-center gap-2">
                          {isSelected && item.type !== 'prepare' && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-text-muted">Recover:</span>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                value={currentMove?.amount || 1}
                                onChange={(e) =>
                                  updateMoveAmount(
                                    item.type,
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                                className="w-14 bg-bg-surface border border-border-subtle rounded-lg p-1 text-xs text-center font-bold text-text-primary focus:outline-none focus:border-domain-sage"
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleMove(item.type)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-domain-sage text-bg-primary border-domain-sage'
                                : 'bg-bg-surface text-text-muted border-border-subtle hover:text-text-primary'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LONG REST CONTENT */}
        {restType === 'long' && (
          <div className="bg-bg-secondary p-4 rounded-2xl border border-border-subtle space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <Sparkles className="w-4 h-4 text-hope" />
              <span>Full Long Rest Restoration:</span>
            </div>

            <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside">
              <li>
                <strong className="text-text-primary">HP Damage:</strong> Cleared to{' '}
                <span className="text-hope font-mono font-bold">0 / {character.hp.max}</span>.
              </li>
              <li>
                <strong className="text-text-primary">Stress:</strong> Cleared to{' '}
                <span className="text-hope font-mono font-bold">0 / {character.stress.max}</span>.
              </li>
              <li>
                <strong className="text-text-primary">Armor Slots:</strong> All{' '}
                <span className="text-hope font-mono font-bold">
                  {character.armor.maxSlots}
                </span>{' '}
                slots repaired.
              </li>
              <li>
                <strong className="text-text-primary">Hope:</strong> Restored to at least{' '}
                <span className="text-hope font-mono font-bold">
                  {Math.max(2, character.hope.current)} / {character.hope.max}
                </span>.
              </li>
            </ul>
          </div>
        )}

        {/* Free Card Swapping Info */}
        <div className="bg-hope/10 border border-hope/30 rounded-xl p-3 text-xs text-hope flex items-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            During downtime rest, swapping cards between your Loadout and Vault costs <strong>0 Stress</strong>.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-border-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmRest}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-domain-sage text-bg-primary hover:bg-emerald-400 transition-all shadow-md flex items-center gap-1.5"
          >
            <BedDouble className="w-4 h-4" />
            <span>Apply {restType === 'short' ? 'Short Rest' : 'Long Rest'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
