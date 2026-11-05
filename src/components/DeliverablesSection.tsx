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
      badgeEn: 'Performance & Speed',
      badgeNe: 'उच्च गति र कार्यक्षमता',
    },
    {
      titleEn: 'Pixel-Perfect Mobile Responsiveness',
      titleNe: 'उत्कृष्ट मोबाइल अनुकूलता',
      descEn: 'Engineered from 320px smartphones to ultra-wide 4K monitors. Fluid layouts, touch ergonomics, and comfortable tap targets.',
      descNe: 'सबै किसिमका स्मार्टफोन, ट्याब्लेट र कम्प्युटरमा स्पष्ट र चिटिक्क देखिने डिजाइन।',
      icon: Smartphone,
      badgeEn: '100% Adaptive',
      badgeNe: '१००% सबै स्क्रिनमा उपयुक्त',
    },
    {
      titleEn: 'Search Engine & Social Discovery',
      titleNe: 'सर्च इन्जिन तथा सामाजिक सञ्जाल अप्टिमाइजेसन',
      descEn: 'Comprehensive Schema.org JSON-LD, sitemap.xml, robots.txt, and Open Graph previews for Facebook/WhatsApp sharing.',
      descNe: 'गुगल सर्च र फेसबुक, ह्वाट्सएप सेयरिङका लागि आवश्यक सबै मेटा ट्याग तथा साइटम्याप सेटअप।',
      icon: Globe,
      badgeEn: 'Google Indexed',
      badgeNe: 'गुगल सर्चमा सहजै भेटिने',
    },
    {
      titleEn: 'Instant Turnkey Deployment',
      titleNe: 'सहज डोमेन र होस्टिङ व्यवस्थापन',
      descEn: 'Free assistance connecting your custom domain (e.g. .com, .com.np) with HTTPS SSL security certificate included.',
      descNe: 'कस्टम डोमेन जोड्न सहयोग र निःशुल्क एसएसएल (SSL) सुरक्षा प्रमाणपत्रको व्यवस्था।',
      icon: ShieldCheck,
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
      className="py-20 sm:py-28 bg-[#0a0b0e] relative border-t border-[rgba(255,240,238,0.08)] overflow-hidden scroll-mt-20"
    >
      <div id="work" className="absolute -top-20" />
      <div id="deliverables" className="absolute -top-20" />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header matching dhruvrathee.com (.sh) */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold tracking-widest uppercase text-[#f6f3f2]/50">
            <span className="w-2 h-2 rounded-full bg-[#e4342f]" />
            <span>{language === 'NE' ? 'सेवा तथा गुणस्तर' : 'Capabilities & Deliverables'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] text-[#f6f3f2]">
            {language === 'NE' ? (
              <>
                वेबसाइट <span className="font-serif italic font-normal text-[#e4342f]">डेलिभरेबल्स तथा मापदण्ड</span>
              </>
            ) : (
              <>
                My Work & <span className="font-serif italic font-normal text-[#e4342f]">Deliverables</span>
              </>
            )}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#f6f3f2]/70 max-w-2xl leading-relaxed">
            {language === 'NE'
              ? 'प्रत्येक परियोजना आधुनिक प्रविधि, उत्कृष्ट मोबाइल अनुभव, सर्च इन्जिन अनुकूलता र भरपर्दो सुरक्षाका साथ तयार गरिन्छ।'
              : 'Every single website built by Rajababu Mehta is engineered with cutting-edge front-end architecture, fluid responsive ergonomics, and turnkey Google discovery.'}
          </p>

          {/* Quick Pillars Strip (Unboxed metadata style) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-6 text-xs text-[#f6f3f2]/60">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#ff6a4d]" />
              <span className="font-semibold text-[#f6f3f2]">{language === 'NE' ? 'द्रुत डेलिभरी' : 'Fast Turnaround'}</span>
            </div>
            <span className="text-[#f6f3f2]/20">·</span>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#ff8175]" />
              <span className="font-semibold text-[#f6f3f2]">{language === 'NE' ? '१००% मोबाइल-मैत्री' : '100% Mobile Ready'}</span>
            </div>
            <span className="text-[#f6f3f2]/20">·</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e4342f]" />
              <span className="font-semibold text-[#f6f3f2]">{language === 'NE' ? 'सफा आधुनिक डिजाइन' : 'Clean Modern UI'}</span>
            </div>
            <span className="text-[#f6f3f2]/20">·</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff6a4d]" />
              <span className="font-semibold text-[#f6f3f2]">{language === 'NE' ? 'एसएसएल सुरक्षा' : 'HTTPS SSL Included'}</span>
            </div>
          </div>
        </div>

        {/* 4 Deliverables Cards (matching dhruvrathee.com card aesthetic) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {deliverablesList.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-6 sm:p-7 rounded-[22px] bg-[#101216] border border-[rgba(255,240,238,0.08)] hover:border-[#e4342f]/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,240,238,0.08)] text-[#e4342f] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#e4342f]/10 transition-all">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#ff8175]">
                      {language === 'NE' ? item.badgeNe : item.badgeEn}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-[17px] font-bold text-[#f6f3f2] tracking-tight mb-2.5 group-hover:text-[#ff8175] transition-colors">
                    {language === 'NE' ? item.titleNe : item.titleEn}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#f6f3f2]/65 leading-relaxed">
                    {language === 'NE' ? item.descNe : item.descEn}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-[rgba(255,240,238,0.06)] flex items-center justify-between text-xs font-semibold text-[#f6f3f2]/80">
                  <span>{language === 'NE' ? 'प्रत्येक वेबसाइटमा समावेश' : 'Included in Every Website'}</span>
                  <Check className="w-3.5 h-3.5 text-[#e4342f]" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 4-Step Seamless Website Workflow */}
        <div className="p-8 sm:p-11 rounded-[26px] bg-[#101216] border border-[rgba(255,240,238,0.09)] relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-[#ff8175] uppercase tracking-wider mb-2 block">
              {language === 'NE' ? 'सहज र पारदर्शी प्रक्रिया' : 'Step-By-Step Execution'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#f6f3f2] tracking-tight">
              {language === 'NE' ? 'वेबसाइट निर्माणको ४-चरण प्रक्रिया' : 'The 4-Step Seamless Website Workflow'}
            </h3>
            <p className="text-xs sm:text-sm text-[#f6f3f2]/60 mt-2">
              {language === 'NE'
                ? 'कुराकानीबाट सुरु भएर डोमेन जोड्नेसम्मको छिटो र सरल विधि'
                : 'From the initial requirement chat to custom domain configuration and going live on Google.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((st, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 rounded-[20px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,240,238,0.06)] hover:border-[rgba(255,240,238,0.14)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-serif italic text-3xl font-normal text-[#e4342f]">
                      {st.step}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#f6f3f2]/40 tracking-wider">
                      Phase {i + 1}
                    </span>
                  </div>
                  <h5 className="text-sm sm:text-base font-bold text-[#f6f3f2] mb-2">
                    {language === 'NE' ? st.titleNe : st.titleEn}
                  </h5>
                  <p className="text-xs text-[#f6f3f2]/60 leading-relaxed">
                    {language === 'NE' ? st.descNe : st.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-start">
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#e4342f] hover:bg-[#ff3d38] text-white text-xs sm:text-sm font-bold transition-all shadow-[0_8px_22px_-6px_rgba(228,52,47,0.7)] hover:scale-[1.02]"
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
