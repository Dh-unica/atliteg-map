'use client';

import { useState, useMemo, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface MapBoundedPopupProps {
  lemmaGroups: Map<string, any[]>;
  locationName: string;
  onClose: () => void;
  /** When true the component header (location name + close button) is omitted.
   *  Used when the header is rendered by the parent mobile modal. */
  hideHeader?: boolean;
}

export function MapBoundedPopup({ lemmaGroups, locationName, onClose, hideHeader = false }: MapBoundedPopupProps) {
  // Stati
  const [expandedLemmi, setExpandedLemmi] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(check, 150);
    };
    window.addEventListener('resize', debouncedCheck);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheck);
    };
  }, []);

  // Calcola numero di colonne dinamicamente (max 3, 1 su mobile)
  const numColumns = useMemo(() => {
    if (isMobile) return 1;
    const totalLemmi = lemmaGroups.size;
    if (totalLemmi === 1) return 1;
    if (totalLemmi === 2) return 2;
    return 3;
  }, [lemmaGroups, isMobile]);

  // Dividi lemmi in colonne (responsive)
  const columns = useMemo(() => {
    const lemmiArray = Array.from(lemmaGroups.entries());
    const cols: Array<Array<[string, any[]]>> = Array.from({ length: numColumns }, () => []);

    lemmiArray.forEach(([name, lemmi], idx) => {
      cols[idx % numColumns].push([name, lemmi]);
    });

    return cols;
  }, [lemmaGroups, numColumns]);

  const toggleLemma = (lemmaName: string) => {
    setExpandedLemmi(prev => {
      const next = new Set(prev);
      next.has(lemmaName) ? next.delete(lemmaName) : next.add(lemmaName);
      return next;
    });
  };

  // Rendering accordion item
  const renderAccordionItem = ([lemmaName, lemmi]: [string, any[]]) => {
    const isExpanded = expandedLemmi.has(lemmaName);
    
    return (
      <div key={lemmaName} className="border-b last:border-0">
        <button
          onClick={() => toggleLemma(lemmaName)}
          className="w-full flex items-start justify-between p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left min-h-[44px]"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Chiudi' : 'Espandi'} dettagli per ${lemmaName}`}
        >
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{lemmaName}</h4>
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-100 rounded">
              {lemmi.length}
            </span>
            <ChevronDownIcon
              className={`w-3 h-3 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </div>
        </button>

        {isExpanded && (
          <div className="px-3 pb-2 bg-gray-50 border-t animate-fadeIn">
            <ul className="space-y-0.5 text-[13px] mt-1">
              {lemmi.map((lemma: any, idx: number) => (
                <li key={idx} className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-gray-400 text-xs">•</span>
                  <em className="truncate">{lemma.Forma}</em>
                  <span className="text-gray-600 shrink-0">
                    ({lemma.Datazione || 'n.d.'})
                  </span>
                  {lemma.Frequenza && (
                    <span className="text-blue-600 shrink-0 text-xs">
                      freq.:{lemma.Frequenza}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full">
      {/* HEADER — hidden when parent renders its own header (mobile modal) */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-t-lg border-b">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate" title={locationName}>{locationName}</h3>
            <p className="text-sm text-gray-600">
              {lemmaGroups.size} {lemmaGroups.size === 1 ? 'lemma' : 'lemmi'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded transition-colors ml-3 flex-shrink-0"
            title="Chiudi"
            aria-label="Chiudi popup"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      {/* CONTENT - COLONNE DINAMICHE */}
      <div className={hideHeader ? '' : 'overflow-y-auto max-h-[50vh] sm:max-h-[300px]'}>
        <div
          className="gap-3 p-3 sm:p-4"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${numColumns}, 1fr)`
          }}
        >
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="space-y-1">
              {col.map(renderAccordionItem)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
