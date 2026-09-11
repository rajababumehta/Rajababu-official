import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Languages,
} from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  profile: ProfileSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  profile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '#about', labelEn: 'About', labelNe: 'बारेमा' },
    { href: '#journey', labelEn: 'Visual Journey', labelNe: 'दृश्य यात्रा' },
    { href: '#experience', labelEn: 'Experience', labelNe: 'अनुभव' },
    { href: '#contact', labelEn: 'Contact', labelNe: 'सम्पर्क' },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Monogram */}
          <a
            href="#"
            id="nav-brand-logo"
            className="flex items-center gap-3.5 group focus:outline-none"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-heading font-black text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-indigo-300 text-lg tracking-wider">
                RM
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base sm:text-lg text-slate-100 tracking-tight flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                {profile.name}
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                {language === 'NE' ? 'एआई वेबसाइट डेभलपर • एआई व्याख्याकर्ता • विद्यार्थी' : 'AI Website Developer • AI Explainer • Student'}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900/80 transition-all"
              >
                {language === 'NE' ? item.labelNe : item.labelEn}
              </a>
            ))}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher Pill */}
            <button
              id="btn-language-toggle-desktop"
              onClick={onToggleLanguage}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-inner"
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Language Switcher */}
            <button
              id="btn-language-toggle-mobile"
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-blue-400"
              aria-label="Toggle language"
            >
              {language === 'EN' ? 'नेपाली' : 'EN'}
            </button>

            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-6 flex flex-col gap-3"
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  {language === 'NE' ? item.labelNe : item.labelEn}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
