import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Compass,
  Trophy,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUp,
} from 'lucide-react';
import { Language } from '../types';
import { useSmoothScroll } from './SmoothScrollProvider';

interface GameHUDProps {
  language: Language;
  currentView: 'home' | 'posts';
  onNavigate?: (view: 'home' | 'posts', targetHash?: string) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  language,
  currentView,
  onNavigate,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [showLevelMap, setShowLevelMap] = useState(false);
  const [achievementUnlocked, setAchievementUnlocked] = useState(false);
  const { scrollTo } = useSmoothScroll();

  // Levels metadata
  const levels = useMemo(
    () => [
      { id: 1, hash: '#home', code: 'LVL 01', titleEn: 'Origin & Vision', titleNe: 'प्रारम्भ तथा लक्ष्य' },
      { id: 2, hash: '#about', code: 'LVL 02', titleEn: 'Biography & Story', titleNe: 'परिचय तथा यात्रा' },
      { id: 3, hash: '#skills', code: 'LVL 03', titleEn: 'Technical Arsenal', titleNe: 'प्राविधिक सीपहरू' },
      { id: 4, hash: '#services', code: 'LVL 04', titleEn: 'Deliverables & Quality', titleNe: 'सेवा तथा गुणस्तर' },
      { id: 5, hash: '#faq', code: 'LVL 05', titleEn: 'Architecture & FAQ', titleNe: 'वास्तुकला र प्रश्नोत्तर' },
      { id: 6, hash: '#contact', code: 'LVL 06', titleEn: 'Terminal Comms', titleNe: 'प्रत्यक्ष सम्पर्क' },
    ],
    []
  );

  // Monitor Scroll Progress & Current Section Level
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const currentScroll = window.scrollY;
          const progress = totalHeight > 0 ? Math.min(Math.round((currentScroll / totalHeight) * 100), 100) : 0;
          setScrollProgress(progress);

          // 100% Exploration Easter Egg Check
          if (progress >= 98) {
            const hasCelebrated = sessionStorage.getItem('rm_explored_100');
            if (!hasCelebrated) {
              sessionStorage.setItem('rm_explored_100', 'true');
              setAchievementUnlocked(true);
              try {
                confetti({
                  particleCount: 50,
                  spread: 70,
                  origin: { y: 0.85 },
                  colors: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
                });
              } catch {}
            }
          }

          // Detect active section level when in home view
          if (currentView === 'home') {
            const sections = ['#contact', '#faq', '#services', '#skills', '#about', '#home'];
            for (const id of sections) {
              const el = document.querySelector(id);
              if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= window.innerHeight * 0.45) {
                  const match = levels.find((l) => l.hash === id);
                  if (match) {
                    setActiveLevel(match.id);
                  }
                  break;
                }
              }
            }
          } else {
            setActiveLevel(7);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [currentView, levels]);

  const currentLevelInfo = useMemo(() => {
    if (currentView === 'posts') {
      return {
        code: 'DISPATCH',
        titleEn: 'Editorial & News Desk',
        titleNe: 'समाचार तथा विचार डेस्क',
      };
    }
    return levels.find((l) => l.id === activeLevel) || levels[0];
  }, [currentView, activeLevel, levels]);

  const handleJumpToLevel = (hash: string) => {
    setShowLevelMap(false);
    if (currentView === 'posts') {
      onNavigate?.('home', hash);
    } else {
      scrollTo(hash, { offset: -70, duration: 1.4 });
    }
  };

  const handleScrollToTop = () => {
    scrollTo(0, { duration: 1.5 });
  };

  return (
    <>
      {/* 1. Top Edge Subtle Cyber Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[60] pointer-events-none bg-slate-950/40">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Floating Futuristic HUD Pill (Bottom Left on Desktop, unobtrusive on Mobile) */}
      <div className="fixed bottom-4 left-4 z-40 select-none">
        <div className="flex items-center gap-2">
          {/* Main Level & Progress Capsule */}
          <button
            type="button"
            onClick={() => setShowLevelMap(!showLevelMap)}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 hover:border-blue-500/50 text-slate-300 hover:text-white shadow-xl shadow-blue-950/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer group"
            title="Open Digital World Map"
          >
            <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-xs text-blue-400 font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>{currentLevelInfo.code}</span>
            </div>

            <span className="h-3 w-[1px] bg-slate-800" />

            <span className="text-[11px] sm:text-xs font-semibold text-slate-200 max-w-[110px] sm:max-w-[150px] truncate">
              {language === 'NE' ? currentLevelInfo.titleNe : currentLevelInfo.titleEn}
            </span>

            <span className="h-3 w-[1px] bg-slate-800" />

            <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs text-slate-400">
              <Compass className="w-3 h-3 text-indigo-400 group-hover:rotate-45 transition-transform" />
              <span>{scrollProgress}%</span>
            </div>
          </button>

          {/* Quick Scroll To Top Arrow when scrolled down */}
          {scrollProgress > 25 && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleScrollToTop}
              className="p-2 sm:p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-blue-400 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Return to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>

        {/* Level Map Drawer */}
        <AnimatePresence>
          {showLevelMap && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-12 left-0 w-72 sm:w-80 rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-4 text-xs z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-200 font-bold font-mono">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>{language === 'NE' ? 'डिजिटल संसार नक्सा' : 'WORLD STAGES'}</span>
                </div>
                <button
                  onClick={() => setShowLevelMap(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {levels.map((lvl) => {
                  const isCurrent = currentView === 'home' && activeLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => handleJumpToLevel(lvl.hash)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300'
                          : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[10px] font-bold text-blue-400">{lvl.code}</span>
                        <span className="font-semibold text-slate-200">
                          {language === 'NE' ? lvl.titleNe : lvl.titleEn}
                        </span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{language === 'NE' ? 'अन्वेषण प्रगति' : 'Exploration'}</span>
                <span className="font-mono font-bold text-blue-400">{scrollProgress}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Easter Egg: 100% Exploration Achievement Toast */}
      <AnimatePresence>
        {achievementUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-sm rounded-3xl bg-slate-900/95 backdrop-blur-2xl border-2 border-amber-500/40 p-4 sm:p-5 shadow-2xl shadow-amber-500/20 text-slate-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    ACHIEVEMENT UNLOCKED
                  </span>
                  <button
                    onClick={() => setAchievementUnlocked(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-heading font-bold text-sm text-white mt-0.5">
                  {language === 'NE' ? 'डिजिटल संसार १००% अन्वेषण गरियो!' : '100% World Explored!'}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {language === 'NE'
                    ? 'बधाई छ! तपाईंले राजाबाबु मेहताको सम्पूर्ण प्राविधिक संसार अवलोकन गर्नुभयो।'
                    : "Congratulations! You've unlocked and explored every sector of Rajababu Mehta's digital universe."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
