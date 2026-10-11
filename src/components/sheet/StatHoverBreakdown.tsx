import React, { useState, useRef, useEffect } from 'react';
import { StatBreakdownPart } from '../../domain/combatMath';
import { Info } from 'lucide-react';

interface StatHoverBreakdownProps {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  subLabel?: string;
  icon?: React.ReactNode;
  breakdownTitle: string;
  breakdown: StatBreakdownPart[];
  totalLabel?: string;
  totalValue?: string | number;
  badgeNote?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const StatHoverBreakdown: React.FC<StatHoverBreakdownProps> = ({
  label,
  value,
  valueColor = 'text-text-primary',
  subLabel,
  icon,
  breakdownTitle,
  breakdown,
  totalLabel,
  totalValue,
  badgeNote,
  align = 'center',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click (for mobile touch toggle)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignmentClasses =
    align === 'left'
      ? 'left-0'
      : align === 'right'
      ? 'right-0'
      : 'left-1/2 -translate-x-1/2';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block cursor-help select-none ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        } else if (e.key === 'Escape') {
          setIsOpen(false);
        }
      }}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`${label}: ${value !== undefined && value !== null ? String(value) : ''}. Click or hover for breakdown.`}
      data-testid={`stat-breakdown-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
    >
      {/* Badge Content */}
      <div className="text-center group transition-all">
        <div className="flex items-center justify-center gap-1">
          {icon}
          <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider group-hover:text-text-primary transition-colors">
            {label}
          </span>
          <Info className="w-2.5 h-2.5 text-text-muted/60 group-hover:text-hope transition-colors" />
        </div>
        <div className={`text-base font-black ${valueColor} group-hover:scale-105 transition-transform`}>
          {value}
        </div>
        {subLabel && (
          <div className="text-[9px] text-text-muted font-semibold mt-0.5">
            {subLabel}
          </div>
        )}
      </div>

      {/* Floating Hover Breakdown Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2.5 z-50 w-72 sm:w-80 bg-bg-surface/95 backdrop-blur-md border border-border-highlight/60 rounded-2xl p-4 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-auto ${alignmentClasses}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle gap-2">
            <div className="flex items-center gap-1.5">
              {icon}
              <h4 className="text-xs font-black uppercase tracking-wider text-text-primary">
                {breakdownTitle}
              </h4>
            </div>
            {badgeNote && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-hope/15 text-hope border border-hope/30 whitespace-nowrap">
                {badgeNote}
              </span>
            )}
          </div>

          {/* Breakdown Items List */}
          <div className="py-2.5 space-y-2 max-h-60 overflow-y-auto pr-1">
            {breakdown.length === 0 ? (
              <div className="text-xs text-text-muted italic py-1">
                No active modifiers
              </div>
            ) : (
              breakdown.map((part, idx) => {
                const valStr = String(part.value);
                const isPositive = valStr.startsWith('+');
                const isNegative = valStr.startsWith('-');

                return (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3 text-xs bg-bg-secondary/60 hover:bg-bg-secondary px-2.5 py-1.5 rounded-xl border border-border-subtle/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-text-primary block truncate">
                        {part.source}
                      </span>
                      {part.details && (
                        <span className="text-[10px] text-text-muted block leading-tight mt-0.5">
                          {part.details}
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.5 rounded-md text-[11px] shrink-0 ${
                        isPositive
                          ? 'bg-hope/15 text-hope'
                          : isNegative
                          ? 'bg-fear/15 text-fear-light'
                          : 'bg-bg-surface text-text-primary border border-border-subtle'
                      }`}
                    >
                      {part.value}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Total */}
          {(totalLabel || totalValue !== undefined) && (
            <div className="pt-2.5 border-t border-border-subtle flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted">
                {totalLabel || 'Calculated Total'}
              </span>
              <span className="text-sm font-black font-mono text-hope">
                {totalValue}
              </span>
            </div>
          )}

          <div className="mt-2 text-[9px] text-text-muted/70 text-center italic">
            Auto-calculated from class base, gear & active domain cards
          </div>
        </div>
      )}
    </div>
  );
};
