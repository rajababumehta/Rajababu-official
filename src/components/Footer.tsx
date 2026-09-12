import React from 'react';
import { Sparkles, ArrowUp, Flame } from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface FooterProps {
  language: Language;
  profile: ProfileSettings;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  profile,
  onOpenAdmin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shadow-md shadow-blue-500/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center ring-1 ring-white/20">
                <img
                  src="/brand-avatar.png"
                  alt={profile.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
            <div>
              <div className="font-heading font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>{profile.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">rajababumehta.com.np</span>
              </div>
              <div className="text-xs text-slate-400">
                {language === 'NE'
                  ? 'आधिकारिक वेबसाइट • एआई वेबसाइट डेभलपर, एआई व्याख्याकर्ता तथा विद्यार्थी • वीरगञ्ज, नेपाल © २०२६'
                  : 'Official Website • AI Website Developer, AI Explainer & Student • Birgunj, Nepal © 2026'}
              </div>
            </div>
          </div>

          {/* Center Note */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>{language === 'NE' ? 'सफा कोड र आधुनिक वेब प्रविधिका साथ निर्मित' : 'Crafted with clean code & modern web technology'}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

          {/* Action buttons (Admin & Scroll to top) */}
          <div className="flex items-center gap-2">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 text-xs font-semibold transition-colors"
                title="Firebase Admin Portal & Image Upload"
                aria-label="Open Firebase Admin Portal"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'NE' ? 'एडमिन' : 'Admin'}</span>
              </button>
            )}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <span>{language === 'NE' ? 'माथि जानुहोस्' : 'Back to top'}</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};


