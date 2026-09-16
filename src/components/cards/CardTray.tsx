import React, { useState } from 'react';
import { Character, DomainCard, Domain } from '../../types/daggerheart';
import { DomainCardComponent } from './DomainCardComponent';
import { RecallModal } from './RecallModal';
import { AddCustomCardModal } from './AddCustomCardModal';
import { swapVaultToLoadout, vaultLoadoutCard, MAX_LOADOUT_CARDS } from '../../domain/cardManager';
import { getClass, getSubclass } from '../../data/srdService';
import { FormattedFeatureText } from '../common/FormattedFeatureText';
import { BeastformModal } from '../druid/BeastformModal';
import { LayoutGrid, List, Search, Sparkles, Shield, Bookmark, AlertCircle, PlusCircle, Footprints } from 'lucide-react';

interface CardTrayProps {
  character: Character;
  onUpdate: (updated: Character) => void;
}

type TabType = 'loadout' | 'vault' | 'features';
type ViewMode = 'visual' | 'compact';

export const CardTray: React.FC<CardTrayProps> = ({ character, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('loadout');
  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'ALL'>('ALL');
  const [recallCard, setRecallCard] = useState<DomainCard | null>(null);
  const [isAddCustomModalOpen, setIsAddCustomModalOpen] = useState<boolean>(false);
  const [isBeastformModalOpen, setIsBeastformModalOpen] = useState<boolean>(false);

  const classDef = getClass(character.className);
  const subclassDef = getSubclass(character.subclassName);

  const handleVaultCard = (cardId: string) => {
    const updated = vaultLoadoutCard(character, cardId);
    onUpdate(updated);
  };

  const handleAddCustomCard = (card: DomainCard, dest: 'loadout' | 'vault') => {
    if (dest === 'loadout') {
      onUpdate({
        ...character,
        loadout: [...character.loadout, card],
      });
    } else {
      onUpdate({
        ...character,
        vault: [...character.vault, card],
      });
    }
  };

  const handleConfirmRecall = (
    vaultedCardId: string,
    replacedCardId?: string,
    isRest: boolean = false
  ) => {
    const updated = swapVaultToLoadout(
      character,
      vaultedCardId,
      replacedCardId,
      isRest
    );
    onUpdate(updated);
    setRecallCard(null);
  };

  // Vault filtering
  const filteredVault = character.vault.filter((card) => {
    if (selectedDomain !== 'ALL' && card.domain !== selectedDomain) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = card.name.toLowerCase().includes(q);
      const matchText = card.text.toLowerCase().includes(q);
      if (!matchName && !matchText) return false;
    }
    return true;
  });

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('loadout')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'loadout'
                ? 'bg-hope text-bg-primary shadow-sm'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Loadout</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'loadout'
                  ? 'bg-bg-primary/20 text-bg-primary'
                  : 'bg-bg-surface text-text-muted'
              }`}
            >
              {character.loadout.length}/{MAX_LOADOUT_CARDS}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-hope text-bg-primary shadow-sm'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Vault</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'vault'
                  ? 'bg-bg-primary/20 text-bg-primary'
                  : 'bg-bg-surface text-text-muted'
              }`}
            >
              {character.vault.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'bg-hope text-bg-primary shadow-sm'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Features</span>
          </button>
        </div>

        {/* Controls: View Mode & Custom Card Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddCustomModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-bg-secondary hover:bg-bg-hover text-text-primary border border-border-subtle transition-all shadow-xs"
            title="Create a homebrew domain card"
          >
            <PlusCircle className="w-3.5 h-3.5 text-hope" />
            <span>Custom Card</span>
          </button>

          {activeTab !== 'features' && (
            <div className="flex items-center gap-1 bg-bg-secondary p-1 rounded-xl border border-border-subtle">
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                title="Visual Card Grid"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-bg-surface text-hope font-bold shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                title="Compact Combat List"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-bg-surface text-hope font-bold shadow-xs'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab: LOADOUT */}
      {activeTab === 'loadout' && (
        <div className="space-y-4">
          {character.loadout.length >= MAX_LOADOUT_CARDS && (
            <div className="bg-hope/10 border border-hope/30 rounded-xl p-3 text-xs text-hope flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Loadout capacity reached (5/5). Recalling a vaulted card will require swapping out an active card.
              </span>
            </div>
          )}

          {character.loadout.length === 0 ? (
            <div className="p-8 text-center bg-bg-secondary rounded-2xl border border-dashed border-border-subtle text-text-muted text-xs">
              Your active loadout is empty. Go to the <strong className="text-text-primary">Vault</strong> tab to equip domain cards.
            </div>
          ) : viewMode === 'visual' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {character.loadout.map((card) => (
                <DomainCardComponent
                  key={card.id}
                  card={card}
                  viewMode="visual"
                  location="loadout"
                  onVault={handleVaultCard}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {character.loadout.map((card) => (
                <DomainCardComponent
                  key={card.id}
                  card={card}
                  viewMode="compact"
                  location="loadout"
                  onVault={handleVaultCard}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search vault cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-hope transition-colors"
              />
            </div>

            {classDef && (
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedDomain('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedDomain === 'ALL'
                      ? 'border-hope bg-hope/10 text-hope'
                      : 'border-border-subtle bg-bg-secondary text-text-muted hover:text-text-primary'
                  }`}
                >
                  All
                </button>
                {classDef.domains.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDomain(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      selectedDomain === d
                        ? 'border-hope bg-hope/10 text-hope'
                        : 'border-border-subtle bg-bg-secondary text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredVault.length === 0 ? (
            <div className="p-8 text-center bg-bg-secondary rounded-2xl border border-dashed border-border-subtle text-text-muted text-xs">
              {character.vault.length === 0
                ? 'Your vault is empty. Earn more cards upon leveling up.'
                : 'No cards match your filter.'}
            </div>
          ) : viewMode === 'visual' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredVault.map((card) => (
                <DomainCardComponent
                  key={card.id}
                  card={card}
                  viewMode="visual"
                  location="vault"
                  onEquip={(cardToEquip) => setRecallCard(cardToEquip)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVault.map((card) => (
                <DomainCardComponent
                  key={card.id}
                  card={card}
                  viewMode="compact"
                  location="vault"
                  onEquip={(cardToEquip) => setRecallCard(cardToEquip)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: FEATURES (Ancestry, Community, Subclass & Class Features) */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="text-[11px] text-text-muted italic bg-bg-secondary/50 p-2.5 rounded-xl border border-border-subtle">
            Subclass, Ancestry, and Community features are inherent traits and do not count towards the 5 active domain cards loadout limit.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Subclass Features */}
            {subclassDef && (
              <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Subclass: {subclassDef.name}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-hope/10 text-hope font-bold uppercase">
                    {character.subclassCardState}
                  </span>
                </div>

                {/* Foundation Features */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase">Foundation</span>
                  {subclassDef.foundation.map((f, i) => (
                    <div key={i} className="text-xs space-y-1">
                      <h5 className="font-bold text-text-primary">{f.name}</h5>
                      <FormattedFeatureText text={f.text} />
                    </div>
                  ))}
                </div>

                {/* Specialization (if level >= 5 or unlocked) */}
                {(character.subclassCardState === 'specialization' ||
                  character.subclassCardState === 'mastery') &&
                  subclassDef.specialization.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border-subtle">
                      <span className="text-[10px] font-bold text-text-muted uppercase">
                        Specialization
                      </span>
                      {subclassDef.specialization.map((f, i) => (
                        <div key={i} className="text-xs space-y-1">
                          <h5 className="font-bold text-text-primary">{f.name}</h5>
                          <FormattedFeatureText text={f.text} />
                        </div>
                      ))}
                    </div>
                  )}

                {/* Mastery (if level >= 8 or unlocked) */}
                {character.subclassCardState === 'mastery' &&
                  subclassDef.mastery.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border-subtle">
                      <span className="text-[10px] font-bold text-text-muted uppercase">
                        Mastery
                      </span>
                      {subclassDef.mastery.map((f, i) => (
                        <div key={i} className="text-xs space-y-1">
                          <h5 className="font-bold text-text-primary">{f.name}</h5>
                          <FormattedFeatureText text={f.text} />
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* Class Inherent Features */}
            {classDef && (
              <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Class: {classDef.name}
                  </h4>
                  {classDef.name.toLowerCase() === 'druid' && (
                    <button
                      type="button"
                      onClick={() => setIsBeastformModalOpen(true)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-hope/15 hover:bg-hope/25 text-hope border border-hope/30 flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Open Beastform monster forms"
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      <span>Beastforms</span>
                    </button>
                  )}
                </div>

                {/* Render All Class Features */}
                {(classDef.features || (classDef.feature ? [classDef.feature] : [])).map((f, i) => {
                  const isBeastform = f.name.toLowerCase().includes('beastform');
                  return (
                    <div
                      key={i}
                      className={`text-xs space-y-1.5 ${
                        i > 0 ? 'pt-2.5 border-t border-border-subtle' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-text-primary">{f.name}</h5>
                        {isBeastform && (
                          <button
                            type="button"
                            onClick={() => setIsBeastformModalOpen(true)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-hope/20 hover:bg-hope/30 text-hope-light border border-hope/30 flex items-center gap-1 transition-colors"
                          >
                            <Footprints className="w-3 h-3" />
                            <span>View All Forms</span>
                          </button>
                        )}
                      </div>
                      <FormattedFeatureText text={f.text} />
                    </div>
                  );
                })}

                {classDef.hopeFeature && (
                  <div className="text-xs space-y-1.5 pt-2 border-t border-border-subtle">
                    <h5 className="font-bold text-hope flex items-center gap-1">
                      <span>Hope Feature:</span> {classDef.hopeFeature.name}
                    </h5>
                    <FormattedFeatureText text={classDef.hopeFeature.text} />
                  </div>
                )}
              </div>
            )}

            {/* Ancestry Features */}
            <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-4 space-y-3">
              <div className="border-b border-border-subtle pb-2">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Ancestry: {character.heritage.ancestryName}
                  {character.heritage.isMixedAncestry &&
                    ` / ${character.heritage.mixedSecondaryAncestryName}`}
                </h4>
              </div>
              {character.heritage.ancestryFeatures.map((f, i) => (
                <div key={i} className="text-xs space-y-1">
                  <h5 className="font-bold text-text-primary">{f.name}</h5>
                  <FormattedFeatureText text={f.text} />
                </div>
              ))}
            </div>

            {/* Community Feature */}
            <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-4 space-y-3">
              <div className="border-b border-border-subtle pb-2">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Community: {character.heritage.communityName}
                </h4>
              </div>
              <div className="text-xs space-y-1">
                <h5 className="font-bold text-text-primary">
                  {character.heritage.communityFeature.name}
                </h5>
                <FormattedFeatureText
                  text={character.heritage.communityFeature.text}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recall Modal */}
      {recallCard && (
        <RecallModal
          character={character}
          cardToEquip={recallCard}
          onConfirm={handleConfirmRecall}
          onClose={() => setRecallCard(null)}
        />
      )}

      {/* Add Custom Homebrew Card Modal */}
      {isAddCustomModalOpen && (
        <AddCustomCardModal
          character={character}
          onAddCard={handleAddCustomCard}
          onClose={() => setIsAddCustomModalOpen(false)}
        />
      )}

      {/* Beastform Monster Forms Modal */}
      <BeastformModal
        character={character}
        isOpen={isBeastformModalOpen}
        onClose={() => setIsBeastformModalOpen(false)}
        onUpdate={onUpdate}
      />
    </div>
  );
};
