import React from 'react';
import { Sparkles, ArrowUp } from 'lucide-react';
import { Language, ProfileSettings } from '../types';
import { NewsletterSignup } from './NewsletterSignup';

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

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Newsletter Signup Component */}
        <NewsletterSignup language={language} />

        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1.5px] shadow-md shadow-blue-500/20">
              <div className="w-full h-full rounded-[10px] overflow-hidden bg-slate-950 flex items-center justify-center">
                <img
                  src="/brand-logo.png"
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


