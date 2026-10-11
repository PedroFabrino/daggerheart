import React, { useState } from 'react';
import { DomainCard, Domain } from '../../types/daggerheart';
import { FormattedFeatureText } from '../common/FormattedFeatureText';
import { Zap, ChevronDown, ChevronUp, Archive, ArrowUpRight } from 'lucide-react';

interface DomainCardProps {
  card: DomainCard;
  viewMode: 'visual' | 'compact';
  location: 'loadout' | 'vault';
  onVault?: (cardId: string) => void;
  onEquip?: (card: DomainCard) => void;
}

const domainColorMap: Record<Domain, { bar: string; badge: string; text: string }> = {
  Arcana: { bar: 'bg-domain-arcana', badge: 'bg-domain-arcana/20 border-domain-arcana/40', text: 'text-indigo-400' },
  Blade: { bar: 'bg-domain-blade', badge: 'bg-domain-blade/20 border-domain-blade/40', text: 'text-sky-400' },
  Bone: { bar: 'bg-domain-bone', badge: 'bg-domain-bone/20 border-domain-bone/40', text: 'text-stone-300' },
  Codex: { bar: 'bg-domain-codex', badge: 'bg-domain-codex/20 border-domain-codex/40', text: 'text-amber-400' },
  Dread: { bar: 'bg-domain-dread', badge: 'bg-domain-dread/20 border-domain-dread/40', text: 'text-slate-400' },
  Grace: { bar: 'bg-domain-grace', badge: 'bg-domain-grace/20 border-domain-grace/40', text: 'text-pink-400' },
  Midnight: { bar: 'bg-domain-midnight', badge: 'bg-domain-midnight/20 border-domain-midnight/40', text: 'text-purple-400' },
  Sage: { bar: 'bg-domain-sage', badge: 'bg-domain-sage/20 border-domain-sage/40', text: 'text-emerald-400' },
  Splendor: { bar: 'bg-domain-splendor', badge: 'bg-domain-splendor/20 border-domain-splendor/40', text: 'text-amber-300' },
  Valor: { bar: 'bg-domain-valor', badge: 'bg-domain-valor/20 border-domain-valor/40', text: 'text-rose-400' },
};

export const DomainCardComponent: React.FC<DomainCardProps> = ({
  card,
  viewMode,
  location,
  onVault,
  onEquip,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const colors = domainColorMap[card.domain] || domainColorMap.Sage;

  // COMPACT COMBAT LIST VIEW
  if (viewMode === 'compact') {
    return (
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-3 shadow-sm hover:border-border-highlight/40 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-2.5 flex-1 cursor-pointer select-none"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${colors.bar} flex-shrink-0`} />
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-xs text-text-primary">{card.name}</h4>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors.badge} ${colors.text} font-semibold`}>
                Lvl {card.level} &middot; {card.domain}
              </span>
              <span className="text-[10px] text-text-muted">{card.type}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-hope flex items-center gap-0.5">
              <Zap className="w-3 h-3" /> {card.recallCost}
            </span>

            {location === 'loadout' && onVault && (
              <button
                onClick={() => onVault(card.id)}
                className="text-[10px] font-bold px-2 py-1 rounded bg-bg-surface hover:bg-bg-hover text-text-muted hover:text-text-primary border border-border-subtle transition-colors flex items-center gap-1"
                title="Send card to Vault"
              >
                <Archive className="w-3 h-3" /> Vault
              </button>
            )}

            {location === 'vault' && onEquip && (
              <button
                onClick={() => onEquip(card)}
                className="text-[10px] font-bold px-2.5 py-1 rounded bg-hope/20 hover:bg-hope/30 text-hope-light border border-hope/30 transition-colors flex items-center gap-1"
                title="Equip card to Loadout"
              >
                <ArrowUpRight className="w-3 h-3" /> Equip
              </button>
            )}

            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-text-muted hover:text-text-primary p-1"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-border-subtle text-xs text-text-secondary leading-relaxed">
            <FormattedFeatureText text={card.text} />
          </div>
        )}
      </div>
    );
  }

  // FULL VISUAL CARD VIEW
  return (
    <div className="bg-bg-secondary border border-border-subtle hover:border-border-highlight/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all group">
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${colors.bar}`} />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-surface border border-border-subtle text-text-muted">
              Lvl {card.level}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors.badge} ${colors.text}`}>
              {card.domain}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono font-bold text-hope flex items-center gap-0.5 bg-bg-surface px-2 py-0.5 rounded border border-border-subtle">
              <Zap className="w-3 h-3" /> {card.recallCost}
            </span>
          </div>
        </div>

        {/* Title and Type */}
        <div className="mb-2">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider block">
            {card.type}
          </span>
          <h4 className="font-extrabold text-sm text-text-primary tracking-tight">
            {card.name}
          </h4>
        </div>

        {/* Feature Text */}
        <FormattedFeatureText text={card.text} className="text-xs mb-3" />
      </div>

      {/* Action Footer */}
      <div className="border-t border-border-subtle/80 pt-2.5 flex items-center justify-between text-xs">
        <span className="text-[10px] text-text-muted italic">
          {location === 'loadout' ? 'Active Loadout' : 'Stored in Vault'}
        </span>

        {location === 'loadout' && onVault && (
          <button
            onClick={() => onVault(card.id)}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-bg-surface hover:bg-bg-hover text-text-muted hover:text-text-primary border border-border-subtle transition-colors flex items-center gap-1"
          >
            <Archive className="w-3.5 h-3.5" /> Move to Vault
          </button>
        )}

        {location === 'vault' && onEquip && (
          <button
            onClick={() => onEquip(card)}
            className="text-[11px] font-bold px-3 py-1 rounded-lg bg-hope/20 hover:bg-hope/30 text-hope-light border border-hope/30 transition-colors flex items-center gap-1"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Equip to Loadout
          </button>
        )}
      </div>
    </div>
  );
};
