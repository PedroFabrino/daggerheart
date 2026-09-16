import React, { useRef, useState } from 'react';
import { useCharacter } from '../../context/CharacterContext';
import { exportCharacterToJson } from '../../domain/rosterPortability';
import { Character } from '../../types/daggerheart';
import {
  Users,
  X,
  PlusCircle,
  Copy,
  Trash2,
  Download,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CharacterRosterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterRosterDrawer: React.FC<CharacterRosterDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    characters,
    activeId,
    selectActiveCharacter,
    deleteCharacter,
    duplicateCharacter,
    importCharacterJSON,
    startCreation,
  } = useCharacter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    success?: string;
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  // Handle single character download
  const handleExportCharacter = (char: Character) => {
    const { filename, jsonString } = exportCharacterToJson(char);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = await importCharacterJSON(text);
      setImportStatus({
        success: `Successfully imported "${imported.name}" (Level ${imported.level} ${imported.className})!`,
      });
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err: any) {
      setImportStatus({
        error: `Import failed: ${err?.message || 'Invalid JSON file'}`,
      });
      setTimeout(() => setImportStatus(null), 5000);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="bg-bg-surface border-l border-border-subtle w-full max-w-md h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto space-y-5">
        {/* Drawer Header */}
        <div className="space-y-3 border-b border-border-subtle pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-hope/20 text-hope flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-base text-text-primary">
                Character Roster
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-bg-secondary text-text-muted border border-border-subtle">
                {characters.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-bg-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                startCreation();
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-hope text-bg-primary font-bold flex items-center justify-center gap-1.5 hover:bg-hope-light transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Character</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl bg-bg-secondary hover:bg-bg-hover text-text-primary border border-border-subtle font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Upload className="w-4 h-4 text-hope" />
              <span>Import JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Status Message */}
          {importStatus?.success && (
            <div className="bg-domain-sage/20 border border-domain-sage/40 text-domain-sage p-2.5 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{importStatus.success}</span>
            </div>
          )}
          {importStatus?.error && (
            <div className="bg-fear/20 border border-fear/40 text-fear p-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{importStatus.error}</span>
            </div>
          )}
        </div>

        {/* Characters List */}
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {characters.length === 0 ? (
            <div className="p-8 text-center bg-bg-secondary rounded-2xl border border-dashed border-border-subtle text-text-muted text-xs">
              No characters saved yet. Create your first adventurer!
            </div>
          ) : (
            characters.map((char) => {
              const isActive = char.id === activeId;
              const isConfirmingDelete = deleteConfirmId === char.id;

              return (
                <div
                  key={char.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isActive
                      ? 'border-hope bg-hope/5 ring-1 ring-hope/30'
                      : 'border-border-subtle bg-bg-secondary hover:border-border-highlight/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-text-primary">
                          {char.name}
                        </h4>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-hope/20 text-hope border border-hope/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        Level {char.level} &middot; {char.heritage.ancestryName} &middot;{' '}
                        <strong className="text-text-secondary">{char.className}</strong>
                        {char.subclassName ? ` (${char.subclassName})` : ''}
                      </p>
                    </div>

                    <span className="text-[11px] font-mono text-text-muted font-semibold">
                      HP {char.hp.max - char.hp.currentDamage}/{char.hp.max}
                    </span>
                  </div>

                  {/* Character Actions */}
                  <div className="flex items-center justify-between gap-1 pt-2 border-t border-border-subtle/80 text-xs">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await selectActiveCharacter(char.id);
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-bg-surface hover:bg-bg-hover text-text-primary border border-border-subtle font-bold text-xs transition-colors"
                      >
                        Switch
                      </button>
                    ) : (
                      <span className="text-[11px] text-hope font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Playing
                      </span>
                    )}

                    <div className="flex items-center gap-1">
                      {/* Duplicate Button */}
                      <button
                        type="button"
                        onClick={() => duplicateCharacter(char.id)}
                        className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-text-muted hover:text-text-primary border border-border-subtle transition-colors"
                        title="Duplicate Character"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Export Button */}
                      <button
                        type="button"
                        onClick={() => handleExportCharacter(char)}
                        className="p-1.5 rounded-lg bg-bg-surface hover:bg-bg-hover text-text-muted hover:text-text-primary border border-border-subtle transition-colors"
                        title="Export Character (.json)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 animate-fade-in">
                          <button
                            type="button"
                            onClick={() => {
                              deleteCharacter(char.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-fear text-white text-[10px] font-bold"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-lg bg-bg-surface text-text-muted text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(char.id)}
                          className="p-1.5 rounded-lg bg-bg-surface hover:bg-fear/20 hover:text-fear text-text-muted border border-border-subtle transition-colors"
                          title="Delete Character"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-border-subtle pt-3 text-center">
          <p className="text-[10px] text-text-muted">
            All character state stored locally with automatic offline persistence.
          </p>
        </div>
      </div>
    </div>
  );
};
