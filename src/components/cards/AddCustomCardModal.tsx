import React, { useState } from 'react';
import { DomainCard, Domain, CardType, Character } from '../../types/daggerheart';
import { Sparkles, X, PlusCircle, AlertCircle } from 'lucide-react';

interface AddCustomCardModalProps {
  character: Character;
  onAddCard: (card: DomainCard, destination: 'loadout' | 'vault') => void;
  onClose: () => void;
}

const DOMAINS: Domain[] = [
  'Arcana',
  'Blade',
  'Bone',
  'Codex',
  'Grace',
  'Midnight',
  'Sage',
  'Splendor',
  'Valor',
];

const CARD_TYPES: CardType[] = ['Ability', 'Spell', 'Grimoire'];

export const AddCustomCardModal: React.FC<AddCustomCardModalProps> = ({
  character,
  onAddCard,
  onClose,
}) => {
  const [name, setName] = useState<string>('');
  const [domain, setDomain] = useState<Domain>('Blade');
  const [level, setLevel] = useState<number>(1);
  const [recallCost, setRecallCost] = useState<number>(1);
  const [type, setType] = useState<CardType>('Ability');
  const [text, setText] = useState<string>('');
  const [destination, setDestination] = useState<'loadout' | 'vault'>(
    character.loadout.length < 5 ? 'loadout' : 'vault'
  );
  const [error, setError] = useState<string>('');

  const isLoadoutFull = character.loadout.length >= 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a card title.');
      return;
    }
    if (!text.trim()) {
      setError('Please enter the card description / feature text.');
      return;
    }

    const newCard: DomainCard = {
      id: `custom-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: name.trim(),
      domain,
      level,
      recallCost,
      type,
      text: text.trim(),
      isHomebrew: true,
    };

    onAddCard(newCard, destination);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-hope/20 text-hope flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-text-primary">
                Add Custom / Homebrew Card
              </h3>
              <p className="text-[11px] text-text-muted">
                Create custom abilities, grimoires, spells, or unique feats
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

        {error && (
          <div className="bg-fear/15 border border-fear/30 text-fear p-2.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Card Name */}
          <div className="space-y-1">
            <label className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
              Card Name:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Phoenix Feather Ward"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
            />
          </div>

          {/* Domain & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
                Domain:
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as Domain)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
                Type:
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CardType)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
              >
                {CARD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Level & Recall Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
                Card Level (1-10):
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={level}
                onChange={(e) => setLevel(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
                Recall Cost (0-5 Stress):
              </label>
              <input
                type="number"
                min={0}
                max={5}
                value={recallCost}
                onChange={(e) =>
                  setRecallCost(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope"
              />
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-1">
            <label className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
              Add To:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLoadoutFull}
                onClick={() => setDestination('loadout')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  destination === 'loadout'
                    ? 'border-hope bg-hope/10 text-hope'
                    : isLoadoutFull
                    ? 'opacity-40 border-border-subtle bg-bg-secondary cursor-not-allowed text-text-muted'
                    : 'border-border-subtle bg-bg-secondary text-text-muted hover:text-text-primary'
                }`}
              >
                Active Loadout ({character.loadout.length}/5)
              </button>
              <button
                type="button"
                onClick={() => setDestination('vault')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  destination === 'vault'
                    ? 'border-hope bg-hope/10 text-hope'
                    : 'border-border-subtle bg-bg-secondary text-text-muted hover:text-text-primary'
                }`}
              >
                Vault (Reserve)
              </button>
            </div>
          </div>

          {/* Description Text */}
          <div className="space-y-1">
            <label className="font-bold text-text-primary uppercase tracking-wider block text-[10px]">
              Card Feature Text / Rules:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the card rules, trigger, cost, and damage or effect..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError('');
              }}
              className="w-full bg-bg-secondary border border-border-subtle rounded-xl p-2.5 text-xs text-text-primary focus:outline-none focus:border-hope resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-border-subtle transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-hope text-bg-primary hover:bg-hope-light transition-all shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Custom Card</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
