import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  Code,
  Layers,
  Cpu,
  Globe,
  Terminal,
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
  const heroImageSrc = profile.heroImage || '/hero-portrait.png';

  const rolesEn = [
    'Founder & CEO of AI Clipzone',
    'AI Website Developer',
    'AI Explainer & Creator',
    'Student in Birgunj, Nepal',
  ];

  const rolesNe = [
    'एआई क्लिपजोनका संस्थापक तथा सीईओ',
    'एआई वेबसाइट डेभलपर',
    'एआई व्याख्याकर्ता तथा सर्जक',
    'वीरगञ्ज, नेपालका विद्यार्थी',
  ];

  const roles = language === 'NE' ? rolesNe : rolesEn;
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [roles.length]);

  const techItems = [
    {
      name: 'Google Gemini AI',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z"
            fill="url(#tech_gemini_grad)"
          />
          <defs>
            <linearGradient id="tech_gemini_grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4E82EE" />
              <stop offset="0.5" stopColor="#9B72CB" />
              <stop offset="1" stopColor="#D96570" />
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: 'React',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="-11.5 -10.23174 23 20.46348" fill="none" aria-hidden="true">
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
          <g stroke="#61DAFB" strokeWidth="1" fill="none">
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      ),
    },
    {
      name: 'Next.js',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 180 180" fill="none" aria-hidden="true">
          <circle cx="90" cy="90" r="90" fill="#000000" stroke="rgba(255,255,255,0.25)" strokeWidth="4"/>
          <path d="M149.5 157.4L69.1 54H54v72h12.1V69.4l73.9 95.4c3.3-2.2 6.5-4.7 9.5-7.4z" fill="url(#tech_next_grad)"/>
          <rect x="115" y="54" width="12" height="72" fill="url(#tech_next_grad_2)"/>
          <defs>
            <linearGradient id="tech_next_grad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff"/>
              <stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="tech_next_grad_2" x1="121" y1="54" x2="120.7" y2="102" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff"/>
              <stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: 'TypeScript',
      logo: (
        <svg className="w-5 h-5 shrink-0 rounded-sm" viewBox="0 0 128 128" aria-hidden="true">
          <rect width="128" height="128" rx="16" fill="#3178C6"/>
          <path d="M60.1 76.5c-1.3 2.1-3.1 3.8-5.3 5-2.2 1.2-4.9 1.8-8 1.8-3.4 0-6.4-.8-8.8-2.4-2.4-1.6-4.2-3.8-5.2-6.6-1.1-2.8-1.5-6.2-1.2-10.2h12.1c0 2.8.5 4.9 1.4 6.2.9 1.3 2.3 1.9 4.2 1.9 1.3 0 2.3-.3 3.1-.9.8-.6 1.1-1.4 1.1-2.4 0-.8-.3-1.6-.9-2.3-.6-.7-1.6-1.4-3.1-2.1l-6.1-2.9c-3.7-1.8-6.4-3.8-8.1-6.1-1.7-2.3-2.6-5.1-2.6-8.4 0-3.3.9-6.1 2.8-8.4 1.9-2.3 4.5-4 7.8-5.1 3.3-1.1 7-1.6 11.1-1.6 4.7 0 8.7.8 12 2.5 3.3 1.7 5.7 4 7.2 7 1.5 3 2.1 6.5 1.7 10.7H67.2c-.1-2.6-.7-4.5-1.9-5.7-1.2-1.2-2.9-1.8-5.1-1.8-1.3 0-2.4.3-3.2.9-.8.6-1.2 1.4-1.2 2.3 0 .8.3 1.5.8 2.1.5.6 1.4 1.2 2.7 1.8l6.7 3.2c3.7 1.8 6.4 3.9 8.1 6.3 1.7 2.4 2.5 5.3 2.5 8.7 0 3.7-1 6.9-3 9.4-1.7 2.5-4.2 4.3-7.5 5.4zm47-38.9H89.9v-9.7h45.2v9.7H118v48.6h-10.9V37.6z" fill="#FFFFFF"/>
        </svg>
      ),
    },
    {
      name: 'Tailwind CSS',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 54 33" fill="none" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" fill="#38BDF8"/>
        </svg>
      ),
    },
    {
      name: 'Vercel',
      logo: (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 116 100" fill="#FFFFFF" aria-hidden="true">
          <path d="M57.5 0L115 100H0L57.5 0z" />
        </svg>
      ),
    },
    {
      name: 'Node.js',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 2.5L3.8 9.5V23.5L16 30.5L28.2 23.5V9.5L16 2.5Z" fill="#339933"/>
          <path d="M16 4.9L26 10.7V22.3L16 28.1L6 22.3V10.7L16 4.9Z" fill="#5FA04E"/>
          <path d="M16 14.2V25.2M16 14.2L24.5 9.3M16 14.2L7.5 9.3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      name: 'OpenAI',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#10A37F" aria-hidden="true">
          <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.5-2.9 6.06 6.06 0 0 0-10.28 2.17 5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 5.98 5.98 0 0 0 4.52 2.1 6.05 6.05 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.05 6.05 0 0 0-.75-7.06zm-9.02 12.6a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76c.24-.14.39-.4.39-.68v-6.74l2.02 1.17c.03.02.04.04.04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.12a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76c.24.14.54.14.78 0l5.84-3.37v2.33c0 .03-.01.05-.03.06l-4.84 2.8a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.48 4.48 0 0 1 2.37-1.97v5.67c0 .28.15.54.39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.9zm16.1 3.85l-5.84-3.37 2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.5 4.5 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.4-.68zm2.01-3.02l-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L8.91 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66v.01zM11.9 13.3l-2.6-1.5 2.6-1.5 2.6 1.5-2.6 1.5z"/>
        </svg>
      ),
    },
    {
      name: 'Python',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 110 110" aria-hidden="true">
          <path d="M54.5 3C29.8 3 31.4 13.7 31.4 13.7l.1 11.1h23.5v3.4H21.5S3 26.1 3 50.8s16.2 23.8 16.2 23.8h9.6v-13.4s-.5-16.2 15.9-16.2h27.3s15.3.3 15.3-15.1-.1-23.7-.1-23.7S88.9 3 54.5 3zm-13.6 7.4c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z" fill="#387EB8"/>
          <path d="M55.5 107c24.7 0 23.1-10.7 23.1-10.7l-.1-11.1H55v-3.4h33.5s18.5 2.1 18.5-22.6-16.2-23.8-16.2-23.8h-9.6v13.4s.5 16.2-15.9 16.2H48s-15.3-.3-15.3 15.1.1 23.7.1 23.7S21.1 107 55.5 107zm13.6-7.4c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z" fill="#FFE052"/>
        </svg>
      ),
    },
    {
      name: 'Vite',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M29.5 5.5L16.8 28.2c-.4.7-1.4.7-1.8 0L2.5 5.5c-.4-.7.1-1.6.9-1.6h25.2c.8 0 1.3.9.9 1.6z" fill="url(#tech_vite_grad)"/>
          <path d="M19.8 2.2L10.2 16.5h5.5L13.1 27.8l11.2-15.5h-5.8l1.3-10.1z" fill="#FFC920"/>
          <defs>
            <linearGradient id="tech_vite_grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#41D1FF"/>
              <stop offset="1" stopColor="#BD34FE"/>
            </linearGradient>
          </defs>
        </svg>
      ),
    },
    {
      name: 'GitHub',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      ),
    },
    {
      name: 'Firebase',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4.5 17.5L8.2 3.8a.7.7 0 011.3-.1l2.5 5.2L4.5 17.5z" fill="#FFA000"/>
          <path d="M4.5 17.5l8.7-8.6 3.8 7.3-12.5 1.3z" fill="#F57C00"/>
          <path d="M15.4 3.9a.7.7 0 011.3.3l2.8 13.3-15-10.2 2.5-4.8a.7.7 0 011.2-.1l2.2 4.1 5-2.6z" fill="#FFCA28"/>
        </svg>
      ),
    },
    {
      name: 'Cloudflare',
      logo: (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#F38020" aria-hidden="true">
          <path d="M19.4 12.8c-.2-2.3-2.1-4.1-4.5-4.1-1.7 0-3.1.9-3.9 2.2-.4-.2-.9-.3-1.5-.3-1.8 0-3.3 1.4-3.5 3.2C4.4 14.2 3 15.6 3 17.4c0 1.9 1.6 3.5 3.5 3.5h12.8c2 0 3.7-1.6 3.7-3.6 0-1.8-1.4-3.4-3.2-3.6l-.4-.1v-.8z"/>
        </svg>
      ),
    },
    {
      name: 'AI Clipzone',
      logo: (
        <img
          src="/assets/aistudio/logo_3c930995.png"
          alt="AI Clipzone"
          className="w-5 h-5 shrink-0 rounded-full object-cover border border-white/20"
        />
      ),
    },
    {
      name: 'JavaScript',
      logo: (
        <svg className="w-5 h-5 shrink-0 rounded-sm" viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="3" fill="#F7DF1E"/>
          <path d="M6.8 18.2c.4.7 1.1 1.2 2.1 1.2 1.2 0 2-.6 2-2V11H9.2v6.4c0 .5-.2.7-.6.7-.3 0-.6-.2-.8-.6l-1 1.1zm7.4.2c.8.5 1.9.9 3 .9 1.9 0 3-1 3-2.5 0-1.4-.8-2.1-2.2-2.7l-.8-.3c-.9-.4-1.3-.7-1.3-1.3 0-.6.5-1.1 1.4-1.1.8 0 1.5.3 2 .8l1-1.1c-.8-.7-1.8-1-3-1-1.9 0-3.1 1.1-3.1 2.5 0 1.3.8 2 2.1 2.6l.8.3c.9.4 1.4.8 1.4 1.4 0 .7-.6 1.2-1.6 1.2-.9 0-1.8-.4-2.4-1.1l-1.1 1.1z" fill="#000000"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ================= HERO SECTION (matching dhruvrathee.com #hero) ================= */}
      <section
        id="home"
        className="relative pt-[130px] sm:pt-[150px] lg:pt-[170px] pb-16 sm:pb-24 overflow-hidden bg-[#0a0b0e]"
      >
        {/* Ambient Warm Shafts & Glow (matching dhruvrathee.com ambient lighting) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-[#e4342f]/10 via-[#ff6a4d]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-[380px] h-[380px] bg-[#e4342f]/8 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: Hero Copy & Headlines */}
            <div className="lg:col-span-7 flex flex-col">
              
              {/* Context Tag matching dhruvrathee.com */}
              <div className="flex items-center gap-2 mb-4 text-xs font-bold tracking-widest uppercase text-[#f6f3f2]/50">
                <span className="w-2 h-2 rounded-full bg-[#e4342f] animate-pulse" />
                <span>{language === 'NE' ? 'वीरगञ्ज, नेपालबाट प्रत्यक्ष' : 'Official Portfolio · Birgunj, Nepal'}</span>
              </div>

              {/* Main Headline H1 with Instrument Serif styling */}
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-[-0.04em] leading-[1.12] text-[#f6f3f2] mb-5">
                <span>{profile.name || 'Rajababu Mehta'}</span>
                <span className="block mt-1 sm:mt-2 text-3xl sm:text-4xl lg:text-[54px] font-normal">
                  <i className="font-serif italic text-[#e4342f]">
                    {language === 'NE' ? 'एआई वेबसाइट' : 'Websites'}
                  </i>{' '}
                  <span className="font-sans font-extrabold">
                    {language === 'NE' ? 'डेभलपर तथा व्याख्याकर्ता' : 'that inspire.'}
                  </span>
                </span>
              </h1>

              {/* Dynamic Rotating Roles Ticker */}
              <div className="h-8 flex items-center mb-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentRoleIndex + (language === 'NE' ? '-ne' : '-en')}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="text-sm sm:text-base font-semibold text-[#ff8175] flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff8175]" />
                    <span>{roles[currentRoleIndex]}</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Tagline / Subtitle */}
              <p className="text-sm sm:text-base lg:text-[17px] text-[#f6f3f2]/75 leading-relaxed max-w-xl mb-8">
                {language === 'NE' ? profile.taglineNe : profile.taglineEn}
              </p>

              {/* Hero CTA Buttons matching dhruvrathee.com (.hero-cta) */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <a
                  href="#contact"
                  className="px-6 py-3.5 rounded-xl bg-[#e4342f] hover:bg-[#ff3d38] text-white font-bold text-sm tracking-tight shadow-[0_10px_28px_-6px_rgba(228,52,47,0.8)] transition-all hover:scale-[1.02] flex items-center gap-2"
                >
                  <span>{language === 'NE' ? '⚡ मसँग सहकार्य गर्नुहोस्' : '⚡ Work With Me'}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#services"
                  className="px-6 py-3.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,240,238,0.12)] text-[#f6f3f2] font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <span>{language === 'NE' ? 'सेवाहरू हेर्नुहोस् →' : 'See Deliverables →'}</span>
                </a>
              </div>

              {/* Topics / Ticker Bar matching dhruvrathee.com (.topics) */}
              <div className="pt-6 border-t border-[rgba(255,240,238,0.08)] flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-[13px] text-[#f6f3f2]/55">
                <span className="w-2 h-2 rounded-full bg-[#ff6a4d] animate-pulse shrink-0" />
                <span className="font-bold text-[#f6f3f2]">{language === 'NE' ? 'मुख्य क्षेत्रहरू:' : 'Focus & Expertise:'}</span>
                <span className="text-[#f6f3f2]/80">AI Websites</span>
                <span className="text-[#f6f3f2]/30">·</span>
                <span className="text-[#f6f3f2]/80">Full-Stack Development</span>
                <span className="text-[#f6f3f2]/30">·</span>
                <span className="text-[#f6f3f2]/80">AI Explanations</span>
                <span className="text-[#f6f3f2]/30">·</span>
                <span className="text-[#f6f3f2]/80">Birgunj, Nepal</span>
              </div>

            </div>

            {/* RIGHT COLUMN: The Centerpiece Portrait matching dhruvrathee.com */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square">
                
                {/* Conic Halo Glow behind photo */}
                <div className="absolute -inset-[12%] rounded-full z-0 bg-[conic-gradient(from_0deg,rgba(228,52,47,0.38),rgba(255,106,77,0.28)_32%,rgba(255,176,142,0.22)_58%,transparent_76%,rgba(228,52,47,0.38))] blur-[34px] animate-halo pointer-events-none" />

                {/* Orbit Ring */}
                <div className="absolute -inset-[3%] rounded-full z-1 border border-dashed border-[#e4342f]/30 animate-orbit pointer-events-none" />

                {/* Portrait Frame (.pf) */}
                <div className="relative z-10 w-full h-full rounded-[28px] overflow-hidden border border-[rgba(255,240,238,0.18)] bg-[#101216] shadow-[0_44px_90px_-34px_rgba(0,0,0,0.95)] group">
                  <img
                    src={heroImageSrc}
                    alt={`${profile.name || 'Rajababu Mehta'} – AI Website Developer & AI Explainer`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter contrast-[1.05] brightness-[0.98] transition-transform duration-700 group-hover:scale-105"
                    style={{ objectPosition: '50% 18%' }}
                  />

                  {/* Warm Duotone Overlay */}
                  <div className="absolute inset-0 pointer-events-none mix-blend-soft-light bg-gradient-to-tr from-[#e4342f]/35 via-transparent to-[#ff6a4d]/25" />

                  {/* Subtle Light Sweep on Hover */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                  {/* Bottom Vignette for Caption Visibility */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0a0b0e]/85 via-[#0a0b0e]/20 to-transparent" />

                  {/* Corner Viewfinder Brackets (.bracket.tl and .bracket.br) */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#e4342f] rounded-tl pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#ff6a4d] rounded-br pointer-events-none" />
                </div>

                {/* Floating Caption Chip matching dhruvrathee.com (.p-chip) */}
                <div className="absolute -bottom-4 -left-3 sm:-left-6 z-20 bg-[#0d0e12]/92 backdrop-blur-xl border border-[rgba(255,240,238,0.15)] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_24px_50px_-15px_rgba(0,0,0,0.95)] animate-bob">
                  <div className="text-[10px] tracking-[0.16em] uppercase text-[#f6f3f2]/50 font-extrabold flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#ff6a4d] animate-pulse" />
                    <span>{language === 'NE' ? 'संस्थापक तथा सर्जक' : 'Be the change'}</span>
                  </div>
                  <b className="block font-serif italic text-lg sm:text-xl text-[#f6f3f2] font-normal leading-tight">
                    {language === 'NE'
                      ? '“तपाईं जे परिवर्तन चाहनुहुन्छ, आफैं बन्नुहोस्”'
                      : '“Be the change you want to see”'}
                  </b>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CREDITS & TECHNOLOGY STRIP (matching dhruvrathee.com .strip) ================= */}
      <div className="border-y border-[rgba(255,240,238,0.08)] py-6 sm:py-7 bg-[rgba(255,255,255,0.015)] overflow-hidden">
        <div className="max-w-[1180px] mx-auto px-4 mb-4 text-center">
          <div className="text-[10.5px] font-extrabold tracking-[0.22em] uppercase text-[#f6f3f2]/40 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e4342f]" />
            <span>{language === 'NE' ? 'प्रविधि तथा प्लेटफर्महरू' : 'Technologies & Modern Stack'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e4342f]" />
          </div>
        </div>

        {/* Infinite Running Marquee with Official Company Logos */}
        <div className="relative w-full overflow-hidden mask-fade py-1">
          <div className="animate-marquee flex items-center gap-5 sm:gap-6 tracking-wide">
            {techItems.concat(techItems).map((tech, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.035)] border border-[rgba(255,240,238,0.08)] hover:border-[#e4342f]/50 hover:bg-[rgba(255,255,255,0.065)] hover:shadow-[0_8px_24px_-6px_rgba(228,52,47,0.3)] transition-all whitespace-nowrap cursor-default group"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {tech.logo}
                </div>
                <span className="font-bold text-xs sm:text-[13px] text-[#f6f3f2]/85 group-hover:text-white transition-colors tracking-tight">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
