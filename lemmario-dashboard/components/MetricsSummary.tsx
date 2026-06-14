'use client';

import { useApp } from '@/context/AppContext';
import { MapPin, FileText, Calendar, Hash, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { motionConfig } from '@/lib/motion-config';

export function MetricsSummary() {
  const { metrics } = useApp();

  const metricsArray = [
    { icon: FileText, label: 'Lemmi', value: metrics.totalLemmi, color: 'text-accent', delay: 0 },
    { icon: Layers, label: 'Forme', value: metrics.totalForme, color: 'text-primary', delay: 0.05 },
    { icon: Hash, label: 'Occorrenze', value: metrics.totalOccorrenze, color: 'text-accent-hover', delay: 0.1 },
    { icon: Calendar, label: 'Anni', value: metrics.totalAnni, color: 'text-primary-hover', delay: 0.15 },
    { icon: MapPin, label: 'Località', value: metrics.totalLocalita, color: 'text-primary', delay: 0.2 },
  ];

  return (
    <div className="bg-white border-b border-border" data-testid="metrics-summary">
      <div className="max-w-container mx-auto px-2 sm:px-lg py-1.5">
        <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-between gap-x-2 gap-y-1 sm:gap-4 flex-wrap">
          {metricsArray.map(({ icon: Icon, label, value, color, delay }) => (
            <motion.div
              key={label}
              data-testid={`metric-${label.toLowerCase()}`}
              className="flex items-center gap-1 sm:gap-1.5 cursor-default"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...motionConfig.transitions.medium, delay }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
              </motion.div>
              <span className="text-xs sm:text-sm text-text-secondary">{label}:</span>
              <motion.span
                className="text-sm sm:text-lg font-semibold text-text-primary"
                key={value}
                initial={{ scale: 1.2, color: '#0B5FA5' }}
                animate={{ scale: 1, color: '#1F2937' }}
                transition={motionConfig.spring.fast}
              >
                {value}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
