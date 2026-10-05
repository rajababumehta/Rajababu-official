import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  Sparkles,
  Lightbulb,
  Code,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface HeaderProps {
  language: Language;
  profile: ProfileSettings;
  totalMoments?: number;
  totalLikes?: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  profile,
}) => {
  const heroImageSrc =
    profile.heroImage ||
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhi7Uh94xTz0y-F0J_tapw44abY8zaSaDjrnGVWMyV-Odly0GMfSYtxK8FVOnFsFi0Nw_IveBY14ECZbwVtn2ab2u2OvbFFjr65hVXXuQKDmFh-U3RzfY1nOfUUF5d11Rjx6cWLUBamvlr4FrpncgobVp_itVNzzeXUKiFeD1UppSfItN2dxNhMq9Tu_JUO/s1372/20602.jpg';

  const rolesEn = [
    'AI Website Developer',
    'AI Explainer',
    'Student',
    'Modern Web Creator',
  ];

  const rolesNe = [
    'एआई वेबसाइट डेभलपर',
    'एआई व्याख्याकर्ता',
    'विद्यार्थी',
    'आधुनिक वेब सिर्जनाकर्ता',
  ];

  const roles = language === 'NE' ? rolesNe : rolesEn;
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  // Parallax scroll for hero background image
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 800], [0, 160]);
  const opacityParallax = useTransform(scrollY, [0, 600], [1, 0.45]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [roles.length]);

  return (
    <header
      id="home"
      className="relative min-h-[105vh] sm:min-h-[100vh] flex flex-col justify-end overflow-hidden bg-slate-950 pt-[380px] sm:pt-[480px] lg:pt-[540px] pb-10 sm:pb-16"
    >
      {/* 1. HERO BACKGROUND COVER IMAGE WITH PARALLAX DEPTH */}
      <motion.div
        style={{ y: yParallax, opacity: opacityParallax }}
        className="absolute inset-0 w-full h-full pointer-events-none will-change-transform"
      >
        <img
          src={heroImageSrc}
          alt="Rajababu Mehta – Official Website, AI Website Developer & AI Explainer from Birgunj, Nepal"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top filter brightness-95 contrast-105"
        />
      </motion.div>

      {/* 2. DUAL-LAYER GRADIENTS OVERLAY & BACKDROP LIGHTING */}
      {/* Top-to-bottom subtle gradient: seamless transition with navbar, crystal clear center */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent via-45% to-slate-950 pointer-events-none" />

      {/* Bottom-to-top deep dark gradient: ensures ultra high contrast for typography and badges */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent pointer-events-none" />

      {/* Subtle ambient glow orbs behind bottom hero text */}
      <div className="absolute bottom-24 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-1/4 translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 3. HERO FOREGROUND CONTAINER (Deeply anchored at bottom, never blocks face) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-auto">
        <div className="max-w-4xl">
          {/* Level 01 Game-Style Stage Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-400 font-mono text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3 shadow-sm shadow-blue-500/10 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
            <span>{language === 'NE' ? 'स्तर ०१ // प्रारम्भ तथा लक्ष्य' : 'LEVEL 01 // ORIGIN & VISION'}</span>
          </motion.div>

          {/* Name Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl font-heading tracking-tight leading-[1.08] mb-3"
          >
            {profile.name || 'Rajababu Mehta'}
          </motion.h1>

          {/* Dynamic Rotating Subtitle */}
          <div className="h-9 sm:h-10 flex items-center mb-5 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRoleIndex + (language === 'NE' ? '-ne' : '-en')}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="font-heading font-semibold text-base sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300"
              >
                {roles[currentRoleIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3 Tagline Badges (AI Web Developer, AI Explainer, Student) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800/90 shadow-sm text-xs font-semibold text-blue-300">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'NE' ? 'एआई वेबसाइट डेभलपर' : 'AI Website Developer'}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800/90 shadow-sm text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'NE' ? 'एआई व्याख्याकर्ता' : 'AI Explainer'}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800/90 shadow-sm text-xs font-semibold text-amber-300">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'NE' ? 'विद्यार्थी' : 'Student'}</span>
            </div>
          </motion.div>

          {/* Bio / Mission Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-sm sm:text-base lg:text-lg text-slate-300/95 max-w-2xl leading-relaxed mb-6 drop-shadow-md"
          >
            {language === 'NE' ? profile.taglineNe : profile.taglineEn}
          </motion.p>

          {/* Quick CTA Action Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="#about"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>{language === 'NE' ? 'अन्वेषण सुरु गर्नुहोस्' : 'Explore Digital World'}</span>
              <ChevronDown className="w-4 h-4" />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>{language === 'NE' ? 'सम्पर्क गर्नुहोस्' : 'Connect Directly'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Down Scroll Indicator */}
      <div className="relative z-10 flex justify-center mt-6">
        <a
          href="#about"
          className="p-2 rounded-full text-slate-400 hover:text-slate-200 transition-colors animate-bounce"
          aria-label="Scroll down to About Section"
        >
          <ChevronDown className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
};

