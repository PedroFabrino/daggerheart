import React, { useState } from 'react';
import { useTheme } from './themes/ThemeProvider';
import {
  CLASSES,
  ANCESTRIES,
  COMMUNITIES,
  DOMAIN_CARDS,
  filterLegalDomainCards,
} from './data/srdService';
import { Domain } from './types/daggerheart';
import { BookOpen, Shield, Sparkles, Wand2, Layers, Search } from 'lucide-react';

export const App: React.FC = () => {
  const { theme } = useTheme();
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'All'>('All');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const domains: Domain[] = [
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
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 border-b border-border-subtle pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-hope flex items-center justify-center text-bg-primary font-bold shadow-lg shadow-hope/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-hope-light via-hope to-fear-light bg-clip-text text-transparent">
                Daggerheart Character Tracker
              </h1>
              <p className="text-sm text-text-muted">
                System Reference Document &middot; Rules Engine &middot; {theme.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-bg-surface px-3 py-1.5 rounded-full border border-border-subtle text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-hope inline-block animate-pulse" />
            <span className="text-hope font-semibold">Hope: {theme.colors.hope}</span>
          </div>
          <div className="flex items-center gap-2 bg-bg-surface px-3 py-1.5 rounded-full border border-border-subtle text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-fear inline-block" />
            <span className="text-fear-light font-semibold">Fear: {theme.colors.fear}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Core Stats Overview */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-bg-surface border border-border-subtle p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">
              <Shield className="w-4 h-4 text-hope" /> Classes
            </div>
            <div className="text-2xl font-bold text-text-primary">{CLASSES.length}</div>
            <div className="text-xs text-text-muted">18 Subclasses</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">
              <BookOpen className="w-4 h-4 text-domain-sage" /> Ancestries
            </div>
            <div className="text-2xl font-bold text-text-primary">{ANCESTRIES.length}</div>
            <div className="text-xs text-text-muted">Pure & Mixed</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">
              <Layers className="w-4 h-4 text-domain-arcana" /> Communities
            </div>
            <div className="text-2xl font-bold text-text-primary">{COMMUNITIES.length}</div>
            <div className="text-xs text-text-muted">Heritage Roots</div>
          </div>
          <div className="bg-bg-surface border border-border-subtle p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-wider font-semibold mb-1">
              <Wand2 className="w-4 h-4 text-domain-grace" /> Domain Cards
            </div>
            <div className="text-2xl font-bold text-text-primary">{DOMAIN_CARDS.length}</div>
            <div className="text-xs text-text-muted">9 Domains (L1–10)</div>
          </div>
        </section>

        {/* Domain Badges */}
        <section className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
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

          <div className="mt-4 pt-4 border-t border-border-subtle flex flex-wrap items-center gap-3">
            <span className="text-xs text-text-muted font-medium">Filter by Class:</span>
            <div className="flex flex-wrap gap-1.5">
              {CLASSES.map((cls) => (
                <button
                  key={cls.name}
                  onClick={() => {
                    setSelectedClass(cls.name);
                    setSelectedDomain('All');
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    selectedClass === cls.name
                      ? 'bg-hope text-bg-primary font-bold'
                      : 'bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                  }`}
                >
                  {cls.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Card Explorer */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span>Domain Cards</span>
              <span className="text-xs bg-bg-surface px-2.5 py-0.5 rounded-full border border-border-subtle text-text-muted">
                {filteredCards.length} matching
              </span>
            </h2>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards by name or text..."
                className="w-full bg-bg-surface border border-border-subtle rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-highlight"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.slice(0, 30).map((card) => (
              <div
                key={card.id}
                className="bg-bg-surface border border-border-subtle hover:border-border-highlight/50 transition-colors rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${domainColorMap[card.domain]}`}
                />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-bg-secondary text-text-muted border border-border-subtle">
                      Level {card.level}
                    </span>
                    <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${domainColorMap[card.domain]}`} />
                      {card.domain} &middot; {card.type}
                    </span>
                    <span className="text-xs font-mono text-hope font-semibold">
                      ⚡ {card.recallCost} Recall
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-text-primary mb-2">{card.name}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredCards.length > 30 && (
            <p className="text-center text-xs text-text-muted py-2">
              Showing first 30 of {filteredCards.length} cards. Filter or search to narrow down.
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
