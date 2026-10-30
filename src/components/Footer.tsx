import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Language, ProfileSettings } from '../types';

interface FooterProps {
  language: Language;
  profile: ProfileSettings;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  profile,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          {/* Brand Info */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="font-heading font-bold text-slate-100 text-sm flex items-center justify-center sm:justify-start gap-2">
              <span>{profile.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                rajababumehta.com.np
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {language === 'NE'
                ? 'राजाबाबु मेहता • एआई वेबसाइट डेभलपर, एआई व्याख्याकर्ता तथा विद्यार्थी • वीरगञ्ज, नेपाल © २०२६'
                : 'Rajababu Mehta • AI Website Developer, AI Explainer & Student • Birgunj, Nepal © 2026'}
            </div>
          </div>

          {/* Quick Internal Nav Links for Search Engines & Visitors */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <a href="#home" className="hover:text-blue-400 transition-colors">
              {language === 'NE' ? 'गृहपृष्ठ' : 'Home'}
            </a>
            <span>•</span>
            <a href="#about" className="hover:text-blue-400 transition-colors">
              {language === 'NE' ? 'परिचय' : 'About'}
            </a>
            <span>•</span>
            <a
              href="https://aiclipzone.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
            >
              <span>AI Clipzone</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <a href="#skills" className="hover:text-blue-400 transition-colors">
              {language === 'NE' ? 'सीपहरू' : 'Skills'}
            </a>
            <span>•</span>
            <a href="#services" className="hover:text-blue-400 transition-colors">
              {language === 'NE' ? 'सेवाहरू' : 'Deliverables'}
            </a>
            <span>•</span>
            <a href="#faq" className="hover:text-blue-400 transition-colors">
              FAQ
            </a>
            <span>•</span>
            <a href="#contact" className="hover:text-blue-400 transition-colors">
              {language === 'NE' ? 'सम्पर्क' : 'Contact'}
            </a>
          </div>

          {/* Craft Note */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>
                {language === 'NE'
                  ? 'सफा कोड र आधुनिक वेब प्रविधिका साथ निर्मित'
                  : 'Crafted with clean code & modern web technology'}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
