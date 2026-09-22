import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Lightbulb,
  Code,
  ChevronDown,
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
    'https://i.ibb.co/8LJDF00Z/IMG-1780197697082.jpg';

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
      className="relative min-h-[105vh] sm:min-h-[100vh] flex flex-col justify-end overflow-hidden bg-slate-950 pt-[320px] sm:pt-[440px] lg:pt-[500px] pb-10 sm:pb-16"
    >
      {/* 1. HERO BACKGROUND COVER IMAGE (Head elevated directly to the top below navbar, full face & body in focus) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroImageSrc}
          onError={(e) => {
            if (e.currentTarget.src !== window.location.origin + '/hero-image.jpg') {
              e.currentTarget.src = '/hero-image.jpg';
            }
          }}
          alt="Rajababu Mehta - Website Developer, Student, and AI Explainer from Birgunj Nepal"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[center_48%] sm:object-[center_46%] md:object-[center_44%] scale-[1.46] sm:scale-[1.25] md:scale-[1.15] -translate-y-36 sm:-translate-y-24 md:-translate-y-14 filter brightness-95 contrast-105"
        />
      </div>

      {/* 2. DUAL-LAYER GRADIENTS OVERLAY & BACKDROP LIGHTING */}
      {/* Top subtle gradient for seamless navbar blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent via-18% to-transparent pointer-events-none" />

      {/* Bottom dark gradient: anchored very low (via-20%) so face and entire upper torso stay totally clear */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 via-20% to-transparent pointer-events-none" />

      {/* Subtle ambient glow orbs behind bottom hero text */}
      <div className="absolute bottom-24 left-1/4 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-1/4 translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 3. HERO FOREGROUND CONTAINER (Deeply anchored at bottom, never blocks face) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-auto">
        <div className="max-w-4xl">
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
            className="text-sm sm:text-base lg:text-lg text-slate-300/95 max-w-2xl leading-relaxed mb-4 drop-shadow-md"
          >
            {language === 'NE' ? profile.taglineNe : profile.taglineEn}
          </motion.p>
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
