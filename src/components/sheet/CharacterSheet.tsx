import React from 'react';
import { Character } from '../../types/daggerheart';
import { CharacterHeader } from './CharacterHeader';
import { VitalsTrackers } from './VitalsTrackers';
import { ExperiencesList } from './ExperiencesList';
import { WeaponsAndEquipment } from './WeaponsAndEquipment';

import { CardTray } from '../cards/CardTray';

interface CharacterSheetProps {
  character: Character;
  onUpdate: (updater: (prev: Character) => Character) => void;
  onOpenLevelUp?: () => void;
  onOpenRest?: () => void;
  isHouseRulesEnabled: boolean;
  onToggleHouseRules: () => void;
}

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

      {/* 5. Domain Card Tray & Features */}
      <CardTray
        character={character}
        onUpdate={(updated) => onUpdate(() => updated)}
      />
    </div>
  );
};
