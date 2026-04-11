'use client';

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '@/context/AppContext';
import { useHighlight } from '@/context/HighlightContext';
import { Header } from '@/components/Header';
import { MetricsSummary } from '@/components/MetricsSummary';
import { CompactToolbar } from '@/components/CompactToolbar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AlphabeticalIndex } from '@/components/AlphabeticalIndex';
import { TimelineEnhanced } from '@/components/TimelineEnhanced';
import { LemmaDetail } from '@/components/LemmaDetail';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// Importa la mappa dinamicamente per evitare problemi SSR
const GeographicalMap = dynamic(
  () => import('@/components/GeographicalMap').then(mod => ({ default: mod.GeographicalMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] sm:h-[580px] w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Caricamento mappa...</p>
      </div>
    )
  }
);

export default function Home() {
  const { isLoading, error } = useApp();
  const [isIndiceOpen, setIsIndiceOpen] = React.useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Errore</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ricarica la pagina
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MetricsSummary />
      <div>
        <CompactToolbar onToggleIndice={() => setIsIndiceOpen(!isIndiceOpen)} />
      </div>

      <main className="w-full px-2 sm:px-lg py-2 flex-1">
        {/* Layout principale con LayoutGroup per animazioni responsive */}
        <LayoutGroup>
          {/* Layout principale: Mappa 80% + Dettaglio Forme 20% - Full Width */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-2 w-full">
            {/* Mappa - 4 colonne (80%) */}
            <motion.div layout className="xl:col-span-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-250 hover:shadow-md">
                <GeographicalMap />
              </div>
            </motion.div>

            {/* Dettaglio Forme - 1 colonna (20%) */}
            <motion.div layout className="xl:col-span-1">
              <LemmaDetail />
            </motion.div>
          </div>

          {/* Linea del tempo unificata - Full Width */}
          <motion.div layout className="mt-1 w-full">
            <TimelineEnhanced />
          </motion.div>
        </LayoutGroup>
      </main>

      {/* Indice alfabetico - Modal/Drawer con animazioni usando Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {isIndiceOpen && (
            <>
              {/* Backdrop con blur animato */}
              <motion.div
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/50"
                onClick={() => setIsIndiceOpen(false)}
              >
                {/* Modal content con scale + slide animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="bg-white rounded-t-2xl sm:rounded-lg shadow-card-hover max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto sm:m-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AlphabeticalIndex onClose={() => setIsIndiceOpen(false)} />
                  <div className="sticky bottom-0 bg-white border-t border-border p-3 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsIndiceOpen(false)}
                      className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-hover transition-fast text-sm font-medium"
                    >
                      Chiudi
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <footer className="bg-white border-t border-border px-2 sm:px-lg py-4">
        <div className="max-w-container mx-auto space-y-4">
          {/* Loghi */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            <img
              src="/data/logo/LogoUniversitàDiSalerno.jpg"
              alt="Università degli Studi di Salerno"
              className="h-10 sm:h-16 w-auto object-contain"
            />
            <img
              src="/data/logo/unistrasi.jpg"
              alt="Università per Stranieri di Siena"
              className="h-10 sm:h-16 w-auto object-contain"
            />
            <img
              src="/data/logo/Federico_II_University_Logo.png"
              alt="Università di Napoli Federico II"
              className="h-10 sm:h-16 w-auto object-contain"
            />
            <img
              src="/data/logo/DH_logo+type1@256px_[RGB_black].png"
              alt="Digital Humanities Cagliari"
              className="h-10 sm:h-16 w-auto object-contain"
            />
            <img
              src="/data/logo/Logo_lungo_RGB_d0.png"
              alt="Università degli studi di Cagliari"
              className="h-10 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* Testo */}
          <div className="text-center text-[10px] text-text-secondary space-y-1">
            <p className="font-medium">Elaborato sui dati estrapolati dal "Vocabolario storico della lingua italiana della gastronomia (VoSLIG). Responsabili Atlante e VoSLIG: Giovanni Urraci e Monica Alba - Partner informatici: DH Unica, diretto da: prof. Giampaolo Salice, Università di Cagliari</p>
            <p>© 2025 AtLiTeG - Atlante della Lingua e dei Testi della Cultura Gastronomica</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
