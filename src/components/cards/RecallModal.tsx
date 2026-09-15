import React, { useState } from 'react';
import { Character, DomainCard } from '../../types/daggerheart';
import { MAX_LOADOUT_CARDS, canRecallCard } from '../../domain/cardManager';
import { Zap, AlertTriangle, ArrowRightLeft, X, BedDouble } from 'lucide-react';

interface RecallModalProps {
  character: Character;
  cardToEquip: DomainCard;
  onConfirm: (vaultedCardId: string, replacedCardId?: string, isRest?: boolean) => void;
  onClose: () => void;
}

export const RecallModal: React.FC<RecallModalProps> = ({
  character,
  cardToEquip,
  onConfirm,
  onClose,
}) => {
  const isLoadoutFull = character.loadout.length >= MAX_LOADOUT_CARDS;
  const [isDowntimeRest, setIsDowntimeRest] = useState<boolean>(false);
  const [selectedReplaceCardId, setSelectedReplaceCardId] = useState<string>(
    character.loadout[0]?.id || ''
  );

  const check = canRecallCard(character, cardToEquip, isDowntimeRest);
  const resultingStress = character.stress.current + check.stressCost;

  const handleConfirm = () => {
    if (!check.allowed) return;
    onConfirm(
      cardToEquip.id,
      isLoadoutFull ? selectedReplaceCardId : undefined,
      isDowntimeRest
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-bg-surface border border-border-subtle rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-hope" />
            <h3 className="text-base font-black text-text-primary">
              Equip to Loadout: {cardToEquip.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Swap Mode Toggle */}
        <div className="bg-bg-secondary p-3 rounded-xl border border-border-subtle space-y-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
            Context of Swap
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsDowntimeRest(false)}
              className={`p-2.5 rounded-lg border text-xs font-bold text-left transition-all flex items-center justify-between ${
                !isDowntimeRest
                  ? 'border-hope bg-hope/10 text-text-primary ring-2 ring-hope/30'
                  : 'border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-hover'
              }`}
            >
              <div>
                <div>Active Play Recall</div>
                <div className="text-[10px] text-hope font-normal">
                  Costs {cardToEquip.recallCost} Stress
                </div>
              </div>
              <Zap className="w-4 h-4 text-hope" />
            </button>

            <button
              type="button"
              onClick={() => setIsDowntimeRest(true)}
              className={`p-2.5 rounded-lg border text-xs font-bold text-left transition-all flex items-center justify-between ${
                isDowntimeRest
                  ? 'border-domain-sage bg-domain-sage/10 text-text-primary ring-2 ring-domain-sage/30'
                  : 'border-border-subtle bg-bg-surface text-text-secondary hover:bg-bg-hover'
              }`}
            >
              <div>
                <div>Downtime Rest</div>
                <div className="text-[10px] text-domain-sage font-normal">Free (0 Stress)</div>
              </div>
              <BedDouble className="w-4 h-4 text-domain-sage" />
            </button>
          </div>
        </div>

        {/* Stress Cost Breakdown */}
        {!isDowntimeRest && (
          <div className="bg-bg-secondary/70 p-3 rounded-xl border border-border-subtle text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Recall Stress Cost:</span>
              <span className="font-mono font-bold text-hope">
                +{check.stressCost} Stress
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Stress Pool Progression:</span>
              <span className="font-mono font-bold text-text-primary">
                {character.stress.current} / {character.stress.max} &rarr;{' '}
                <span className={resultingStress > character.stress.max ? 'text-fear' : 'text-fear-light'}>
                  {resultingStress} / {character.stress.max}
                </span>
              </span>
            </div>

            {!check.allowed && (
              <div className="mt-2 text-xs text-fear flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {check.reason}
              </div>
            )}
          </div>
        )}

        {/* Loadout Full Replacement Picker */}
        {isLoadoutFull && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-text-primary">
              Loadout is Full (5/5) &mdash; Select card to move to Vault:
            </label>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {character.loadout.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedReplaceCardId(card.id)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    selectedReplaceCardId === card.id
                      ? 'border-hope bg-hope/10 font-bold text-text-primary ring-2 ring-hope/30'
                      : 'border-border-subtle bg-bg-secondary hover:bg-bg-hover text-text-secondary'
                  }`}
                >
                  <div>
                    <span className="text-text-primary font-bold">{card.name}</span>
                    <span className="text-[10px] text-text-muted ml-2">
                      ({card.domain} Lvl {card.level})
                    </span>
                  </div>
                  {selectedReplaceCardId === card.id && (
                    <span className="text-[10px] text-hope font-bold uppercase">To Vault</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-secondary border border-border-subtle transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!check.allowed || (isLoadoutFull && !selectedReplaceCardId)}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-hope text-bg-primary hover:bg-hope-light disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {isDowntimeRest ? 'Equip for Free' : `Recall (Mark ${check.stressCost} Stress)`}
          </button>
        </div>
      </div>
    </div>
  );
};
