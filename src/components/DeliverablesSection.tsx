import React from 'react';
import { motion } from 'motion/react';
import {
  Code,
  Smartphone,
  Globe,
  ShieldCheck,
  Check,
  ArrowRight,
  Zap,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Language, ContactSettings } from '../types';

interface DeliverablesSectionProps {
  language: Language;
  contact?: ContactSettings;
}

export const DeliverablesSection: React.FC<DeliverablesSectionProps> = ({
  language,
}) => {
  const deliverablesList = [
    {
      titleEn: 'Next-Gen Frontend Architecture',
      titleNe: 'आधुनिक फ्रन्टएन्ड संरचना',
      descEn: 'Built with React 19, Tailwind CSS, and Vite. Smooth transitions, sub-second load speeds, zero boilerplate clunkiness.',
      descNe: 'रियाक्ट र टेलविन्ड सीएसएसमा आधारित। तीव्र गतिमा खुल्ने र उच्च गुणस्तरको आधुनिक कोड संरचना।',
      icon: Code,
      accent: 'blue',
      badgeEn: 'Performance & Speed',
      badgeNe: 'उच्च गति र कार्यक्षमता',
    },
    {
      titleEn: 'Pixel-Perfect Mobile Responsiveness',
      titleNe: 'उत्कृष्ट मोबाइल अनुकूलता',
      descEn: 'Engineered from 320px smartphones to ultra-wide 4K monitors. Fluid layouts, touch ergonomics, and comfortable tap targets.',
      descNe: 'सबै किसिमका स्मार्टफोन, ट्याब्लेट र कम्प्युटरमा स्पष्ट र चिटिक्क देखिने डिजाइन।',
      icon: Smartphone,
      accent: 'emerald',
      badgeEn: '100% Adaptive',
      badgeNe: '१००% सबै स्क्रिनमा उपयुक्त',
    },
    {
      titleEn: 'Search Engine & Social Discovery',
      titleNe: 'सर्च इन्जिन तथा सामाजिक सञ्जाल अप्टिमाइजेसन',
      descEn: 'Comprehensive Schema.org JSON-LD, sitemap.xml, robots.txt, and Open Graph previews for Facebook/WhatsApp sharing.',
      descNe: 'गुगल सर्च र फेसबुक, ह्वाट्सएप सेयरिङका लागि आवश्यक सबै मेटा ट्याग तथा साइटम्याप सेटअप।',
      icon: Globe,
      accent: 'indigo',
      badgeEn: 'Google Indexed',
      badgeNe: 'गुगल सर्चमा सहजै भेटिने',
    },
    {
      titleEn: 'Instant Turnkey Deployment',
      titleNe: 'सहज डोमेन र होस्टिङ व्यवस्थापन',
      descEn: 'Free assistance connecting your custom domain (e.g. .com, .com.np) with HTTPS SSL security certificate included.',
      descNe: 'कस्टम डोमेन जोड्न सहयोग र निःशुल्क एसएसएल (SSL) सुरक्षा प्रमाणपत्रको व्यवस्था।',
      icon: ShieldCheck,
      accent: 'purple',
      badgeEn: 'Free SSL Included',
      badgeNe: 'सुरक्षित एसएसएल सहित',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      titleEn: 'Requirement & Concept',
      titleNe: 'आवश्यकता र अवधारणा',
      descEn: 'Submit your requirements in the contact section below to finalize pages, brand colors, and core objectives.',
      descNe: 'सम्पर्क फारममा जानकारी पठाएर पृष्ठ संख्या, ब्रान्ड र लक्ष्य निर्धारण गरिन्छ।',
    },
    {
      step: '02',
      titleEn: 'Architecture & Design',
      titleNe: 'ढाँचा तथा डिजाइन',
      descEn: 'Structuring responsive typography, modern color balance, and interactive user components.',
      descNe: 'मोबाइल र कम्प्युटर दुवैका लागि उत्कृष्ट देखिने डिजाइन संरचना तयार गरिन्छ।',
    },
    {
      step: '03',
      titleEn: 'Engineering & Code',
      titleNe: 'प्रोग्रामिङ तथा परीक्षण',
      descEn: 'Clean React code, rapid loading performance, bilingual modules, and form setup.',
      descNe: 'छिटो खुल्ने सफा कोड, अन्तरक्रियात्मक फारम र सुरक्षा परीक्षण गरिन्छ।',
    },
    {
      step: '04',
      titleEn: 'Domain & Launch',
      titleNe: 'डोमेन जोड्ने र सार्वजनिक गर्ने',
      descEn: 'Connecting custom domain names, deploying SSL certificates, and going live on Google.',
      descNe: 'कस्टम डोमेन लिङ्क गरी गुगल सर्चमा देखिने गरी वेबसाइट प्रत्यक्ष अनलाइन गरिन्छ।',
    },
  ];

  return (
    <section
      id="services"
      className="py-24 sm:py-32 bg-slate-950 relative border-t border-slate-900 overflow-hidden scroll-mt-20"
    >
      <div id="deliverables" className="absolute -top-24" />

      {/* Decorative background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {language === 'NE' ? 'वेबसाइट डेलिभरेबल्स र गुणस्तर' : 'Web Deliverables & Standards'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight max-w-3xl mb-4">
            {language === 'NE'
              ? 'आधुनिक, द्रुत र व्यावसायिक वेबसाइट मापदण्ड'
              : 'Built to Modern Engineering & Aesthetic Standards'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            {language === 'NE'
              ? 'प्रत्येक परियोजना आधुनिक प्रविधि, उत्कृष्ट मोबाइल अनुभव, सर्च इन्जिन अनुकूलता र भरपर्दो सुरक्षाका साथ तयार गरिन्छ।'
              : 'Every single website built by Rajababu Mehta is engineered with cutting-edge front-end architecture, fluid responsive ergonomics, and turnkey Google discovery.'}
          </p>

          {/* Quick Pillars Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'NE' ? 'द्रुत डेलिभरी' : 'Fast Turnaround'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'NE' ? '१००% मोबाइल-मैत्री' : '100% Mobile Ready'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'NE' ? 'सफा आधुनिक डिजाइन' : 'Clean Modern UI'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'NE' ? 'एसएसएल सुरक्षा' : 'HTTPS SSL Included'}</span>
            </div>
          </div>
        </div>

        {/* 4 Deliverables Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {deliverablesList.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {language === 'NE' ? item.badgeNe : item.badgeEn}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-100 font-heading mb-2.5 group-hover:text-blue-400 transition-colors">
                    {language === 'NE' ? item.titleNe : item.titleEn}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {language === 'NE' ? item.descNe : item.descEn}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>{language === 'NE' ? 'प्रत्येक वेबसाइटमा समावेश' : 'Included in Every Website'}</span>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 4-Step Seamless Website Workflow */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/50 border border-slate-800 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block">
              {language === 'NE' ? 'सहज र पारदर्शी प्रक्रिया' : 'Step-By-Step Execution'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 font-heading">
              {language === 'NE' ? 'वेबसाइट निर्माणको ४-चरण प्रक्रिया' : 'The 4-Step Seamless Website Workflow'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {language === 'NE'
                ? 'कुराकानीबाट सुरु भएर डोमेन जोड्नेसम्मको छिटो र सरल विधि'
                : 'From the initial requirement chat to custom domain configuration and going live on Google.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((st, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-extrabold text-blue-500 font-heading">
                      {st.step}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
                      Phase {i + 1}
                    </span>
                  </div>
                  <h5 className="text-sm sm:text-base font-bold text-slate-200 mb-2">
                    {language === 'NE' ? st.titleNe : st.titleEn}
                  </h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'NE' ? st.descNe : st.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-600/25 hover:scale-[1.02]"
            >
              <span>{language === 'NE' ? 'सम्पर्क गरी सुरु गर्नुहोस्' : 'Start Your Project Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
