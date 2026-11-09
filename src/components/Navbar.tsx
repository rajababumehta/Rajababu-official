import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Globe2,
} from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface NavbarProps {
  language: Language;
  onToggleLanguage?: () => void;
  profile: ProfileSettings;
  onOpenPosts?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  profile,
  onOpenPosts,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when the right-side slide-over menu is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  // Section navigation links matching dhruvrathee.com structure
  const navItems = [
    { num: '01', href: '#home', labelEn: 'Home', labelNe: 'गृहपृष्ठ' },
    { num: '02', href: '#who', labelEn: 'Who am I', labelNe: 'मेरो परिचय' },
    {
      num: '03',
      labelEn: 'Posts',
      labelNe: 'पोस्टहरू',
      isPosts: true,
      badge: 'Feed',
    },
    {
      num: '04',
      href: 'https://aiclipzone.vercel.app/',
      labelEn: 'AI Clipzone',
      labelNe: 'एआई क्लिपजोन',
      isExternal: true,
      badge: 'Platform',
    },
    { num: '05', href: '#services', labelEn: 'Deliverables', labelNe: 'वेब सेवाहरू' },
    { num: '06', href: '#skills', labelEn: 'Skills & Journey', labelNe: 'सीप तथा यात्रा' },
    { num: '07', href: '#faq', labelEn: 'FAQ', labelNe: 'प्रश्नोत्तर' },
    { num: '08', href: '#contact', labelEn: 'Work With Me', labelNe: 'सम्पर्क' },
  ];

  const handleLinkClick = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      {/* ================= FIXED NAVBAR ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0a0b0e]/95 backdrop-blur-xl border-b border-[rgba(255,240,238,0.08)] py-3 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.85)]'
            : 'bg-[#0a0b0e]/75 backdrop-blur-md border-b border-[rgba(255,240,238,0.04)] py-4'
        }`}
      >
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Wordmark logo matching dhruvrathee.com (.wordmark) */}
          <a
            href="#home"
            id="nav-brand-logo"
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden flex-shrink-0 relative shadow-[0_4px_18px_-4px_rgba(228,52,47,0.85)] border border-[#e4342f]/40 transition-transform duration-300 group-hover:scale-105">
              <img
                src="/brand-avatar.png"
                alt={profile.name || 'Rajababu Mehta'}
                className="w-full h-full object-cover object-center"
              />
            </span>
            <span className="text-base sm:text-[18px] font-extrabold tracking-tight text-[#f6f3f2] flex items-center gap-1">
              <span>Rajababu</span>
              <i className="font-serif italic font-normal text-[#f6f3f2]/60 group-hover:text-[#e4342f] transition-colors">
                Mehta
              </i>
            </span>
          </a>

          {/* Desktop Nav Links (clean, minimal - only main portfolio sections, no posts) */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.filter((item) => !item.isExternal && !item.isPosts).map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-semibold text-[#f6f3f2]/75 hover:text-white tracking-wide transition-colors relative py-1 group/link"
              >
                <span>{language === 'NE' ? item.labelNe : item.labelEn}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#e4342f] transition-all duration-300 group-hover/link:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Direct AI Clipzone CTA Button with uploaded logo */}
            <a
              href="https://aiclipzone.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#e4342f] hover:bg-[#ff3d38] text-white text-xs sm:text-[13px] font-bold tracking-tight shadow-[0_6px_22px_-6px_rgba(228,52,47,0.8)] transition-all hover:scale-[1.03]"
              title="Visit AI Clipzone Platform"
            >
              <img
                src="/assets/aistudio/logo_3c930995.png"
                alt="AI Clipzone"
                className="w-4 h-4 rounded-full object-cover shrink-0"
              />
              <span>AI Clipzone</span>
              <ExternalLink className="w-3 h-3 text-white/90" />
            </a>

            {/* Dhruv Rathee Style Burger Button (No 'Menu' text, clean 3-line icon) */}
            <button
              id="btn-dhruv-menu-toggle"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center p-2.5 sm:p-3 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.09)] border border-[rgba(255,240,238,0.12)] hover:border-[#e4342f]/50 text-[#f6f3f2] hover:text-[#e4342f] transition-all cursor-pointer group shadow-sm"
              aria-label="Toggle navigation drawer"
              title="Toggle navigation"
            >
              <div className="flex flex-col gap-1.5 w-5 justify-center items-end shrink-0">
                <span className="w-full h-[2px] bg-current rounded-full transition-transform group-hover:translate-x-0.5" />
                <span className="w-3/4 h-[2px] bg-current rounded-full transition-transform group-hover:w-full group-hover:translate-x-0.5" />
                <span className="w-full h-[2px] bg-current rounded-full transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>

          </div>

        </div>
      </header>

      {/* ================= DHRUV RATHEE STYLE HALF-SCREEN RIGHT-SIDE SLIDE-OVER MENU ================= */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
            
            {/* Dimmed Blurred Backdrop (covering other half of the screen) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Right-Side Half-Screen Panel (covers ~50% of the screen on desktop/laptop) */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[80vw] md:w-[50vw] lg:w-[48vw] xl:w-[45vw] max-w-[620px] bg-[#0c0d11] border-l border-[rgba(255,240,238,0.12)] shadow-[-30px_0_80px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-y-auto p-6 sm:p-9 z-10"
            >
              {/* Top Row: Identity & Close Button */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-[rgba(255,240,238,0.08)] mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full overflow-hidden border border-[#e4342f]/50 shadow-[0_0_12px_rgba(228,52,47,0.4)]">
                      <img
                        src="/brand-avatar.png"
                        alt={profile.name || 'Rajababu Mehta'}
                        className="w-full h-full object-cover"
                      />
                    </span>
                    <div>
                      <div className="font-extrabold text-[#f6f3f2] text-sm tracking-tight flex items-center gap-1.5">
                        <span>Rajababu Mehta</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e4342f]" />
                      </div>
                      <div className="text-[11px] text-[#f6f3f2]/50 font-medium">
                        {language === 'NE' ? 'एआई वेबसाइट डेभलपर • वीरगञ्ज' : 'AI Website Developer · Nepal'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(228,52,47,0.15)] border border-[rgba(255,240,238,0.1)] hover:border-[#e4342f]/40 text-[#f6f3f2]/80 hover:text-white transition-all text-xs font-bold cursor-pointer group"
                    aria-label="Close"
                  >
                    <span>{language === 'NE' ? 'बन्द' : 'Close'}</span>
                    <X className="w-4 h-4 text-[#e4342f] group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <nav className="flex flex-col divide-y divide-[rgba(255,240,238,0.06)]">
                  {navItems.map((item) => {
                    if (item.isPosts) {
                      return (
                        <button
                          key="nav-posts-action"
                          type="button"
                          onClick={() => {
                            handleLinkClick();
                            onOpenPosts?.();
                          }}
                          className="py-3.5 sm:py-4 flex items-baseline justify-between group transition-all text-left w-full cursor-pointer"
                        >
                          <div className="flex items-baseline gap-4 sm:gap-5">
                            {/* Red Serif Number */}
                            <span className="font-serif italic text-lg sm:text-xl text-[#e4342f] opacity-80 group-hover:opacity-100 transition-opacity">
                              {item.num}
                            </span>

                            {/* Title */}
                            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#f6f3f2]/85 group-hover:text-white group-hover:translate-x-1 transition-all flex items-center gap-2.5">
                              <span>{language === 'NE' ? item.labelNe : item.labelEn}</span>
                            </span>
                          </div>

                          {/* Right Indicator / Badge */}
                          <div className="flex items-center gap-2">
                            {item.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e4342f] text-white uppercase tracking-wider shadow-[0_0_12px_rgba(228,52,47,0.5)]">
                                {item.badge}
                              </span>
                            )}
                            <ArrowRight className="w-4 h-4 text-[#e4342f] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                          </div>
                        </button>
                      );
                    }

                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target={item.isExternal ? '_blank' : undefined}
                        rel={item.isExternal ? 'noopener noreferrer' : undefined}
                        onClick={handleLinkClick}
                        className="py-3.5 sm:py-4 flex items-baseline justify-between group transition-all"
                      >
                        <div className="flex items-baseline gap-4 sm:gap-5">
                          {/* Red Serif Number */}
                          <span className="font-serif italic text-lg sm:text-xl text-[#e4342f] opacity-80 group-hover:opacity-100 transition-opacity">
                            {item.num}
                          </span>

                          {/* Title */}
                          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#f6f3f2]/85 group-hover:text-white group-hover:translate-x-1 transition-all flex items-center gap-2.5">
                            {item.isExternal && (
                              <img
                                src="/assets/aistudio/logo_3c930995.png"
                                alt="AI Clipzone Logo"
                                className="w-5 h-5 rounded-full object-cover border border-[#e4342f]/60 shrink-0"
                              />
                            )}
                            <span>{language === 'NE' ? item.labelNe : item.labelEn}</span>
                          </span>
                        </div>

                        {/* Right Indicator / Badge */}
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e4342f]/20 border border-[#e4342f]/40 text-[#ff8175] uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight className="w-4 h-4 text-[#e4342f] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Section: AI Clipzone Feature + Controls */}
              <div className="pt-8 mt-6 border-t border-[rgba(255,240,238,0.08)] space-y-4">
                
                {/* AI Clipzone Direct Highlight Card */}
                <a
                  href="https://aiclipzone.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="p-4 rounded-2xl bg-gradient-to-r from-[#e4342f]/15 via-[rgba(255,255,255,0.02)] to-transparent border border-[#e4342f]/35 hover:border-[#e4342f] flex items-center justify-between gap-3 group transition-all shadow-[0_8px_24px_-8px_rgba(228,52,47,0.3)]"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/aistudio/logo_3c930995.png"
                      alt="AI Clipzone Logo"
                      className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>AI Clipzone</span>
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-[#e4342f] text-white uppercase font-extrabold tracking-wide">
                          Founder
                        </span>
                      </div>
                      <div className="text-[11px] text-[#f6f3f2]/60">
                        aiclipzone.vercel.app
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#ff8175] group-hover:translate-x-0.5 transition-transform" />
                </a>



                {/* Footer Location & Credential Tag */}
                <div className="pt-2 text-[11px] text-[#f6f3f2]/40 text-center flex items-center justify-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#e4342f]" />
                  <span>Birgunj, Nepal · Founder, AI Clipzone</span>
                </div>

              </div>
            </motion.aside>

          </div>
        )}
      </AnimatePresence>
    </>
  );
};
