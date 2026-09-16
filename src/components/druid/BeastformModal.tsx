import React, { useState, useMemo } from 'react';
import { Character } from '../../types/daggerheart';
import { BEASTFORMS } from '../../data/srdService';
import { FormattedFeatureText } from '../common/FormattedFeatureText';
import {
  X,
  Search,
  Star,
  Shield,
  Swords,
  Footprints,
  Sparkles,
  Info,
} from 'lucide-react';

interface BeastformModalProps {
  character: Character;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Character) => void;
}

export const BeastformModal: React.FC<BeastformModalProps> = ({
  character,
  isOpen,
  onClose,
  onUpdate,
}) => {
  // Determine character's tier from level
  const characterTier = useMemo(() => {
    if (character.level >= 8) return 4;
    if (character.level >= 5) return 3;
    if (character.level >= 2) return 2;
    return 1;
  }, [character.level]);

  const [selectedTier, setSelectedTier] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  const favorites = useMemo(
    () => new Set(character.favoriteBeastforms || []),
    [character.favoriteBeastforms]
  );

  const handleToggleFavorite = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentFavs = character.favoriteBeastforms || [];
    const isFav = currentFavs.includes(formId);
    const updatedFavs = isFav
      ? currentFavs.filter((id) => id !== formId)
      : [...currentFavs, formId];

    onUpdate({
      ...character,
      favoriteBeastforms: updatedFavs,
    });
  };

  // Filter and sort beastforms
  const filteredForms = useMemo(() => {
    return BEASTFORMS.filter((form) => {
      // Tier filter
      if (selectedTier !== 'ALL' && form.tier !== selectedTier) {
        return false;
      }

      // Favorites filter
      if (onlyFavorites && !favorites.has(form.id)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = form.name.toLowerCase().includes(q);
        const matchExamples = form.examples.some((ex) =>
          ex.toLowerCase().includes(q)
        );
        const matchTrait = form.trait?.toLowerCase().includes(q);
        const matchAdvantages = form.advantages.some((adv) =>
          adv.toLowerCase().includes(q)
        );
        const matchFeatures = form.features.some(
          (f) =>
            f.name.toLowerCase().includes(q) || f.text.toLowerCase().includes(q)
        );

        if (
          !matchName &&
          !matchExamples &&
          !matchTrait &&
          !matchAdvantages &&
          !matchFeatures
        ) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Prioritize favorited forms to the top of the list
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // Then sort by tier, then name
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.name.localeCompare(b.name);
    });
  }, [selectedTier, onlyFavorites, searchQuery, favorites]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="beastform-modal-title"
    >
      <div className="bg-bg-surface border border-border-subtle rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-hope/15 text-hope">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="beastform-modal-title"
                className="font-extrabold text-lg text-text-primary flex items-center gap-2"
              >
                <span>Druid Beastform Options</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-hope/10 text-hope border border-hope/20 font-mono font-bold">
                  Tier {characterTier} Druid
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                Choose a creature category of your tier or lower when using the
                Beastform feature.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-border-subtle bg-bg-surface/50 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by animal (wolf, eagle, bear), trait, advantage..."
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-10 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-hope transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Favorite Filter Toggle */}
            <button
              type="button"
              onClick={() => setOnlyFavorites((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                onlyFavorites
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-xs'
                  : 'bg-bg-secondary border-border-subtle text-text-muted hover:text-text-primary'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  onlyFavorites
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-text-muted'
                }`}
              />
              <span>Favorites ({favorites.size})</span>
            </button>
          </div>

          {/* Tier Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedTier('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                selectedTier === 'ALL'
                  ? 'bg-hope text-bg-primary border-hope shadow-xs'
                  : 'bg-bg-secondary text-text-muted hover:text-text-primary border-border-subtle'
              }`}
            >
              All Tiers (24)
            </button>
            {[1, 2, 3, 4].map((tier) => {
              const count = BEASTFORMS.filter((b) => b.tier === tier).length;
              const isEligible = tier <= characterTier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    selectedTier === tier
                      ? 'bg-hope text-bg-primary border-hope shadow-xs'
                      : isEligible
                      ? 'bg-bg-secondary text-text-primary border-border-subtle hover:bg-bg-hover'
                      : 'bg-bg-secondary/40 text-text-muted border-border-subtle opacity-70'
                  }`}
                >
                  <span>Tier {tier}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedTier === tier
                        ? 'bg-bg-primary/20 text-bg-primary'
                        : 'bg-bg-surface text-text-muted'
                    }`}
                  >
                    {count}
                  </span>
                  {!isEligible && (
                    <span className="text-[10px] text-text-muted italic">
                      (Locked)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Form Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredForms.length === 0 ? (
            <div className="text-center py-16 text-text-muted space-y-2">
              <Info className="w-8 h-8 mx-auto text-text-muted opacity-60" />
              <p className="text-sm font-semibold">No beastforms match your search</p>
              <p className="text-xs">
                Try clearing your search or switching to another Tier.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredForms.map((form) => {
                const isFav = favorites.has(form.id);
                const isEligible = form.tier <= characterTier;

                return (
                  <div
                    key={form.id}
                    className={`border rounded-2xl p-4 transition-all relative flex flex-col justify-between ${
                      isFav
                        ? 'bg-bg-secondary border-amber-400/50 shadow-md ring-1 ring-amber-400/20'
                        : 'bg-bg-secondary/70 border-border-subtle hover:border-border-highlight/60'
                    }`}
                  >
                    <div>
                      {/* Card Header: Form Name & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-text-primary">
                              {form.name}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isEligible
                                  ? 'bg-hope/15 border-hope/30 text-hope'
                                  : 'bg-bg-surface border-border-subtle text-text-muted'
                              }`}
                            >
                              Tier {form.tier}
                            </span>
                            {isFav && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-400" />
                                <span>Pinned</span>
                              </span>
                            )}
                          </div>

                          {/* Examples */}
                          {form.examples.length > 0 && (
                            <p className="text-xs text-text-muted italic mt-0.5">
                              ({form.examples.join(', ')})
                            </p>
                          )}
                        </div>

                        {/* Favorite Toggle Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(form.id, e)}
                          title={isFav ? 'Unfavorite' : 'Favorite (push to top)'}
                          aria-label={
                            isFav
                              ? `Unfavorite ${form.name}`
                              : `Favorite ${form.name}`
                          }
                          className={`p-1.5 rounded-xl border transition-all ${
                            isFav
                              ? 'bg-amber-400/20 border-amber-400/50 text-amber-400 hover:bg-amber-400/30'
                              : 'bg-bg-surface border-border-subtle text-text-muted hover:text-amber-400 hover:border-amber-400/40'
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              isFav ? 'fill-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Stat Badges */}
                      <div className="flex items-center gap-2 flex-wrap my-2.5">
                        {form.trait && form.traitBonus !== undefined && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-surface border border-border-subtle text-xs font-semibold text-text-primary">
                            <Sparkles className="w-3.5 h-3.5 text-hope" />
                            <span>
                              {form.trait} +{form.traitBonus}
                            </span>
                          </div>
                        )}

                        {form.evasionBonus !== undefined && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-surface border border-border-subtle text-xs font-semibold text-text-primary">
                            <Shield className="w-3.5 h-3.5 text-sky-400" />
                            <span>Evasion +{form.evasionBonus}</span>
                          </div>
                        )}

                        {form.attack && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-surface border border-border-subtle text-xs font-semibold text-text-primary">
                            <Swords className="w-3.5 h-3.5 text-rose-400" />
                            <span>
                              {form.attack.range} {form.attack.trait}{' '}
                              {form.attack.damage}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Advantages */}
                      {form.advantages && form.advantages.length > 0 && (
                        <div className="mb-3">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                            Advantage on:
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {form.advantages.map((adv, aIdx) => (
                              <span
                                key={aIdx}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-bg-surface border border-border-subtle text-text-secondary font-medium"
                              >
                                {adv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Features with FormattedFeatureText */}
                      {form.features && form.features.length > 0 && (
                        <div className="space-y-2 border-t border-border-subtle/80 pt-2.5">
                          {form.features.map((feat, fIdx) => (
                            <div key={fIdx} className="text-xs">
                              <h5 className="font-bold text-text-primary">
                                {feat.name}:
                              </h5>
                              <FormattedFeatureText
                                text={feat.text}
                                className="text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-bg-secondary/40 flex items-center justify-between text-xs text-text-muted">
          <span>
            {filteredForms.length} of {BEASTFORMS.length} forms showing
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-bg-secondary hover:bg-bg-hover text-text-primary border border-border-subtle font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
