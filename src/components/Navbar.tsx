import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Languages,
  LogOut,
} from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  profile: ProfileSettings;
  onOpenCv?: () => void;
  isAdmin?: boolean;
  onAdminLogout?: () => void;
  currentView?: 'home' | 'posts';
  onNavigate?: (view: 'home' | 'posts', targetHash?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  profile,
  isAdmin = false,
  onAdminLogout,
  currentView = 'home',
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Menu items: Home, Post, About Me, Skills, Services / Deliverables, FAQ, Contact
  const navItems = [
    { href: '#home', labelEn: 'Home', labelNe: 'गृहपृष्ठ' },
    { href: '#posts', labelEn: 'Post', labelNe: 'पोस्ट' },
    { href: '#about', labelEn: 'About Me', labelNe: 'बारेमा' },
    { href: '#skills', labelEn: 'Skills', labelNe: 'सीपहरू' },
    { href: '#services', labelEn: 'Services', labelNe: 'सेवाहरू' },
    { href: '#faq', labelEn: 'FAQ', labelNe: 'प्रश्नोत्तर' },
    { href: '#contact', labelEn: 'Contact', labelNe: 'सम्पर्क' },
  ];

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdmin) {
      if (onAdminLogout) {
        onAdminLogout();
      }
    } else {
      if (onNavigate) {
        onNavigate('home', '#home');
      } else {
        window.location.hash = '#home';
      }
    }
  };

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (href === '#posts') {
      if (onNavigate) {
        onNavigate('posts', '#posts');
      } else {
        window.location.hash = '#posts';
      }
    } else {
      if (onNavigate) {
        onNavigate('home', href);
      } else {
        window.location.hash = href;
      }
    }
  };

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-3 sm:px-6 lg:px-8 pointer-events-none transition-all">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Floating Capsule / Pill Container (border-radius: 9999px) */}
        <div className="pointer-events-auto w-full rounded-full bg-slate-950/85 backdrop-blur-xl border border-slate-700/60 shadow-2xl shadow-blue-950/30 px-3 sm:px-5 py-2 transition-all hover:border-slate-600/70">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Brand Logo & Profile Avatar (Circle shape photo) */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                id="nav-circle-avatar-btn"
                onClick={handleAvatarClick}
                title={
                  isAdmin
                    ? (language === 'NE' ? '⚠️ एडमिन लगआउट गर्न यहाँ थिच्नुहोस्' : '⚠️ Admin Active: Click circle photo to Log Out')
                    : (profile.name || 'Rajababu Mehta')
                }
                className="relative group focus:outline-none cursor-pointer"
              >
                <div
                  className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-300 group-hover:scale-110 p-[1.5px] ${
                    isAdmin
                      ? 'bg-gradient-to-tr from-amber-500 via-rose-500 to-red-500 ring-2 ring-rose-500/80 ring-offset-2 ring-offset-slate-950 shadow-lg shadow-rose-500/40 animate-pulse'
                      : 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/60'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center ring-1 ring-white/20">
                    <img
                      src="/brand-avatar.png"
                      alt={`${profile.name || 'Rajababu Mehta'} Official Avatar`}
                      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Logout Indicator Badge for Admin on Circle Photo */}
                {isAdmin && (
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center border-2 border-slate-950 shadow-md"
                    title={language === 'NE' ? 'लगआउट गर्नुहोस्' : 'Log out'}
                  >
                    <LogOut className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('home', '#home') : (window.location.hash = '#home')}
                className="flex flex-col text-left group cursor-pointer focus:outline-none"
              >
                <span className="font-heading font-bold text-sm sm:text-base text-slate-100 tracking-tight flex items-center gap-1.5 group-hover:text-blue-400 transition-colors whitespace-nowrap">
                  {profile.name || 'Rajababu Mehta'}
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      ADMIN
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide hidden lg:inline-block">
                  {language === 'NE' ? 'एआई वेबसाइट डेभलपर' : 'AI Website Developer'}
                </span>
              </button>
            </div>

            {/* Desktop Centered Menu Items (Pill capsule styled buttons) */}
            <nav className="hidden md:flex items-center justify-center gap-0.5 lg:gap-1.5 flex-1 px-2">
              {navItems.map((item) => {
                const isPostActive = item.href === '#posts' && currentView === 'posts';
                const isHomeActive = item.href === '#home' && currentView === 'home';
                const isActive = isPostActive || isHomeActive;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.href)}
                    className={`px-3 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {language === 'NE' ? item.labelNe : item.labelEn}
                  </a>
                );
              })}
            </nav>

            {/* Right Action Controls: Language Switcher Pill */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
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
                {navItems.map((item) => {
                  const isPostActive = item.href === '#posts' && currentView === 'posts';
                  const isHomeActive = item.href === '#home' && currentView === 'home';
                  const isActive = isPostActive || isHomeActive;

                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {language === 'NE' ? item.labelNe : item.labelEn}
                    </a>
                  );
                })}
              </nav>

              {isAdmin && (
                <div className="pt-2 mt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onAdminLogout) onAdminLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold hover:bg-rose-500/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'NE' ? 'एडमिन लगआउट गर्नुहोस्' : 'Log Out Admin'}</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};


