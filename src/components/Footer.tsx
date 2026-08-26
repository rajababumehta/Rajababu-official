import React from 'react';
import { Heart, Sparkles, ArrowUp, Shield } from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface FooterProps {
  language: Language;
  profile: ProfileSettings;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  profile,
  isAdmin,
  onOpenAdminLogin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-heading font-black text-white text-sm shadow-md shadow-blue-500/20">
              RM
            </div>
            <div>
              <div className="font-heading font-bold text-slate-100 text-sm">
                {profile.name}
              </div>
              <div className="text-xs text-slate-400">
                {language === 'NE'
                  ? 'सर्वाधिकार सुरक्षित © २०२६'
                  : 'Official Personal Portfolio & Media CMS © 2026'}
              </div>
            </div>
          </div>

          {/* Center Note & Admin Status / Trigger */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>{language === 'NE' ? 'सशक्तिकरण र नवीनताका साथ निर्मित' : 'Crafted with passion for community & innovation'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>

            {!isAdmin && onOpenAdminLogin && (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-blue-400 transition-colors"
                title="Admin Control Access"
              >
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* Scroll to top button */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
          >
            <span>{language === 'NE' ? 'माथि जानुहोस्' : 'Back to top'}</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    </footer>
  );
};

