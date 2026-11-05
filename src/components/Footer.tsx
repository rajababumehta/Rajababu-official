import React from 'react';
import { ExternalLink } from 'lucide-react';
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
    <footer className="bg-[#0a0b0e] border-t border-[rgba(255,240,238,0.08)] py-12 relative overflow-hidden">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          
          {/* Brand Wordmark & Info matching dhruvrathee.com */}
          <div className="flex flex-col items-center md:items-start">
            <div className="text-lg font-extrabold tracking-tight text-[#f6f3f2] flex items-center justify-center md:justify-start gap-2">
              <span>{profile.name || 'Rajababu'}</span>
              <i className="font-serif italic font-normal text-[#f6f3f2]/60">
                Mehta
              </i>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[rgba(255,255,255,0.04)] text-[#ff8175] border border-[rgba(255,240,238,0.08)]">
                rajababumehta.com.np
              </span>
            </div>
            
            <div className="text-xs text-[#f6f3f2]/50 mt-1.5 max-w-md">
              {language === 'NE'
                ? 'राजाबाबु मेहता • एआई वेबसाइट डेभलपर, एआई व्याख्याकर्ता तथा विद्यार्थी • वीरगञ्ज, नेपाल © २०२६'
                : 'Rajababu Mehta • AI Website Developer, AI Explainer & Student • Birgunj, Nepal © 2026'}
            </div>
          </div>

          {/* Quick Internal Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold text-[#f6f3f2]/60">
            <a href="#home" className="hover:text-white transition-colors">
              {language === 'NE' ? 'गृहपृष्ठ' : 'Home'}
            </a>
            <span className="text-[#f6f3f2]/20">·</span>
            <a href="#about" className="hover:text-white transition-colors">
              {language === 'NE' ? 'परिचय' : 'Who am I'}
            </a>
            <span className="text-[#f6f3f2]/20">·</span>
            <a
              href="https://aiclipzone.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff8175] hover:text-white font-bold inline-flex items-center gap-1 transition-colors"
            >
              <span>AI Clipzone</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#f6f3f2]/20">·</span>
            <a href="#skills" className="hover:text-white transition-colors">
              {language === 'NE' ? 'सीपहरू' : 'Skills'}
            </a>
            <span className="text-[#f6f3f2]/20">·</span>
            <a href="#services" className="hover:text-white transition-colors">
              {language === 'NE' ? 'सेवाहरू' : 'Deliverables'}
            </a>
            <span className="text-[#f6f3f2]/20">·</span>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <span className="text-[#f6f3f2]/20">·</span>
            <a href="#contact" className="hover:text-white transition-colors">
              {language === 'NE' ? 'सम्पर्क' : 'Work With Me'}
            </a>
          </div>

          {/* Craft Note */}
          <div className="text-xs text-[#f6f3f2]/40">
            {language === 'NE'
              ? 'सफा कोड र आधुनिक वेब प्रविधिका साथ निर्मित'
              : 'Crafted with clean code & modern web technology'}
          </div>

        </div>
      </div>
    </footer>
  );
};
