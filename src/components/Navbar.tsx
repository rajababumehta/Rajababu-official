import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Languages,
  FileText,
  Download,
} from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  profile: ProfileSettings;
  onOpenCv: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  profile,
  onOpenCv,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Menu items: Home, About (original scroll to section), About Me (new - opens CV), Skills, Services, Contact
  const navItems = [
    { href: '#home', labelEn: 'Home', labelNe: 'गृहपृष्ठ', isCv: false },
    { href: '#about', labelEn: 'About', labelNe: 'बारेमा', isCv: false },
    { href: '#about-me', labelEn: 'About Me', labelNe: 'About Me', isCv: true },
    { href: '#skills', labelEn: 'Skills', labelNe: 'सीपहरू', isCv: false },
    { href: '#services', labelEn: 'Services', labelNe: 'सेवाहरू', isCv: false },
    { href: '#contact', labelEn: 'Contact', labelNe: 'सम्पर्क', isCv: false },
  ];

  const handleNavClick = (e: React.MouseEvent, item: (typeof navItems)[0]) => {
    setMobileMenuOpen(false);
    if (item.isCv) {
      e.preventDefault();
      onOpenCv();
    }
  };

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 lg:px-8 pointer-events-none transition-all">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Floating Capsule / Pill Container (border-radius: 9999px) */}
        <div className="pointer-events-auto w-full rounded-full bg-slate-950/85 backdrop-blur-xl border border-slate-700/60 shadow-2xl shadow-blue-950/30 px-3 sm:px-5 py-2 transition-all hover:border-slate-600/70">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Brand Logo & Profile Avatar (Circle shape photo) */}
            <a
              href="#home"
              id="nav-brand-logo"
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0"
            >
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 p-[1.5px] shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/60 transition-all duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center ring-1 ring-white/20">
                  <img
                    src="/brand-avatar.png"
                    alt={profile.name}
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-sm sm:text-base text-slate-100 tracking-tight flex items-center gap-1 group-hover:text-blue-400 transition-colors whitespace-nowrap">
                  {profile.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden lg:inline-block">
                  {language === 'NE' ? 'एआई वेबसाइट डेभलपर' : 'AI Website Developer'}
                </span>
              </div>
            </a>

            {/* Desktop Centered Menu Items (Pill capsule styled buttons) */}
            <nav className="hidden md:flex items-center justify-center gap-0.5 lg:gap-1.5 flex-1 px-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    if (item.isCv) {
                      e.preventDefault();
                      onOpenCv();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all whitespace-nowrap ${
                    item.isCv
                      ? 'text-blue-300 hover:text-white hover:bg-blue-600/25 font-semibold border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {language === 'NE' ? item.labelNe : item.labelEn}
                </a>
              ))}
            </nav>

            {/* Right Action Controls: CV Button & Language Switcher Pill */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <button
                id="btn-open-cv-desktop"
                onClick={onOpenCv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/40 hover:border-blue-400 text-xs font-semibold text-blue-300 hover:text-white hover:bg-blue-600 transition-all shadow-sm cursor-pointer"
                title={language === 'NE' ? 'बायोडाटा (CV) हेर्नुहोस् र डाउनलोड गर्नुहोस्' : 'View & Download CV'}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? 'बायोडाटा (CV)' : 'CV / Resume'}</span>
              </button>

              <button
                id="btn-language-toggle-desktop"
                onClick={onToggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-inner cursor-pointer"
                title={language === 'EN' ? 'नेपालीमा हेर्नुहोस्' : 'Switch to English'}
                aria-label="Switch Language"
              >
                <Languages className="w-3.5 h-3.5 text-blue-400" />
                <div className="flex items-center gap-1">
                  <span className={language === 'EN' ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                    EN
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className={language === 'NE' ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                    नेपाली
                  </span>
                </div>
              </button>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onOpenCv}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-[11px] font-bold text-blue-300"
                aria-label="View CV"
              >
                <FileText className="w-3 h-3" />
                <span>CV</span>
              </button>

              <button
                id="btn-language-toggle-mobile"
                onClick={onToggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold text-blue-400"
                aria-label="Toggle language"
              >
                {language === 'EN' ? 'नेपाली' : 'EN'}
              </button>

              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Pill/Sheet */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto md:hidden w-full mt-2 p-3 rounded-3xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-1"
            >
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900/90 transition-colors flex items-center justify-between"
                  >
                    <span>{language === 'NE' ? item.labelNe : item.labelEn}</span>
                    {item.isCv && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                        View CV
                      </span>
                    )}
                  </a>
                ))}
              </nav>

              <div className="pt-2 border-t border-slate-800/80 mt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCv();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-600/30"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'NE' ? 'बायोडाटा डाउनलोड (PDF)' : 'Download CV (PDF)'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};


