'use client';

import { useApp } from '@/context/AppContext';
import { Search, X, ListOrdered, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Lemma } from '@/types/lemma';
import { getUniqueCategorie, getUniquePeriodi } from '@/services/dataLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { motionConfig } from '@/lib/motion-config';

interface CompactToolbarProps {
  onToggleIndice?: () => void;
}

// Lightweight dropdown component with viewport-aware positioning
interface DropdownSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
  placeholder: string;
}

function DropdownSelect({ label, options, selectedValues, onChange, placeholder }: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update dropdown position with viewport awareness
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // Minimum dropdown width for usability
        const minDropdownWidth = 280;
        const dropdownWidth = Math.max(rect.width, minDropdownWidth);
        
        // Calculate initial left position
        let leftPosition = rect.left + window.scrollX;
        
        // Check if dropdown would overflow right edge of viewport
        const wouldOverflowRight = (rect.left + dropdownWidth) > viewportWidth;
        
        // On mobile or when would overflow, align to right edge of button
        if (wouldOverflowRight || viewportWidth < 768) {
          // Align dropdown's right edge with button's right edge
          leftPosition = rect.right + window.scrollX - dropdownWidth;
          
          // Ensure dropdown doesn't go off left edge
          leftPosition = Math.max(8, leftPosition);
        }
        
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: leftPosition,
          width: dropdownWidth
        });
      }
    };

    updatePosition();

    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => !selectedValues.includes(opt));

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1.5 text-xs border border-border rounded-md focus:outline-none focus:border-accent bg-white hover:bg-gray-50 transition-fast flex items-center gap-1.5 max-w-[120px]"
      >
        <span className="text-text-secondary truncate">{placeholder}</span>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={motionConfig.transitions.fast}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 9999
              }}
              className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="max-h-[300px] overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    Nessuna opzione disponibile
                  </div>
                ) : (
                  filteredOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-sm text-gray-700"
                    >
                      {option}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export function CompactToolbar({ onToggleIndice }: CompactToolbarProps) {
  const { lemmi, filters, setFilters, resetFilters } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Lemma[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categorie = useMemo(() => getUniqueCategorie(lemmi), [lemmi]);
  const periodi = useMemo(() => getUniquePeriodi(lemmi), [lemmi]);

  const hasActiveFilters = filters.categorie.length > 0 || filters.periodi.length > 0 || !!filters.selectedLemmaId;

  // Trova il lemma selezionato per visualizzarlo come filtro attivo
  const selectedLemma = useMemo(() => {
    if (!filters.selectedLemmaId) return null;
    return lemmi.find(l => l.IdLemma === filters.selectedLemmaId);
  }, [filters.selectedLemmaId, lemmi]);

  // Search suggestions
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length > 0) {
        // Deduplicazione per coppia Lemma+Forma
        const uniqueResults = new Map<string, Lemma>();
        const lowerQuery = searchQuery.toLowerCase();

        for (const lemma of lemmi) {
          if (uniqueResults.size >= 5) break;

          const matches =
            lemma.Lemma.toLowerCase().includes(lowerQuery) ||
            lemma.Forma.toLowerCase().includes(lowerQuery);

          if (matches) {
            // Normalizza la chiave per evitare duplicati da case/spazi
            const key = `${lemma.Lemma.toLowerCase().trim()}|${lemma.Forma.toLowerCase().trim()}`;
            if (!uniqueResults.has(key)) {
              uniqueResults.set(key, lemma);
            }
          }
        }

        setSuggestions(Array.from(uniqueResults.values()));
        setIsSearchOpen(uniqueResults.size > 0);
      } else {
        setSuggestions([]);
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, lemmi]);

  const handleSelectLemma = (lemma: Lemma) => {
    setFilters({ searchQuery: lemma.Lemma, selectedLemmaId: lemma.IdLemma });
    setSearchQuery(lemma.Lemma);
    setIsSearchOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({ searchQuery: '', selectedLemmaId: null });
    setSuggestions([]);
    setIsSearchOpen(false);
  };

  const handleRemoveSelectedLemma = () => {
    setFilters({ selectedLemmaId: null, searchQuery: '' });
    setSearchQuery('');
  };

  return (
    <div className="bg-white border-b border-border">
      <div className="max-w-container mx-auto px-2 sm:px-lg py-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Bar - Compatta */}
          <div className="relative flex-1 min-w-0 w-full sm:min-w-[200px]" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca lemma o forma..."
                className="w-full pl-9 pr-9 py-1.5 text-sm bg-background-muted border border-border rounded-md focus:outline-none focus:border-accent"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-accent transition-fast"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Search Suggestions - Compatte */}
            {isSearchOpen && suggestions.length > 0 && (
              <div className="absolute z-[1000] w-full mt-1 bg-white border border-border rounded-md shadow-card-hover max-h-[200px] overflow-y-auto">
                {suggestions.map((lemma, index) => (
                  <div
                    key={`${lemma.IdLemma}-${index}`}
                    onClick={() => handleSelectLemma(lemma)}
                    className="px-3 py-2 cursor-pointer border-b border-border last:border-b-0 hover:bg-background-muted transition-fast"
                  >
                    <div className="font-medium text-text-primary text-sm">{lemma.Lemma}</div>
                    <div className="text-xs text-text-muted">Forma: {lemma.Forma}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Indice Alfabetico Button */}
          {onToggleIndice && (
            <button
              onClick={onToggleIndice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-background-muted hover:bg-primary-light border border-border rounded-md transition-fast text-xs font-medium text-primary"
              aria-label="Apri indice alfabetico"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Indice
            </button>
          )}

          {/* Filtri Inline */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Filtri:</span>

            <DropdownSelect
              label="Categoria"
              options={categorie}
              selectedValues={filters.categorie}
              onChange={(value) => setFilters({ categorie: [...filters.categorie, value] })}
              placeholder="Categoria"
            />

            <DropdownSelect
              label="Periodo"
              options={periodi}
              selectedValues={filters.periodi}
              onChange={(value) => setFilters({ periodi: [...filters.periodi, value] })}
              placeholder="Periodo"
            />

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2 py-1.5 bg-accent text-white rounded-md hover:bg-accent-hover transition-fast text-xs flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {/* Active Filters Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1 ml-auto">
              {/* Lemma selezionato dall'indice alfabetico */}
              {selectedLemma && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary rounded-sm text-xs font-medium border border-primary/20"
                >
                  {selectedLemma.Lemma}
                  <button
                    onClick={handleRemoveSelectedLemma}
                    className="hover:bg-primary/10 rounded-sm"
                    aria-label={`Rimuovi filtro lemma ${selectedLemma.Lemma}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )}
              {filters.categorie.map(cat => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-primary rounded-sm text-xs"
                >
                  {cat}
                  <button
                    onClick={() => setFilters({ categorie: filters.categorie.filter(c => c !== cat) })}
                    className="hover:bg-primary/10 rounded-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.periodi.map(per => (
                <span
                  key={per}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-light text-accent rounded-sm text-xs"
                >
                  {per}
                  <button
                    onClick={() => setFilters({ periodi: filters.periodi.filter(p => p !== per) })}
                    className="hover:bg-accent/10 rounded-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
