import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Languages,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  profile: ProfileSettings;
  onOpenCv?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  profile,
  onOpenCv,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section links matching dhruvrathee.com structure
  const navItems = [
    { href: '#about', labelEn: 'Who am I', labelNe: 'मेरो परिचय' },
    { href: '#skills', labelEn: 'Skills', labelNe: 'सीपहरू' },
    { href: '#services', labelEn: 'Deliverables', labelNe: 'सेवाहरू' },
    { href: '#faq', labelEn: 'FAQ', labelNe: 'प्रश्नोत्तर' },
    { href: '#contact', labelEn: 'Work With Me', labelNe: 'सम्पर्क' },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0a0b0e]/92 backdrop-blur-xl border-b border-[rgba(255,240,238,0.08)] py-3 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.8)]'
          : 'bg-[#0a0b0e]/70 backdrop-blur-md border-b border-[rgba(255,240,238,0.04)] py-4'
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

        {/* Desktop Nav Links matching dhruvrathee.com links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs lg:text-[13.5px] font-semibold text-[#f6f3f2]/75 hover:text-[#f6f3f2] tracking-wide transition-colors relative py-1 group/link"
            >
              <span>{language === 'NE' ? item.labelNe : item.labelEn}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#e4342f] transition-all duration-300 group-hover/link:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Language Switcher Pill */}
          <button
            id="btn-language-toggle-desktop"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,240,238,0.09)] text-xs font-semibold text-[#f6f3f2]/80 hover:text-white transition-all cursor-pointer"
            title={language === 'EN' ? 'नेपालीमा हेर्नुहोस्' : 'Switch to English'}
            aria-label="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-[#e4342f]" />
            <span className={language === 'EN' ? 'text-[#e4342f] font-bold' : 'text-[#f6f3f2]/50'}>
              EN
            </span>
            <span className="text-[#f6f3f2]/30">/</span>
            <span className={language === 'NE' ? 'text-[#e4342f] font-bold' : 'text-[#f6f3f2]/50'}>
              नेपाली
            </span>
          </button>

          {/* Primary High-Contrast Button matching dhruvrathee.com (.btn-primary) */}
          <a
            href="https://aiclipzone.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-xl bg-[#e4342f] hover:bg-[#ff3d38] text-white text-xs sm:text-[13px] font-bold tracking-tight shadow-[0_6px_22px_-6px_rgba(228,52,47,0.8)] transition-all hover:scale-[1.03]"
            title="Visit AI Clipzone"
          >
            <span>AI Clipzone</span>
            <ExternalLink className="w-3.5 h-3.5 text-white/90" />
          </a>

          {/* CV button if available */}
          {onOpenCv && (
            <button
              onClick={onOpenCv}
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,240,238,0.12)] text-xs font-semibold text-[#f6f3f2]/90 hover:text-white transition-all"
            >
              <span>CV</span>
            </button>
          )}

          {/* Mobile Menu Burger */}
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,240,238,0.09)] text-[#f6f3f2] hover:text-[#e4342f] transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[#0d0e12]/98 border-b border-[rgba(255,240,238,0.12)] backdrop-blur-2xl px-5 py-6 overflow-hidden flex flex-col gap-4 shadow-2xl"
          >
            <div className="text-[11px] font-bold tracking-widest text-[#f6f3f2]/40 uppercase mb-1">
              {language === 'NE' ? 'नेभिगेसन पृष्ठहरू' : 'Pages'}
            </div>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className="px-3 py-2 rounded-lg text-sm font-semibold text-[#f6f3f2]/85 hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-colors flex items-center justify-between"
                >
                  <span>{language === 'NE' ? item.labelNe : item.labelEn}</span>
                  <span className="text-[#e4342f] text-xs">→</span>
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-[rgba(255,240,238,0.08)] flex flex-col gap-2.5">
              <a
                href="https://aiclipzone.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNavClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#e4342f] text-white font-bold text-xs shadow-lg shadow-[#e4342f]/30"
              >
                <span>Visit AI Clipzone</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {onOpenCv && (
                <button
                  onClick={() => {
                    handleNavClick();
                    onOpenCv();
                  }}
                  className="w-full py-2 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,240,238,0.1)] text-xs font-semibold text-[#f6f3f2]"
                >
                  {language === 'NE' ? 'आधिकारिक सीभी (CV)' : 'Official CV'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
