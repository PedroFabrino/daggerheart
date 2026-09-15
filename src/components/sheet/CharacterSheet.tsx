import React from 'react';
import { Character, Domain } from '../../types/daggerheart';
import { CharacterHeader } from './CharacterHeader';
import { VitalsTrackers } from './VitalsTrackers';
import { ExperiencesList } from './ExperiencesList';
import { WeaponsAndEquipment } from './WeaponsAndEquipment';

interface CharacterSheetProps {
  character: Character;
  onUpdate: (updater: (prev: Character) => Character) => void;
  onOpenLevelUp?: () => void;
  onOpenRest?: () => void;
  isHouseRulesEnabled: boolean;
  onToggleHouseRules: () => void;
}

const domainColorMap: Record<Domain, string> = {
  Arcana: 'bg-domain-arcana',
  Blade: 'bg-domain-blade',
  Bone: 'bg-domain-bone',
  Codex: 'bg-domain-codex',
  Grace: 'bg-domain-grace',
  Midnight: 'bg-domain-midnight',
  Sage: 'bg-domain-sage',
  Splendor: 'bg-domain-splendor',
  Valor: 'bg-domain-valor',
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onUpdate,
  onOpenLevelUp,
  onOpenRest,
  isHouseRulesEnabled,
  onToggleHouseRules,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Character Identity & Traits Header */}
      <CharacterHeader
        character={character}
        onOpenLevelUp={onOpenLevelUp}
        onOpenRest={onOpenRest}
        isHouseRulesEnabled={isHouseRulesEnabled}
        onToggleHouseRules={onToggleHouseRules}
      />

      {/* 2. Combat Vitals Trackers (HP, Stress, Hope, Armor, Thresholds) */}
      <VitalsTrackers character={character} onUpdate={onUpdate} />

      {/* 3. Experiences */}
      <ExperiencesList
        character={character}
        onUpdate={onUpdate}
        isHouseRulesEnabled={isHouseRulesEnabled}
      />

      {/* 4. Weapons, Armor & Inventory */}
      <WeaponsAndEquipment character={character} onUpdate={onUpdate} />

      {/* 5. Loadout Cards Preview (Expanded in Ticket 04) */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Active Loadout ({character.loadout.length}/5)
          </h3>
          <span className="text-[11px] text-text-muted">
            Max 5 active cards &middot; Vault: {character.vault.length} cards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {character.loadout.map((card) => (
            <div
              key={card.id}
              className="p-4 bg-bg-secondary rounded-xl border border-border-subtle relative overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${domainColorMap[card.domain] || 'bg-hope'}`}
              />
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-surface border border-border-subtle text-text-muted">
                    Level {card.level} &middot; {card.domain}
                  </span>
                  <span className="text-[10px] font-mono text-hope font-semibold">
                    ⚡ {card.recallCost} Recall
                  </span>
                </div>
                <h4 className="font-bold text-sm text-text-primary">{card.name}</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {card.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
