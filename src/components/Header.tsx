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

  const techBadges = [
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Google Gemini AI',
    'Node.js',
    'Vite',
    'Vercel',
    'Cloudflare',
    'AI Clipzone',
    'Prompt Engineering',
    'Web Architecture',
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
      <div className="border-y border-[rgba(255,240,238,0.08)] py-6 bg-[rgba(255,255,255,0.015)] overflow-hidden">
        <div className="max-w-[1180px] mx-auto px-4 mb-4 text-center">
          <div className="text-[10.5px] font-extrabold tracking-[0.22em] uppercase text-[#f6f3f2]/40">
            {language === 'NE' ? 'प्रविधि तथा प्लेटफर्महरू' : 'Technologies & Modern Stack'}
          </div>
        </div>

        {/* Infinite Running Marquee */}
        <div className="relative w-full overflow-hidden mask-fade">
          <div className="animate-marquee flex items-center gap-8 text-xs font-semibold text-[#f6f3f2]/70 tracking-wide">
            {techBadges.concat(techBadges).map((tech, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,240,238,0.06)] hover:border-[#e4342f]/40 hover:text-white transition-all whitespace-nowrap cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#e4342f]" />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
