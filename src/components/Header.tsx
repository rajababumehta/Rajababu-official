import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Layers,
  Heart,
  Award,
  Lightbulb,
  Code,
  ChevronDown,
} from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface HeaderProps {
  language: Language;
  profile: ProfileSettings;
  totalMoments: number;
  totalLikes: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  profile,
  totalMoments,
  totalLikes,
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
      {/* 1. HERO BACKGROUND COVER IMAGE (Full-viewport, uncropped top face anchoring) */}
      <img
        src={heroImageSrc}
        alt="Rajababu Mehta - Website Developer, Student, and AI Explainer from Birgunj Nepal"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-top filter brightness-95 contrast-105 pointer-events-none"
      />

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
          
          {/* Welcome Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg text-xs sm:text-sm font-medium text-blue-300 mb-4 sm:mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>
              {language === 'NE'
                ? profile.welcomeBadgeNe || 'वेबसाइट बनाउन मलाई सम्पर्क गर्नुहोस्'
                : profile.welcomeBadgeEn || 'Available for Custom Website Projects'}
            </span>
          </motion.div>

          {/* Name Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
            className="text-sm sm:text-base lg:text-lg text-slate-300/95 max-w-2xl leading-relaxed mb-8 drop-shadow-md"
          >
            {language === 'NE' ? profile.taglineNe : profile.taglineEn}
          </motion.p>

          {/* Floating Snapshot Counter Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span>
                <strong className="text-slate-200 font-mono font-bold">{totalMoments}</strong>{' '}
                {language === 'NE' ? 'ग्यालरी तस्बिर' : 'Moments'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                <Heart className="w-3.5 h-3.5 fill-pink-500/40 text-pink-400" />
              </div>
              <span>
                <strong className="text-slate-200 font-mono font-bold">
                  {totalLikes >= 1000 ? `${(totalLikes / 1000).toFixed(1)}k` : totalLikes}
                </strong>{' '}
                {language === 'NE' ? 'प्रतिक्रिया' : 'Likes'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span>{language === 'NE' ? 'वेबसाइट परियोजनाका लागि उपलब्ध' : 'Available for Website Projects'}</span>
            </div>
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
