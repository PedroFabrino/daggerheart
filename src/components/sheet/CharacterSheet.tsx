import React from 'react';
import { Character } from '../../types/daggerheart';
import { CharacterHeader } from './CharacterHeader';
import { VitalsTrackers } from './VitalsTrackers';
import { ExperiencesList } from './ExperiencesList';
import { WeaponsAndEquipment } from './WeaponsAndEquipment';

import { CardTray } from '../cards/CardTray';
import { LevelUpModal } from '../levelup/LevelUpModal';
import { RestModal } from '../rest/RestModal';
import { DualityDiceModal } from '../dice/DualityDiceModal';

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
  const [isLevelUpModalOpen, setIsLevelUpModalOpen] = React.useState<boolean>(false);
  const [isRestModalOpen, setIsRestModalOpen] = React.useState<boolean>(false);
  const [isDiceModalOpen, setIsDiceModalOpen] = React.useState<boolean>(false);

  const handleOpenLevelUp = () => {
    if (onOpenLevelUp) {
      onOpenLevelUp();
    }
    setIsLevelUpModalOpen(true);
  };

  const handleOpenRest = () => {
    if (onOpenRest) {
      onOpenRest();
    }
    setIsRestModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Character Identity & Traits Header */}
      <CharacterHeader
        character={character}
        onOpenLevelUp={handleOpenLevelUp}
        onOpenRest={handleOpenRest}
        onOpenDiceRoll={() => setIsDiceModalOpen(true)}
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

      {/* Level Up Assistant Modal */}
      {isLevelUpModalOpen && (
        <LevelUpModal
          character={character}
          onConfirm={(updated) => {
            onUpdate(() => updated);
            setIsLevelUpModalOpen(false);
          }}
          onClose={() => setIsLevelUpModalOpen(false)}
          isHouseRulesEnabled={isHouseRulesEnabled}
          onToggleHouseRules={onToggleHouseRules}
        />
      )}

      {/* Rest Recovery Modal */}
      {isRestModalOpen && (
        <RestModal
          character={character}
          onConfirm={(updated) => {
            onUpdate(() => updated);
            setIsRestModalOpen(false);
          }}
          onClose={() => setIsRestModalOpen(false)}
        />
      )}

      {/* Optional Duality Dice Roller Modal */}
      {isDiceModalOpen && (
        <DualityDiceModal
          character={character}
          onClose={() => setIsDiceModalOpen(false)}
        />
      )}
    </div>
  );
};
