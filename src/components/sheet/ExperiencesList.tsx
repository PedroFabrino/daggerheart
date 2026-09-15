import React, { useState } from 'react';
import { Character } from '../../types/daggerheart';
import { Sparkles, Plus } from 'lucide-react';

interface ExperiencesListProps {
  character: Character;
  onUpdate: (updater: (prev: Character) => Character) => void;
  isHouseRulesEnabled?: boolean;
}

export const ExperiencesList: React.FC<ExperiencesListProps> = ({
  character,
  onUpdate,
  isHouseRulesEnabled = false,
}) => {
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [newExpName, setNewExpName] = useState<string>('');
  const [newExpBonus, setNewExpBonus] = useState<number>(2);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const invokeExperience = (name: string, bonus: number) => {
    if (character.hope.current <= 0) {
      setActiveToast(`Cannot invoke ${name}: No Hope tokens remaining!`);
      setTimeout(() => setActiveToast(null), 3000);
      return;
    }

    onUpdate((prev) => ({
      ...prev,
      hope: { ...prev.hope, current: prev.hope.current - 1 },
    }));

    setActiveToast(`Invoked "${name}"! Spent 1 Hope to add +${bonus} to your roll.`);
    setTimeout(() => setActiveToast(null), 4000);
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName.trim()) return;

    onUpdate((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: `exp-${Date.now()}`,
          name: newExpName.trim(),
          bonus: newExpBonus,
        },
      ],
    }));

    setNewExpName('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-hope" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Experiences
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-muted">
            Spend 1 Hope to add Experience modifier to an action roll
          </span>
          {isHouseRulesEnabled && (
            <button
              onClick={() => setShowAddForm((p) => !p)}
              className="p-1 rounded bg-bg-secondary hover:bg-bg-hover text-hope text-xs"
              title="Add Experience (House Rules)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {activeToast && (
        <div className="bg-hope/10 border border-hope/30 text-hope text-xs font-semibold px-3 py-2 rounded-lg animate-fade-in flex items-center justify-between">
          <span>{activeToast}</span>
          <button
            onClick={() => setActiveToast(null)}
            className="text-text-muted hover:text-text-primary ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddExperience} className="flex gap-2 p-2 bg-bg-secondary rounded-lg border border-border-subtle">
          <input
            type="text"
            value={newExpName}
            onChange={(e) => setNewExpName(e.target.value)}
            placeholder="Experience name..."
            className="flex-1 bg-bg-primary border border-border-subtle rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-hope"
          />
          <input
            type="number"
            value={newExpBonus}
            onChange={(e) => setNewExpBonus(parseInt(e.target.value, 10) || 2)}
            className="w-14 bg-bg-primary border border-border-subtle rounded px-2 py-1 text-xs text-text-primary text-center font-mono font-bold"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-hope text-bg-primary rounded text-xs font-bold hover:bg-hope-light"
          >
            Add
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {character.experiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-bg-secondary p-3.5 rounded-xl border border-border-subtle flex items-center justify-between gap-2"
          >
            <div>
              <span className="text-sm font-bold text-text-primary block">
                {exp.name}
              </span>
              <span className="text-xs font-black font-mono text-hope">
                +{exp.bonus}
              </span>
            </div>

            <button
              onClick={() => invokeExperience(exp.name, exp.bonus)}
              disabled={character.hope.current <= 0}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-hope/10 hover:bg-hope/20 text-hope border border-hope/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Invoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
