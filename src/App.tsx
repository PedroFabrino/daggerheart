import React, { useState } from 'react';
import { useTheme } from './themes/ThemeProvider';
import { useCharacter, CharacterProvider } from './context/CharacterContext';
import { CharacterCreationWizard } from './components/wizard/CharacterCreationWizard';
import { CharacterSheet } from './components/sheet/CharacterSheet';
import { CharacterRosterDrawer } from './components/roster/CharacterRosterDrawer';

import {
  DOMAIN_CARDS,
  filterLegalDomainCards,
} from './data/srdService';
import { Domain } from './types/daggerheart';
import {
  Sparkles,
  PlusCircle,
  Search,
  Users,
} from 'lucide-react';


export const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const {
    characters,
    activeCharacter,
    isCreating,
    startCreation,
    cancelCreation,
    saveDraftAsNewCharacter,
    selectActiveCharacter,
    updateActiveCharacter,
    isHouseRulesEnabled,
    toggleHouseRules,
  } = useCharacter();


  const [activeTab, setActiveTab] = useState<'sheet' | 'library'>('sheet');
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRosterOpen, setIsRosterOpen] = useState<boolean>(false);

  const domains: Domain[] = [
    'Arcana',
    'Blade',
    'Bone',
    'Codex',
    'Dread',
    'Grace',
    'Midnight',
    'Sage',
    'Splendor',
    'Valor',
  ];

  const domainColorMap: Record<Domain, string> = {
    Arcana: 'bg-domain-arcana',
    Blade: 'bg-domain-blade',
    Bone: 'bg-domain-bone',
    Codex: 'bg-domain-codex',
    Dread: 'bg-domain-dread',
    Grace: 'bg-domain-grace',
    Midnight: 'bg-domain-midnight',
    Sage: 'bg-domain-sage',
    Splendor: 'bg-domain-splendor',
    Valor: 'bg-domain-valor',
  };

  const filteredCards = DOMAIN_CARDS.filter((card) => {
    const matchesDomain =
      selectedDomain === 'All' || card.domain === selectedDomain;
    const matchesClass =
      selectedClass === 'All' ||
      filterLegalDomainCards(selectedClass, 10).some((c) => c.id === card.id);
    const matchesSearch =
      searchQuery === '' ||
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesClass && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8">
      {/* Top App Bar */}
      <header className="max-w-6xl mx-auto mb-6 border-b border-border-subtle pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-hope flex items-center justify-center text-bg-primary font-bold shadow-lg shadow-hope/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-hope-light via-hope to-fear-light bg-clip-text text-transparent">
              Daggerheart Tracker
            </h1>
            <p className="text-xs text-text-muted">
              Official SRD Rules Engine &middot; {theme.name}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {characters.length > 0 && !isCreating && (
            <select
              value={activeCharacter?.id || ''}
              onChange={(e) => selectActiveCharacter(e.target.value)}
              className="bg-bg-surface border border-border-subtle text-xs rounded-lg px-3 py-2 text-text-primary font-semibold focus:outline-none focus:border-hope"
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Lvl {c.level} {c.className})
                </option>
              ))}
            </select>
          )}

          {/* Roster Drawer Button */}
          {!isCreating && (
            <button
              onClick={() => setIsRosterOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-bg-surface hover:bg-bg-hover text-text-primary border border-border-subtle transition-all shadow-xs"
              title="Open Character Roster"
            >
              <Users className="w-4 h-4 text-hope" />
              <span>Roster ({characters.length})</span>
            </button>
          )}

          {!isCreating && (
            <button
              onClick={startCreation}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-hope text-bg-primary hover:bg-hope-light transition-all shadow"
            >
              <PlusCircle className="w-4 h-4" /> New Character
            </button>
          )}

          <div className="flex bg-bg-surface p-1 rounded-lg border border-border-subtle text-xs">
            <button
              onClick={() => setActiveTab('sheet')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'sheet'
                  ? 'bg-bg-secondary text-hope'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Sheet
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'library'
                  ? 'bg-bg-secondary text-hope'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              SRD Library
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* WIZARD MODE */}
        {isCreating ? (
          <CharacterCreationWizard
            onComplete={async (draft) => {
              await saveDraftAsNewCharacter(draft);
            }}
            onCancel={characters.length > 0 ? cancelCreation : undefined}
          />

        ) : activeTab === 'sheet' && activeCharacter ? (
          <CharacterSheet
            character={activeCharacter}
            onUpdate={updateActiveCharacter}
            isHouseRulesEnabled={isHouseRulesEnabled}
            onToggleHouseRules={toggleHouseRules}
          />
        ) : (

          /* SRD LIBRARY VIEW */
          <div className="space-y-6">
            {/* Domain Badges */}
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
                Domains of Power
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedDomain('All');
                    setSelectedClass('All');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDomain === 'All' && selectedClass === 'All'
                      ? 'bg-border-highlight text-bg-primary font-bold shadow-sm'
                      : 'bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                  }`}
                >
                  All Domains ({DOMAIN_CARDS.length})
                </button>
                {domains.map((dom) => (
                  <button
                    key={dom}
                    onClick={() => {
                      setSelectedDomain(dom);
                      setSelectedClass('All');
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDomain === dom
                        ? 'ring-2 ring-border-highlight text-text-primary bg-bg-hover font-semibold'
                        : 'bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${domainColorMap[dom]}`} />
                    {dom} ({DOMAIN_CARDS.filter((c) => c.domain === dom).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards by name or text..."
                className="w-full bg-bg-surface border border-border-subtle rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-highlight"
              />
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {filteredCards.slice(0, 30).map((card) => (
                <div
                  key={card.id}
                  className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${domainColorMap[card.domain]}`} />
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-bg-secondary text-text-muted border border-border-subtle">
                        Level {card.level}
                      </span>
                      <span className="text-xs font-bold text-text-secondary">
                        {card.domain} &middot; {card.type}
                      </span>
                      <span className="text-xs font-mono text-hope font-semibold">
                        ⚡ {card.recallCost} Recall
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-text-primary mb-1">{card.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Slide-over Character Roster Drawer */}
      <CharacterRosterDrawer
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CharacterProvider>
      <AppContent />
    </CharacterProvider>
  );
};

export default App;

