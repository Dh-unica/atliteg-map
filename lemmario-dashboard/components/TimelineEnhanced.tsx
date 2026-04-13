'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useHighlight } from '@/context/HighlightContext';
import { Lemma } from '@/types/lemma';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { motionConfig } from '@/lib/motion-config';

// Funzione per convertire anno in quarto di secolo
const getQuartCentury = (year: number): string => {
  const century = Math.floor(year / 100);
  const quarterInCentury = Math.floor((year % 100) / 25);
  const quarters = ['I', 'II', 'III', 'IV'];
  return `${century}${quarters[quarterInCentury]}`;
};

// Funzione per ottenere range anni da quarto di secolo
const getYearRangeFromQuartCentury = (quartCentury: string): [number, number] => {
  // Trova dove inizia il numero romano (I, II, III, IV)
  const romanMatch = quartCentury.match(/^(\d+)(I{1,3}|IV|V)$/);
  if (!romanMatch) {
    console.error('[getYearRangeFromQuartCentury] Formato non valido:', quartCentury);
    return [0, 0];
  }

  const century = parseInt(romanMatch[1]);
  const romanQuarter = romanMatch[2];
  const quarterIndex = ['I', 'II', 'III', 'IV'].indexOf(romanQuarter);

  if (quarterIndex === -1) {
    console.error('[getYearRangeFromQuartCentury] Quarto romano non valido:', romanQuarter);
    return [0, 0];
  }

  const start = century * 100 + quarterIndex * 25;
  const end = start + 24;
  return [start, end];
};

// Componente Progress Bar per scrubbing
const TimelineProgressBar: React.FC<{ 
  currentPage: number; 
  totalPages: number;
  onScrub: (page: number) => void;
}> = ({ currentPage, totalPages, onScrub }) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const progress = (currentPage + 1) / totalPages;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePositionFromX(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updatePositionFromX(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updatePositionFromX(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      e.preventDefault();
      updatePositionFromX(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updatePositionFromX = (clientX: number) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newProgress = x / rect.width;
    const newPage = Math.floor(newProgress * totalPages);
    const clampedPage = Math.min(newPage, totalPages - 1);
    if (clampedPage !== currentPage) {
      onScrub(clampedPage);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  return (
    <div className="w-full mb-3">
      <div 
        ref={progressRef}
        className="relative h-3 bg-gray-200 rounded-full cursor-pointer touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={totalPages - 1}
        aria-valuenow={currentPage}
        aria-label="Navigazione temporale"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') onScrub(Math.max(0, currentPage - 1));
          if (e.key === 'ArrowRight') onScrub(Math.min(totalPages - 1, currentPage + 1));
        }}
      >
        {/* Background fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-blue-600 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformOrigin: "left" }}
        />
        
        {/* Scrubber handle */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-600 rounded-full shadow-md ${
            isDragging ? 'scale-125' : ''
          }`}
          animate={{ left: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ marginLeft: '-8px' }}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 1.4 }}
        />
      </div>
      
      {/* Page indicators */}
      <div className="flex justify-between mt-1 text-[9px] text-gray-400">
        <span>Pag. {currentPage + 1}</span>
        <span>{totalPages} pagine</span>
      </div>
    </div>
  );
};

// Componente Heatmap View
const TimelineHeatmap: React.FC<{
  quartCenturies: Array<{
    quartCentury: string;
    years: number[];
    lemmas: string[];
    attestazioni: number;
  }>;
  onCellClick: (quart: string) => void;
  selectedQuart: string | null;
}> = ({ quartCenturies, onCellClick, selectedQuart }) => {
  const maxAttestazioni = Math.max(...quartCenturies.map(q => q.attestazioni), 1);
  
  // Group by century
  const centuryGroups = useMemo(() => {
    const groups = new Map<number, typeof quartCenturies>();
    quartCenturies.forEach(q => {
      const century = parseInt(q.quartCentury.slice(0, -1));
      if (!groups.has(century)) {
        groups.set(century, []);
      }
      groups.get(century)!.push(q);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);
  }, [quartCenturies]);

  return (
    <div className="space-y-2">
      {centuryGroups.map(([century, quarts]) => (
        <div key={century} className="flex items-center gap-2">
          <div className="text-xs font-semibold text-gray-600 w-16">
            {century * 100}s
          </div>
          <div className="flex-1 grid grid-cols-4 gap-1">
            {['I', 'II', 'III', 'IV'].map(quarter => {
              const quartData = quarts.find(q => q.quartCentury === `${century}${quarter}`);
              const intensity = quartData ? quartData.attestazioni / maxAttestazioni : 0;
              const isSelected = selectedQuart === quartData?.quartCentury;
              
              // Calcola arco temporale per questo quarto
              const [startYear, endYear] = quartData
                ? getYearRangeFromQuartCentury(quartData.quartCentury)
                : [0, 0];

              return (
                <motion.button
                  key={`${century}${quarter}`}
                  onClick={() => quartData && onCellClick(quartData.quartCentury)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    h-12 rounded transition-all relative flex flex-col items-center justify-center gap-0.5
                    ${quartData ? 'cursor-pointer' : 'cursor-not-allowed opacity-20'}
                    ${isSelected ? 'ring-2 ring-blue-600 ring-offset-1' : ''}
                  `}
                  style={{
                    backgroundColor: quartData
                      ? `rgba(37, 99, 235, ${Math.max(intensity, 0.2)})`
                      : '#f3f4f6'
                  }}
                  title={quartData ? `${startYear}-${endYear}: ${quartData.attestazioni} occ.` : 'Nessun dato'}
                >
                  {quartData && (
                    <>
                      <span className="text-[9px] font-semibold text-white drop-shadow-md">
                        {startYear}-{endYear}
                      </span>
                      <span className="text-[11px] font-bold text-white drop-shadow-md">
                        {quartData.attestazioni}
                      </span>
                    </>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const TimelineEnhanced: React.FC = () => {
  const { lemmi, filteredLemmi } = useApp();
  const { highlightMultiple, clearHighlight, isYearHighlighted } = useHighlight();
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'bar' | 'heatmap'>('bar');
  const [zoomLevel, setZoomLevel] = useState<'quarter' | 'decade' | 'century'>('quarter');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    let t: ReturnType<typeof setTimeout>;
    const debounced = () => { clearTimeout(t); t = setTimeout(check, 150); };
    window.addEventListener('resize', debounced);
    return () => { clearTimeout(t); window.removeEventListener('resize', debounced); };
  }, []);

  // Fewer bars on mobile so labels don't overflow
  const itemsPerPage = zoomLevel === 'quarter'
    ? (isMobile ? 6 : 12)
    : zoomLevel === 'decade'
      ? (isMobile ? 10 : 20)
      : 8;

  // Raggruppa per quarti di secolo - AGGREGAZIONE TOTALE (indipendente da location)
  const quartCenturies = useMemo(() => {
    if (lemmi.length === 0) return [];

    const quartData = new Map<string, {
      years: Set<number>;
      lemmas: Set<string>;
      attestazioni: number;
    }>();

    filteredLemmi.forEach((lemma: Lemma) => {
      const year = lemma.Anno ? parseInt(lemma.Anno) : null;
      if (year && !isNaN(year)) {
        const quart = getQuartCentury(year);

        if (!quartData.has(quart)) {
          quartData.set(quart, {
            years: new Set(),
            lemmas: new Set(),
            attestazioni: 0
          });
        }

        const data = quartData.get(quart)!;
        data.years.add(year);
        data.lemmas.add(lemma.Lemma);
        // Somma la frequenza invece di contare le righe - TOTALE per periodo
        const freq = parseInt(lemma.Frequenza) || 0;
        data.attestazioni += freq;
      }
    });

    const result = Array.from(quartData.entries())
      .map(([quart, data]) => ({
        quartCentury: quart,
        hasData: data.years.size > 0,
        years: Array.from(data.years).sort((a, b) => a - b),
        lemmas: Array.from(data.lemmas),
        attestazioni: data.attestazioni
      }))
      .sort((a, b) => {
        const [startA] = getYearRangeFromQuartCentury(a.quartCentury);
        const [startB] = getYearRangeFromQuartCentury(b.quartCentury);
        return startA - startB;
      });

    // Debug: verifica che non ci siano duplicati
    const uniqueQuarts = new Set(result.map(q => q.quartCentury));
    console.log('[TimelineEnhanced] Quarti generati:', result.length);
    console.log('[TimelineEnhanced] Primi 5 quarti:', result.slice(0, 5).map(q => `${q.quartCentury} (${q.attestazioni} occ)`));

    if (uniqueQuarts.size !== result.length) {
      console.error('[TimelineEnhanced] ❌ ERRORE: Trovati quarti duplicati!', {
        total: result.length,
        unique: uniqueQuarts.size,
        duplicates: result.filter((q, i, arr) =>
          arr.findIndex(x => x.quartCentury === q.quartCentury) !== i
        )
      });
    } else {
      console.log('[TimelineEnhanced] ✅ Nessun duplicato trovato');
    }

    return result;
  }, [lemmi, filteredLemmi]);

  const totalPages = Math.ceil(quartCenturies.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleQuarts = quartCenturies.slice(startIndex, startIndex + itemsPerPage);

  // Debug: log delle barre visibili
  React.useEffect(() => {
    console.log('[TimelineEnhanced] Rendering pagina:', currentPage);
    console.log('[TimelineEnhanced] visibleQuarts.length:', visibleQuarts.length);
    console.log('[TimelineEnhanced] Barre visibili:');
    visibleQuarts.forEach((q, i) => {
      const [start, end] = getYearRangeFromQuartCentury(q.quartCentury);
      console.log(`  [${i}] ${start}-${end} (quart=${q.quartCentury}, attestazioni=${q.attestazioni})`);
    });

    // Verifica duplicati nell'array visibile
    const visibleQuartCenturiesSet = new Set(visibleQuarts.map(q => q.quartCentury));
    if (visibleQuartCenturiesSet.size !== visibleQuarts.length) {
      console.error('[TimelineEnhanced] ❌ DUPLICATI in visibleQuarts!', {
        total: visibleQuarts.length,
        unique: visibleQuartCenturiesSet.size
      });
    }
  }, [currentPage, visibleQuarts]);

  // Calcola statistiche
  const totalOccorrenze = useMemo(() => {
    return filteredLemmi.reduce((sum, lemma) => {
      const freq = parseInt(lemma.Frequenza) || 0;
      return sum + freq;
    }, 0);
  }, [filteredLemmi]);
  const totalForme = new Set(filteredLemmi.map(l => l.Forma)).size;
  const maxAttestazioni = Math.max(...quartCenturies.map(q => q.attestazioni), 1);

  const [selectedQuart, setSelectedQuart] = useState<string | null>(null);
  const [hoveredQuart, setHoveredQuart] = useState<string | null>(null);

  const handleQuartClick = (quart: string) => {
    console.log('[Timeline] Click su quarto:', quart, 'Attualmente selezionato:', selectedQuart);

    if (selectedQuart === quart) {
      // Deseleziona lo stesso periodo
      console.log('[Timeline] Deseleziono lo stesso periodo');
      setSelectedQuart(null);
      clearHighlight();
    } else {
      // Seleziona nuovo periodo
      console.log('[Timeline] Seleziono nuovo periodo:', quart);
      setSelectedQuart(quart);

      const quartData = quartCenturies.find(q => q.quartCentury === quart);
      if (quartData) {
        // Crea ID univoci per ogni occorrenza (riga)
        const lemmiIds = filteredLemmi
          .filter(l => {
            const year = parseInt(l.Anno);
            return quartData.years.includes(year);
          })
          .map(l => `${l.IdLemma}-${l.Forma}-${l.CollGeografica}-${l.Anno}`);

        console.log('[Timeline] Evidenzio', lemmiIds.length, 'lemmi per il periodo', quartData.years);
        console.log('[Timeline] LemmiIds unique:', new Set(lemmiIds).size);

        highlightMultiple({
          lemmaIds: lemmiIds,
          years: quartData.years,
          source: 'timeline',
          type: 'select'
        });
      }
    }
  };

  const handleQuartHover = (quart: string | null) => {
    if (!quart || selectedQuart) return;
    
    setHoveredQuart(quart);
    const quartData = quartCenturies.find(q => q.quartCentury === quart);
    if (quartData) {
      highlightMultiple({
        years: quartData.years,
        source: 'timeline',
        type: 'hover'
      });
    }
  };

  const handleScrub = (page: number) => {
    setCurrentPage(page);
  };

  if (quartCenturies.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="bg-white rounded-lg p-2 shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionConfig.spring.soft}
    >
      {/* Header con controlli */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Linea del tempo
          </h2>
          
          {/* View mode toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-md p-0.5">
            <motion.button
              onClick={() => setViewMode('bar')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                viewMode === 'bar' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Barre
            </motion.button>
            <motion.button
              onClick={() => setViewMode('heatmap')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                viewMode === 'heatmap' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Heatmap
            </motion.button>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <span className="font-semibold text-blue-600">{totalForme}</span> forme •{' '}
          <span className="font-semibold text-blue-600">{totalOccorrenze}</span> occorrenze
        </div>
      </div>

      {/* Progress Bar (solo in modalità bar) */}
      {viewMode === 'bar' && totalPages > 1 && (
        <TimelineProgressBar 
          currentPage={currentPage}
          totalPages={totalPages}
          onScrub={handleScrub}
        />
      )}

      {/* Timeline Views */}
      <AnimatePresence mode="wait">
        {viewMode === 'bar' ? (
          <motion.div
            key="bar-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={motionConfig.spring.soft}
            className="flex items-end gap-1 sm:gap-3 w-full overflow-hidden"
          >
            {/* Freccia sinistra */}
            <motion.button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              whileHover={currentPage > 0 ? { scale: 1.1, x: -2 } : {}}
              whileTap={currentPage > 0 ? { scale: 0.9 } : {}}
              className="flex-shrink-0 p-2 rounded-md bg-gray-100 hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-blue-600" />
            </motion.button>

            {/* Barre verticali */}
            <div className="flex-1 flex items-end justify-around gap-1 h-28">
              <AnimatePresence mode="sync">
                {visibleQuarts.map((quartItem) => {
                    const [startYear, endYear] = getYearRangeFromQuartCentury(quartItem.quartCentury);
                    const isSelected = selectedQuart === quartItem.quartCentury;
                    const isHovered = hoveredQuart === quartItem.quartCentury;
                    const isHighlighted = quartItem.years.some(year => isYearHighlighted(year));
                    const heightPx = Math.max((quartItem.attestazioni / maxAttestazioni) * 96, 12);

                    return (
                      <motion.div
                        key={quartItem.quartCentury}
                        layout
                        layoutId={`timeline-${quartItem.quartCentury}`}
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        transition={motionConfig.spring.soft}
                        className="flex flex-col items-center flex-1 min-w-0"
                      >
                        {/* Barra verticale con gradiente */}
                        <motion.button
                          layout
                          onClick={() => handleQuartClick(quartItem.quartCentury)}
                          onMouseEnter={() => handleQuartHover(quartItem.quartCentury)}
                          onMouseLeave={() => {
                            setHoveredQuart(null);
                            !selectedQuart && clearHighlight();
                          }}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ 
                            height: `${heightPx}px`, 
                            opacity: 1,
                            backgroundColor: isSelected 
                              ? '#2563eb'
                              : isHighlighted || isHovered
                                ? '#3b82f6'
                                : '#60a5fa'
                          }}
                          whileHover={{ 
                            scale: 1.08,
                            y: -6,
                            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.4)'
                          }}
                          whileTap={{ scale: 0.95 }}
                          transition={{
                            height: { ...motionConfig.spring.soft, delay: 0.05 },
                            scale: motionConfig.spring.fast,
                            y: motionConfig.spring.fast,
                            backgroundColor: { duration: 0.2 }
                          }}
                          className={`
                            w-full rounded-t-md relative overflow-hidden
                            ${isSelected ? 'shadow-lg ring-2 ring-blue-600' : 'shadow-sm'}
                          `}
                          title={`${startYear}-${endYear}: ${quartItem.attestazioni} occorrenze`}
                        >
                          {/* Shine effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            animate={isHovered || isSelected ? { x: '100%' } : { x: '-100%' }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />

                          {/* Numero al centro dell'istogramma - sempre visibile */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white pointer-events-none drop-shadow-md">
                              {quartItem.attestazioni}
                            </span>
                          </div>
                        </motion.button>
                        
                        {/* Label con periodo */}
                        <div className="mt-1 text-center w-full overflow-hidden">
                          <motion.div
                            className={`text-[9px] sm:text-[10px] font-semibold transition-colors truncate leading-tight ${
                              isSelected || isHighlighted || isHovered ? 'text-blue-600' : 'text-gray-600'
                            }`}
                            animate={{ scale: isSelected ? 1.1 : 1 }}
                          >
                            {isMobile ? startYear : `${startYear}-${endYear}`}
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                })}
              </AnimatePresence>
            </div>

            {/* Freccia destra */}
            <motion.button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              whileHover={currentPage < totalPages - 1 ? { scale: 1.1, x: 2 } : {}}
              whileTap={currentPage < totalPages - 1 ? { scale: 0.9 } : {}}
              className="flex-shrink-0 p-2 rounded-md bg-gray-100 hover:bg-blue-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="heatmap-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={motionConfig.spring.soft}
          >
            <TimelineHeatmap 
              quartCenturies={quartCenturies}
              onCellClick={handleQuartClick}
              selectedQuart={selectedQuart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
