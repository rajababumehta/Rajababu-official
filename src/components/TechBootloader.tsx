import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal } from 'lucide-react';
import { Language } from '../types';

interface TechBootloaderProps {
  language: Language;
  onFinish?: () => void;
}

export const TechBootloader: React.FC<TechBootloaderProps> = ({ language, onFinish }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Only show once per session, or if prefers-reduced-motion is true, skip immediately
    const hasBooted = sessionStorage.getItem('rm_booted_session');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasBooted || prefersReducedMotion) {
      onFinish?.();
      return;
    }

    setIsVisible(true);

    const startTime = performance.now();
    const duration = 750; // Ultra fast 750ms boot

    const timer = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const p = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(p);

      if (p >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('rm_booted_session', 'true');
          onFinish?.();
        }, 180);
      }
    }, 24);

    return () => clearInterval(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setIsVisible(false);
    sessionStorage.setItem('rm_booted_session', 'true');
    onFinish?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleSkip}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 cursor-pointer select-none"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute w-72 h-72 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

          {/* Center Tech Monogram */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="relative flex flex-col items-center gap-4 text-center max-w-sm"
          >
            {/* Glowing Brand Mark */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-2xl shadow-blue-500/30">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
                <span className="font-heading font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                  RM
                </span>
              </div>
            </div>

            <div>
              <div className="font-heading font-extrabold text-base tracking-tight text-white flex items-center justify-center gap-1.5">
                <span>Rajababu Mehta</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                  v2.6
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 tracking-wider uppercase mt-1 flex items-center justify-center gap-1">
                <Terminal className="w-3 h-3 text-blue-400" />
                <span>
                  {language === 'NE' ? 'डिजिटल संसार लोड हुँदैछ...' : 'INITIALIZING DIGITAL WORLD'}
                </span>
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-48 sm:w-56 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 shadow-sm shadow-blue-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-48 sm:w-56 text-[10px] font-mono text-slate-500">
              <span>ONLINE</span>
              <span>{progress}%</span>
            </div>

            <div className="text-[10px] text-slate-600 font-mono mt-1">
              [ Tap anywhere to enter ]
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
