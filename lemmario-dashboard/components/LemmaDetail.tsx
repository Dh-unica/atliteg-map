'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Lemma } from '@/types/lemma';
import { FileText, MapPin, Calendar, Hash, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/MotionWrapper';
import { motionConfig } from '@/lib/motion-config';

export const LemmaDetail: React.FC = () => {
  const { filteredLemmi, filters } = useApp();

  const displayedLemmas = useMemo(() => {
    if (filters.selectedLemmaId !== null) {
      return filteredLemmi.filter(
        (lemma: Lemma) => lemma.IdLemma === filters.selectedLemmaId
      );
    }
    if (
      filters.searchQuery ||
      filters.categorie.length > 0 ||
      filters.periodi.length > 0 ||
      filters.selectedLetter !== null ||
      filters.selectedYear !== null
    ) {
      return filteredLemmi.slice().sort((a: Lemma, b: Lemma) => a.Lemma.localeCompare(b.Lemma));
    }
    return [];
  }, [filteredLemmi, filters]);

  const groupedByLemma = useMemo(() => {
    const groups = new Map<string, Lemma[]>();
    displayedLemmas.forEach((lemma: Lemma) => {
      if (!groups.has(lemma.Lemma)) {
        groups.set(lemma.Lemma, []);
      }
      groups.get(lemma.Lemma)!.push(lemma);
    });
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [displayedLemmas]);

  // IMPORTANTE: Tutti gli hooks DEVONO essere chiamati PRIMA di qualsiasi early return
  const totalOccorrenze = useMemo(() => {
    return displayedLemmas.reduce((sum, lemma) => {
      const freq = parseInt(lemma.Frequenza) || 0;
      return sum + freq;
    }, 0);
  }, [displayedLemmas]);

  const totalForme = useMemo(() => {
    return new Set(displayedLemmas.map(l => l.Forma)).size;
  }, [displayedLemmas]);

  // Empty state - render DOPO tutti gli hooks
  if (displayedLemmas.length === 0) {
    return (
      <FadeIn>
        <div className="card p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '200px', height: 'clamp(200px, 50vw, 580px)' }}>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              type: 'tween' // Usa tween invece di spring per supportare array di keyframes
            }}
          >
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nessun lemma selezionato
          </h3>
          <p className="text-gray-500 max-w-sm">
            Seleziona un punto sulla mappa, effettua una ricerca o usa i filtri per
            visualizzare i dettagli dei lemmi
          </p>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="card !p-0 flex flex-col overflow-hidden" style={{ minHeight: '200px', height: 'clamp(200px, 50vw, 580px)' }}>
      {/* Header Sticky - Padding minimale */}
      <div className="px-1.5 pt-1.5 pb-1.5 border-b border-border sticky top-0 bg-white z-10">
        <h2 className="text-base font-semibold text-text-primary mb-0.5">Dettaglio Forme</h2>
        <motion.div
          key={`header-${groupedByLemma.length}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.transitions.fast}
          className="flex items-center gap-1.5 text-sm text-text-secondary"
        >
          <span><strong>{totalForme}</strong> forme</span>
          <span>•</span>
          <span><strong>{totalOccorrenze}</strong> occorrenze</span>
        </motion.div>
      </div>

      {/* Content - Padding laterale minimale */}
      <LayoutGroup>
        <AnimatePresence mode="wait">
          <motion.div
            key={filters.selectedLemmaId || filters.searchQuery || filters.selectedLetter || 'all'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={motionConfig.transitions.medium}
            className="flex-1 overflow-y-auto space-y-1.5 px-1.5 pb-1.5 pt-1.5"
          >
        {groupedByLemma.map(([lemmaText, occurrences]) => {
          // Estrai proprietà comuni a livello Lemma
          const firstOccurrence = occurrences[0];
          const categoria = firstOccurrence.Categoria || '';
          const url = firstOccurrence.URL || '';

          // Calcola occorrenze totali per questo lemma (somma frequenze)
          const totalFreq = occurrences.reduce((sum, lemma) => {
            const freq = parseInt(lemma.Frequenza) || 0;
            return sum + freq;
          }, 0);

          return (
            <motion.div
              key={lemmaText}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={motionConfig.spring.soft}
              className="border border-border rounded-md bg-white hover:shadow-card transition-fast overflow-hidden"
            >
              {/* Header Lemma - ORA IN CIMA con link */}
              <div className="px-1.5 py-1 bg-primary/5 border-b border-border">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-text-primary truncate">{lemmaText}</h3>
                  <span className="text-xs font-normal text-text-muted bg-white px-1 py-0.5 rounded flex-shrink-0">
                    {totalFreq} occ.
                  </span>
                  {url && url.trim() && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-primary hover:text-primary-dark transition-colors flex-shrink-0"
                      title="Vedi su vocabolario.atliteg.org"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Metadati a livello Lemma */}
                {categoria && (
                  <div className="text-xs text-text-secondary mt-0.5">
                    <span className="font-medium">Cat:</span> {categoria}
                  </div>
                )}
              </div>

              {/* Lista Forme */}
              <div className="space-y-1 p-1.5">
                {occurrences.map((lemma, idx) => (
                  <div
                    key={`${lemma.IdLemma}-${idx}`}
                    className="bg-background-muted rounded p-1 text-sm"
                  >
                    <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5">
                      <div className="flex items-center gap-0.5">
                        <span className="text-text-muted text-xs">Forma:</span>
                        <span className="font-medium text-text-primary truncate text-sm">{lemma.Forma}</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                        <span className="font-medium text-text-primary truncate text-sm">{lemma.CollGeografica}</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <Calendar className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                        <span className="text-text-primary text-sm">{lemma.Datazione || 'N/D'}</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {lemma.Frequenza ? (
                          <>
                            <Hash className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                            <span className="text-text-primary text-sm">freq.: {lemma.Frequenza}</span>
                          </>
                        ) : (
                          <span className="text-text-muted text-sm">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
};
