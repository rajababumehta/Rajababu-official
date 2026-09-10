import React from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  Cpu,
  ShieldCheck,
  Sparkles,
  Quote,
} from 'lucide-react';
import { AboutSettings, Language } from '../types';

interface AboutSectionProps {
  language: Language;
  about: AboutSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ language, about }) => {
  const getValueIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-6 h-6 text-blue-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-cyan-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <section id="about" className="py-20 sm:py-28 bg-slate-950/60 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>{language === 'NE' ? about.badgeNe : about.badgeEn}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight max-w-3xl">
            {language === 'NE' ? about.headingNe : about.headingEn}
          </h2>
        </div>

        {/* Narrative & Executive Bio */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === 'NE'
                    ? 'राजाबाबु मेहताको आधिकारिक व्यक्तिगत वेबसाइट'
                    : 'Official Personal Website of Rajababu Mehta'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 font-heading mb-4">
                {language === 'NE'
                  ? 'वेबसाइट निर्माण, विद्यार्थी यात्रा तथा एआई प्रविधि अन्वेषण'
                  : 'Web Development, Academic Growth & Practical AI Innovation'}
              </h3>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                {language === 'NE' ? about.bioParagraph1Ne : about.bioParagraph1En}
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                {language === 'NE' ? about.bioParagraph2Ne : about.bioParagraph2En}
              </p>
            </div>

            {/* Motto Badge Card */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20">
              <Quote className="w-8 h-8 text-blue-400/40 absolute -top-3 -left-2" />
              <p className="text-slate-200 font-medium text-sm sm:text-base italic leading-relaxed pl-4">
                {language === 'NE' ? about.mottoNe : about.mottoEn}
              </p>
            </div>
          </div>
        </div>

        {/* Core Values & Pillars */}
        <div>
          <div className="text-center mb-8">
            <h4 className="text-xl font-bold text-slate-200 font-heading">
              {language === 'NE' ? 'मार्गदर्शक सिद्धान्त तथा स्तम्भहरू' : 'Core Pillars & Guiding Principles'}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {about.values.map((val, idx) => (
              <motion.div
                key={val.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 transition-all flex flex-col items-start"
              >
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4">
                  {getValueIcon(val.icon)}
                </div>
                <h5 className="text-base font-bold text-slate-100 font-heading mb-2">
                  {language === 'NE' ? val.titleNe : val.titleEn}
                </h5>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {language === 'NE' ? val.descNe : val.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
