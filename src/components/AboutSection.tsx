import React from 'react';
import {
  Compass,
  Sparkles,
  Quote,
} from 'lucide-react';
import { AboutSettings, Language } from '../types';

interface AboutSectionProps {
  language: Language;
  about: AboutSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  language,
  about,
}) => {
  const cleanBio1Ne =
    about.bioParagraph1Ne && !about.bioParagraph1Ne.includes('नेता')
      ? about.bioParagraph1Ne
      : 'यो राजाबाबु मेहताको आधिकारिक व्यक्तिगत वेबसाइट हो। उहाँ वीरगञ्ज, नेपालका एक समर्पित एआई वेबसाइट डेभलपर (AI Website Developer), विद्यार्थी (Student) तथा एआई व्याख्याकर्ता (AI Explainer) हुनुहुन्छ। आधुनिक वेब प्रविधिहरू तथा उदीयमान आर्टिफिसियल इन्टेलिजेन्स (एआई) का उपकरणहरूमा गहिरो रुचि राख्दै, उहाँले व्यवसाय, व्यक्तिगत ब्रान्ड तथा संस्थाहरूका लागि छिटो, सुरक्षित, आकर्षक र गुगल-अनुकूल वेबसाइटहरू निर्माण गर्दै आउनुभएको छ।';

  const cleanBio2Ne =
    about.bioParagraph2Ne && !about.bioParagraph2Ne.includes('नेता')
      ? about.bioParagraph2Ne
      : 'राजाबाबु मेहताको यस आधिकारिक वेबसाइटमार्फत तपाईँले उहाँका परियोजनाहरू, प्राविधिक सीपहरू र सेवाहरू प्रत्यक्ष अवलोकन गर्न सक्नुहुन्छ। व्यक्तिगत पोर्टफोलियो, व्यवसायिक पोर्टल, ल्यान्डिङ पेज वा कुनै पनि आधुनिक वेबसाइट बनाउन परेमा, अथवा एआई प्रविधिको व्यवहारिक प्रयोगबारे बुझ्न चाहेमा राजाबाबु मेहतासँग सिधै सम्पर्क गर्न सक्नुहुन्छ।';

  return (
    <section id="about" className="py-20 sm:py-28 bg-slate-950/60 border-t border-slate-900 relative scroll-mt-24">
      <div id="about-me" className="absolute -top-24 pointer-events-none" />
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
        <div className="max-w-4xl mx-auto">
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
                  ? 'एआई वेबसाइट निर्माण, विद्यार्थी यात्रा तथा एआई प्रविधि अन्वेषण'
                  : 'AI Web Development, Student Learning & Practical AI Insights'}
              </h3>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
                {language === 'NE' ? cleanBio1Ne : about.bioParagraph1En}
              </p>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
                {language === 'NE' ? cleanBio2Ne : about.bioParagraph2En}
              </p>
            </div>

            {/* Motto Badge Card */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20 mb-8">
              <Quote className="w-8 h-8 text-blue-400/40 absolute -top-3 -left-2" />
              <p className="text-slate-200 font-medium text-sm sm:text-base italic leading-relaxed pl-4">
                {language === 'NE' ? about.mottoNe : about.mottoEn}
              </p>
            </div>

            {/* Internal Navigation Links between sections */}
            <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-medium">
                {language === 'NE' ? 'अन्य आधिकारिक सेक्सनहरू हेर्नुहोस्:' : 'Explore Official Sections:'}
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="#services"
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700/80 transition-all font-medium"
                >
                  {language === 'NE' ? 'वेबसाइट सेवाहरू' : 'Web Deliverables'} →
                </a>
                <a
                  href="#skills"
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700/80 transition-all font-medium"
                >
                  {language === 'NE' ? 'प्राविधिक सीपहरू' : 'Skills & Experience'} →
                </a>
                <a
                  href="#faq"
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700/80 transition-all font-medium"
                >
                  {language === 'NE' ? 'प्रायः सोधिने प्रश्नहरू' : 'FAQ'} →
                </a>
                <a
                  href="#contact"
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all font-semibold"
                >
                  {language === 'NE' ? 'सम्पर्क गर्नुहोस्' : 'Contact Rajababu Mehta'} →
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

