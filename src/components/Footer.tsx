import React from 'react';
import { Sparkles, ArrowUp, Code2, ShieldCheck, Heart } from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface FooterProps {
  language: Language;
  profile: ProfileSettings;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  profile,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { href: '#home', labelEn: 'Home', labelNe: 'गृहपृष्ठ' },
    { href: '#about', labelEn: 'About', labelNe: 'बारेमा' },
    { href: '#skills', labelEn: 'Skills & Tech', labelNe: 'सीपहरू' },
    { href: '#services', labelEn: 'Services', labelNe: 'सेवाहरू' },
    { href: '#faq', labelEn: 'FAQ & Process', labelNe: 'प्रश्नोत्तर' },
    { href: '#contact', labelEn: 'Contact Studio', labelNe: 'सम्पर्क' },
  ];

  const techStack = [
    'React 18',
    'TypeScript',
    'Tailwind CSS',
    'Cloud Firestore',
    'Vite',
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-12 pb-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-900/80 items-start">
          
          {/* Brand & Bio (Col 5) */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shadow-md shadow-blue-500/20">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center ring-1 ring-white/20">
                  <img
                    src="/brand-avatar.png"
                    alt={profile.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
              <div>
                <div className="font-heading font-bold text-slate-100 text-base flex items-center gap-2">
                  <span>{profile.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    rajababumehta.com.np
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {language === 'NE'
                    ? 'एआई वेबसाइट डेभलपर तथा विद्यार्थी • वीरगञ्ज, नेपाल'
                    : 'AI Website Developer & Student • Birgunj, Nepal'}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {language === 'NE'
                ? 'आधुनिक वेब प्रविधि, उच्च कार्यसम्पादन, र सफा कोडका साथ गुणस्तरीय वेबसाइट निर्माण।'
                : 'Dedicated to engineering fast, accessible, and high-converting web applications and interactive AI explainers.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'NE' ? 'सत्यापित आधिकारिक डोमेन' : 'Verified Official Portfolio'}</span>
            </div>
          </div>

          {/* Quick Navigation Links (Col 4) */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {language === 'NE' ? 'नेभिगेसन' : 'Quick Navigation'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-blue-400 transition-colors py-0.5"
                >
                  {language === 'NE' ? link.labelNe : link.labelEn}
                </a>
              ))}
            </div>
          </div>

          {/* Tech Stack & Architecture (Col 3) */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'NE' ? 'आर्किटेक्चर' : 'Built With'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar with Copyright & Smooth Back-to-Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>© 2026 {profile.name}. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500/20" /> in Birgunj, Nepal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'NE' ? 'आधुनिक वेब स्टुडियो' : 'Modern Web Studio'}</span>
            </div>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors shadow-sm"
              title="Scroll to top"
            >
              <span>{language === 'NE' ? 'माथि जानुहोस्' : 'Top'}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
