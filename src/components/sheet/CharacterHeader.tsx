import React from 'react';
import { Character } from '../../types/daggerheart';
import { getTierForLevel } from '../../domain/combatMath';
import { Flame, BedDouble, Wrench, Dices } from 'lucide-react';

interface CharacterHeaderProps {
  character: Character;
  onOpenLevelUp?: () => void;
  onOpenRest?: () => void;
  onOpenDiceRoll?: () => void;
  isHouseRulesEnabled: boolean;
  onToggleHouseRules: () => void;
}

export const CharacterHeader: React.FC<CharacterHeaderProps> = ({
  character,
  onOpenLevelUp,
  onOpenRest,
  onOpenDiceRoll,
  isHouseRulesEnabled,
  onToggleHouseRules,
}) => {
  const tier = getTierForLevel(character.level);

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
              {character.name}
            </h1>
            <span className="text-xs bg-bg-secondary px-2.5 py-0.5 rounded-full border border-border-subtle text-text-muted font-semibold">
              {character.pronouns}
            </span>
            <button
              onClick={onToggleHouseRules}
              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 transition-colors ${
                isHouseRulesEnabled
                  ? 'bg-hope/20 text-hope border-hope/40'
                  : 'bg-bg-secondary hover:bg-bg-hover text-text-muted border-border-subtle'
              }`}
              title="Toggle House Rules override mode"
            >
              <Wrench className="w-3 h-3" />
              {isHouseRulesEnabled ? 'House Rules Active' : 'House Rules'}
            </button>
          </div>


          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mt-1.5">
            <span className="font-bold text-hope">
              Level {character.level} (Tier {tier})
            </span>
            <span>&middot;</span>
            <span className="text-text-primary font-semibold">
              {character.heritage.ancestryName}
            </span>
            <span className="text-text-primary font-bold">
              {character.className}
            </span>
            <span className="text-text-muted">({character.subclassName})</span>
            <span>&middot;</span>
            <span className="text-text-primary font-semibold">
              {character.heritage.communityName}
            </span>
          </div>
        </div>

        {/* Quick Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-bg-secondary px-3.5 py-2 rounded-xl border border-border-subtle">
            <div className="text-center">
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">
                Proficiency
              </span>
              <span className="text-base font-black text-hope">
                +{character.proficiency}
              </span>
            </div>
            <div className="w-px h-6 bg-border-subtle" />
            <div className="text-center">
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">
                Evasion
              </span>
              <span className="text-base font-black text-text-primary">
                {character.evasion}
              </span>
            </div>
          </div>

          {/* Dice Roller Button */}
          {onOpenDiceRoll && (
            <button
              onClick={onOpenDiceRoll}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-bg-secondary hover:bg-bg-hover border border-border-subtle text-text-primary transition-all shadow-xs"
              title="Open optional Duality Dice roller"
            >
              <Dices className="w-4 h-4 text-hope" /> Roll Dice
            </button>
          )}

          {/* Rest Button */}
          {onOpenRest && (
            <button
              onClick={onOpenRest}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-bg-secondary hover:bg-bg-hover border border-border-subtle text-text-secondary transition-all"
            >
              <BedDouble className="w-4 h-4 text-domain-sage" /> Take a Rest
            </button>
          )}

          {/* Level Up Button */}
          {onOpenLevelUp && (
            <button
              onClick={onOpenLevelUp}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-hope text-bg-primary hover:bg-hope-light transition-all shadow-md shadow-hope/20"
            >
              <Flame className="w-4 h-4" /> Level Up
            </button>
          )}
        </div>
      </div>

      {/* Trait Sub-header Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
        {Object.entries(character.traits).map(([trait, val]) => (
          <div
            key={trait}
            className="bg-bg-secondary p-2.5 rounded-xl border border-border-subtle text-center"
          >
            <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              {trait}
            </div>
            <div className="text-lg font-black text-text-primary mt-0.5">
              {val > 0 ? `+${val}` : val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
