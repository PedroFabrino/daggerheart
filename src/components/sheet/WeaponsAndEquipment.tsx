import React, { useState } from 'react';
import { Character } from '../../types/daggerheart';
import { calculateWeaponDamage } from '../../domain/combatMath';
import { Swords, Shield, Backpack, Coins, Plus, Trash2 } from 'lucide-react';

interface WeaponsAndEquipmentProps {
  character: Character;
  onUpdate: (updater: (prev: Character) => Character) => void;
}

export const WeaponsAndEquipment: React.FC<WeaponsAndEquipmentProps> = ({
  character,
  onUpdate,
}) => {
  const [newItemName, setNewItemName] = useState<string>('');

  const primaryDamage = character.weapons.primary
    ? calculateWeaponDamage(character.weapons.primary.damage, character.proficiency)
    : null;

  const secondaryDamage = character.weapons.secondary
    ? calculateWeaponDamage(character.weapons.secondary.damage, character.proficiency)
    : null;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onUpdate((prev) => ({
      ...prev,
      inventory: [...prev.inventory, newItemName.trim()],
    }));
    setNewItemName('');
  };

  const handleRemoveItem = (index: number) => {
    onUpdate((prev) => ({
      ...prev,
      inventory: prev.inventory.filter((_, i) => i !== index),
    }));
  };

  const updateGold = (type: 'handfuls' | 'bags' | 'chests', delta: number) => {
    onUpdate((prev) => ({
      ...prev,
      gold: {
        ...prev.gold,
        [type]: Math.max(0, prev.gold[type] + delta),
      },
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Weapons & Armor */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <Swords className="w-4 h-4 text-hope" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Active Weapons & Armor
          </h3>
        </div>

        {/* Primary Weapon */}
        {character.weapons.primary ? (
          <div className="bg-bg-secondary p-3.5 rounded-xl border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  PRIMARY WEAPON ({character.weapons.primary.burden})
                </span>
                <h4 className="text-sm font-black text-text-primary">
                  {character.weapons.primary.name}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-hope block">
                    {primaryDamage}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    Roll with {character.weapons.primary.trait}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdate((prev) => {
                      const removed = prev.weapons.primary;
                      return {
                        ...prev,
                        weapons: {
                          ...prev.weapons,
                          primary: null,
                        },
                        inventory: removed ? [...prev.inventory, removed.name] : prev.inventory,
                      };
                    });
                  }}
                  className="p-1.5 text-text-muted hover:text-fear transition-colors rounded-lg hover:bg-bg-surface"
                  title="Unequip Primary Weapon (moves to inventory)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-[11px] text-text-secondary">
              <span className="bg-bg-surface px-2 py-0.5 rounded border border-border-subtle">
                Range: {character.weapons.primary.range}
              </span>
              <span className="bg-bg-surface px-2 py-0.5 rounded border border-border-subtle">
                {character.weapons.primary.physicalOrMagical}
              </span>
            </div>

            {character.weapons.primary.features.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border-subtle/60 text-[11px] text-text-muted">
                {character.weapons.primary.features.map((f, i) => (
                  <div key={i}>
                    <strong className="text-text-secondary">{f.name}: </strong>
                    {f.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-bg-secondary rounded-xl text-xs text-text-muted italic border border-border-subtle flex items-center justify-between">
            <span>No primary weapon equipped (Unarmed).</span>
          </div>
        )}

        {/* Secondary Weapon */}
        {character.weapons.secondary ? (
          <div className="bg-bg-secondary p-3.5 rounded-xl border border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  SECONDARY WEAPON
                </span>
                <h4 className="text-sm font-black text-text-primary">
                  {character.weapons.secondary.name}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-xs font-black font-mono text-fear-light block">
                    {secondaryDamage}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    Roll with {character.weapons.secondary.trait}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdate((prev) => {
                      const removed = prev.weapons.secondary;
                      return {
                        ...prev,
                        weapons: {
                          ...prev.weapons,
                          secondary: null,
                        },
                        inventory: removed ? [...prev.inventory, removed.name] : prev.inventory,
                      };
                    });
                  }}
                  className="p-1.5 text-text-muted hover:text-fear transition-colors rounded-lg hover:bg-bg-surface"
                  title="Unequip Secondary Weapon (moves to inventory)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-[11px] text-text-secondary">
              <span className="bg-bg-surface px-2 py-0.5 rounded border border-border-subtle">
                Range: {character.weapons.secondary.range}
              </span>
            </div>

            {character.weapons.secondary.features.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border-subtle/60 text-[11px] text-text-muted">
                {character.weapons.secondary.features.map((f, i) => (
                  <div key={i}>
                    <strong className="text-text-secondary">{f.name}: </strong>
                    {f.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Equipped Armor */}
        {character.armor.equipped ? (
          <div className="bg-bg-secondary p-3 rounded-xl border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-hope" />
              <div>
                <div className="text-xs font-bold text-text-primary">
                  {character.armor.equipped.name}
                </div>
                <div className="text-[10px] text-text-muted">
                  Base Score: {character.armor.equipped.baseScore} &middot; Base Thresholds:{' '}
                  {character.armor.equipped.baseThresholds.join(' / ')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {character.armor.equipped.features.length > 0 && (
                <span className="text-[10px] bg-bg-surface px-2 py-1 rounded border border-border-subtle text-text-secondary">
                  {character.armor.equipped.features[0].name}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  onUpdate((prev) => {
                    const removed = prev.armor.equipped;
                    // Reset armor score to 0 and recalculate thresholds per level
                    const baseThresholds: [number, number] = [5, 11];
                    const minor = baseThresholds[0] + prev.level;
                    const major = baseThresholds[1] + prev.level;
                    const severe = major + 1;

                    // Remove armor evasion modifier if any
                    let nextEvasion = prev.evasion;
                    if (removed) {
                      removed.features.forEach((feat) => {
                        const lower = feat.text.toLowerCase();
                        if (lower.includes('+1 to evasion') || lower.includes('+1 evasion')) {
                          nextEvasion -= 1;
                        } else if (lower.includes('-1 to evasion') || lower.includes('-1 evasion')) {
                          nextEvasion += 1;
                        }
                      });
                    }

                    return {
                      ...prev,
                      evasion: nextEvasion,
                      armor: {
                        equipped: null,
                        score: 0,
                        markedSlots: 0,
                        maxSlots: 0,
                      },
                      damageThresholds: { minor, major, severe },
                      inventory: removed ? [...prev.inventory, removed.name] : prev.inventory,
                    };
                  });
                }}
                className="p-1.5 text-text-muted hover:text-fear transition-colors rounded-lg hover:bg-bg-surface"
                title="Unequip Armor (moves to inventory, removes armor score)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-bg-secondary p-3 rounded-xl border border-border-subtle flex items-center justify-between text-xs text-text-muted italic">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-text-muted" />
              <span>No armor equipped (Unarmored).</span>
            </div>
          </div>
        )}
      </div>

      {/* Inventory & Gold */}
      <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Backpack className="w-4 h-4 text-domain-sage" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Inventory & Supplies
              </h3>
            </div>
            <span className="text-xs text-text-muted font-mono">
              {character.inventory.length} items
            </span>
          </div>

          {/* Add Item Input */}
          <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add item to inventory..."
              className="flex-1 bg-bg-secondary border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-hope"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-hope text-bg-primary font-bold rounded-lg hover:bg-hope-light transition-colors text-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>

          {/* Inventory Items List */}
          <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5">
            {character.inventory.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle text-xs group"
              >
                <span className="text-text-secondary">{item}</span>
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="text-text-muted hover:text-fear-light opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Currency Track */}
        <div className="border-t border-border-subtle pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-4 h-4 text-hope" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Coinage
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-bg-secondary p-2 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-text-muted font-bold">HANDFULS</span>
              <span className="text-base font-black text-hope my-1">
                {character.gold.handfuls}
              </span>
              <div className="flex justify-center gap-1 text-xs">
                <button
                  onClick={() => updateGold('handfuls', -1)}
                  className="w-5 h-5 rounded bg-bg-surface hover:bg-bg-hover flex items-center justify-center text-text-muted"
                >
                  -
                </button>
                <button
                  onClick={() => updateGold('handfuls', 1)}
                  className="w-5 h-5 rounded bg-bg-surface hover:bg-bg-hover flex items-center justify-center text-text-primary"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-bg-secondary p-2 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-text-muted font-bold">BAGS</span>
              <span className="text-base font-black text-hope-light my-1">
                {character.gold.bags}
              </span>
              <div className="flex justify-center gap-1 text-xs">
                <button
                  onClick={() => updateGold('bags', -1)}
                  className="w-5 h-5 rounded bg-bg-surface hover:bg-bg-hover flex items-center justify-center text-text-muted"
                >
                  -
                </button>
                <button
                  onClick={() => updateGold('bags', 1)}
                  className="w-5 h-5 rounded bg-bg-surface hover:bg-bg-hover flex items-center justify-center text-text-primary"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-bg-secondary p-2 rounded-xl border border-border-subtle flex flex-col justify-between">
              <span className="text-[10px] text-text-muted font-bold">CHESTS</span>
              <span className="text-base font-black text-amber-300 my-1">
                {character.gold.chests}
              </span>
              <div className="flex justify-center gap-1 text-xs">
                <button
                  onClick={() => updateGold('chests', -1)}
                  className="w-5 h-5 rounded bg-bg-surface hover:bg-bg-hover flex items-center justify-center text-text-muted"
                >
                  -
                </button>
                <button
                  onClick={() => updateGold('chests', 1)}
                  className="w-5 h-5 rounded bg-bg-surface hover:bg-bg-hover flex items-center justify-center text-text-primary"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
