import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Maximize2,
  X,
  ChevronRight,
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
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const cleanBio1Ne =
    about.bioParagraph1Ne && !about.bioParagraph1Ne.includes('नेता')
      ? about.bioParagraph1Ne
      : 'राजाबाबु मेहता एआई क्लिपजोन (AI Clipzone - https://aiclipzone.vercel.app/) का संस्थापक हुनुहुन्छ। उहाँ वीरगञ्ज, नेपालका एक समर्पित एआई वेबसाइट डेभलपर (AI Website Developer), विद्यार्थी (Student) तथा एआई व्याख्याकर्ता (AI Explainer) हुनुहुन्छ। आधुनिक वेब प्रविधिहरू तथा उदीयमान आर्टिफिसियल इन्टेलिजेन्स (एआई) का उपकरणहरूमा गहिरो रुचि राख्दै, उहाँले व्यवसाय, व्यक्तिगत ब्रान्ड तथा संस्थाहरूका लागि छिटो, सुरक्षित, आकर्षक र गुगल-अनुकूल वेबसाइटहरू निर्माण गर्दै आउनुभएको छ।';

  const cleanBio2Ne =
    about.bioParagraph2Ne && !about.bioParagraph2Ne.includes('नेता')
      ? about.bioParagraph2Ne
      : 'एआई क्लिपजोनका संस्थापक तथा प्रविधि अन्वेषकको रूपमा, राजाबाबु मेहताले यस आधिकारिक वेबसाइटमार्फत आफ्ना परियोजनाहरू, प्राविधिक सीपहरू र सेवाहरू प्रस्तुत गर्नुभएको छ। व्यक्तिगत पोर्टफोलियो, व्यवसायिक पोर्टल, ल्यान्डिङ पेज वा कुनै पनि आधुनिक वेबसाइट बनाउन परेमा, अथवा एआई प्रविधिको व्यवहारिक प्रयोगबारे बुझ्न चाहेमा राजाबाबु मेहतासँग सिधै सम्पर्क गर्न सक्नुहुन्छ।';

  // 3-photo strip data matching dhruvrathee.com .photo-strip
  const photoStrip = [
    {
      src: '/assets/who/dr-photo-1.jpg',
      alt: 'Rajababu Mehta - Night lights festive portrait',
      captionEn: 'Night illumination portrait with temple bokeh backdrop',
      captionNe: 'रात्रि मेला तथा मन्दिरको प्रकाशमय पृष्ठभूमिमा राजाबाबु मेहता',
    },
    {
      src: '/assets/who/dr-photo-2.jpg',
      alt: 'Rajababu Mehta - Nature & outdoor study portrait',
      captionEn: 'Outdoor portrait in natural greenery with arms crossed',
      captionNe: 'प्राकृतिक हरियाली र खुला वातावरणमा खिचिएको तस्बिर',
    },
    {
      src: '/assets/who/dr-photo-3.jpg',
      alt: 'Rajababu Mehta - Rooftop black polo portrait',
      captionEn: 'Rooftop black polo portrait looking straight at camera',
      captionNe: 'वीरगञ्जको छतमा खिचिएको आधिकारिक कालो टिसर्ट तस्बिर',
    },
  ];

  return (
    <section
      id="about"
      className="sec py-20 sm:py-28 bg-[#0a0b0e] border-t border-[rgba(255,240,238,0.08)] relative scroll-mt-20 overflow-hidden"
    >
      {/* Anchor targets matching dhruvrathee.com */}
      <div id="who" className="absolute -top-20 pointer-events-none" />
      <div id="about-me" className="absolute -top-20 pointer-events-none" />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header matching dhruvrathee.com (.sh) */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold tracking-widest uppercase text-[#f6f3f2]/50">
            <span className="w-2 h-2 rounded-full bg-[#e4342f] animate-pulse" />
            <span>{language === 'NE' ? 'मेरो यात्रा तथा परिचय' : 'Background & Journey'}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] text-[#f6f3f2]">
            {language === 'NE' ? (
              <>
                Who <span className="font-serif italic font-normal text-[#e4342f]">am I</span> (मेरो परिचय)
              </>
            ) : (
              <>
                Who <span className="font-serif italic font-normal text-[#e4342f]">am I</span>
              </>
            )}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#f6f3f2]/70 max-w-2xl leading-relaxed">
            {language === 'NE'
              ? 'एआई क्लिपजोनका संस्थापक तथा प्रमुख कार्यकारी अधिकृत (Founder & CEO)। एआई वेबसाइट डेभलपर, प्रविधि व्याख्याकर्ता तथा डेसिमल कलेज, वीरगञ्जका विद्यार्थी।'
              : 'Founder & CEO of AI Clipzone. AI Website Developer. Tech Explainer. Student at Decimal College, Birgunj.'}
          </p>
        </div>

        {/* Two-Column Grid matching dhruvrathee.com (.who-grid) */}
        <div className="who-grid">
          
          {/* ========================================================
             LEFT COLUMN: Main Photo (.who-photo) + 3-Photo Strip (.photo-strip)
             ======================================================== */}
          <div className="space-y-4">
            
            {/* Main Featured Photo Box (.who-photo) */}
            <div
              className="who-photo group cursor-pointer"
              onClick={() => setActivePhotoModal('/hero-portrait.png')}
              title="Click to view full photo"
            >
              <img
                src="/hero-portrait.png"
                alt="Rajababu Mehta"
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('dr-photo-3')) {
                    target.src = '/assets/who/dr-photo-3.jpg';
                  }
                }}
              />

              {/* Zoom hint overlay */}
              <div className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Dhruv Rathee Caption Chip (.who-cap) */}
              <div className="who-cap">
                <div className="font-bold text-[#f6f3f2] text-sm sm:text-base flex items-center gap-2 mb-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#e4342f] shrink-0" />
                  <span>Rajababu Mehta</span>
                </div>
                <div className="text-[#f6f3f2]/75 text-xs sm:text-[13px] leading-relaxed">
                  {language === 'NE'
                    ? 'एआई क्लिपजोन (AI Clipzone) का संस्थापक तथा सीईओ। +२ व्यवस्थापन अध्ययनरत, डेसिमल कलेज, वीरगञ्ज।'
                    : '+2 Management at Decimal College, Birgunj. Founder & CEO of AI Clipzone. Based in Birgunj, Nepal.'}
                </div>
              </div>
            </div>

            {/* Dhruv Rathee 3-Image Photo Strip (.photo-strip) */}
            <div className="photo-strip">
              {photoStrip.map((p, idx) => (
                <figure
                  key={idx}
                  className="group cursor-pointer"
                  onClick={() => setActivePhotoModal(p.src)}
                  title={language === 'NE' ? p.captionNe : p.captionEn}
                >
                  <img
                    src={p.src}
                    alt={p.alt}
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 right-2 z-10 text-[10px] text-white/90 font-medium truncate pointer-events-none drop-shadow">
                    {idx === 0 && (language === 'NE' ? 'रात्रि मेला' : 'Festival')}
                    {idx === 1 && (language === 'NE' ? 'प्रकृति' : 'Outdoor')}
                    {idx === 2 && (language === 'NE' ? 'कालो टिसर्ट' : 'Portrait')}
                  </div>
                  <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3 h-3" />
                  </div>
                </figure>
              ))}
            </div>

            {/* Strip caption note */}
            <div className="text-[11px] text-[#f6f3f2]/40 text-center tracking-wide">
              {language === 'NE'
                ? 'तस्बिरहरू: वीरगञ्ज, नेपाल • राजाबाबु मेहता'
                : 'Moments captured across Birgunj, Nepal • Rajababu Mehta'}
            </div>

          </div>

          {/* ========================================================
             RIGHT COLUMN: Story + Stats (.stat-row) + Awards (.awards) + Note
             ======================================================== */}
          <div className="space-y-6">
            
            {/* Narrative Editorial Card */}
            <div className="p-6 sm:p-7 rounded-[22px] bg-[#101216] border border-[rgba(255,240,238,0.08)]">
              <h3 className="text-lg sm:text-xl font-bold text-[#f6f3f2] tracking-tight mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-[#e4342f]" />
                <span>
                  {language === 'NE'
                    ? 'एआई क्लिपजोनका संस्थापक तथा प्राविधिक अन्वेषक'
                    : 'Founder & CEO of AI Clipzone, Web Developer & Tech Explorer'}
                </span>
              </h3>
              
              <p className="text-xs sm:text-sm text-[#f6f3f2]/80 leading-relaxed mb-4">
                {language === 'NE' ? cleanBio1Ne : about.bioParagraph1En}
              </p>

              <p className="text-xs sm:text-sm text-[#f6f3f2]/65 leading-relaxed">
                {language === 'NE' ? cleanBio2Ne : about.bioParagraph2En}
              </p>
            </div>

            {/* Dhruv Rathee Stat Grid (.stat-row) - 6 Verified Cards */}
            <div className="stat-row">
              <div className="stat">
                <span className="stat-num text-[#ff8175]">Founder</span>
                <span className="stat-label">AI Clipzone CEO</span>
              </div>
              <div className="stat">
                <span className="stat-num text-[#ff8175]">25+</span>
                <span className="stat-label">
                  {language === 'NE' ? 'सम्पन्न वेबसाइट' : 'Websites Built'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-num text-[#ff8175]">100%</span>
                <span className="stat-label">
                  {language === 'NE' ? 'मोबाइल रेस्पोन्सिभ' : 'Mobile Ready'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-num text-[#ff8175]">99.9%</span>
                <span className="stat-label">
                  {language === 'NE' ? 'एसईओ तथा स्पिड' : 'SEO & Speed'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-num text-[#ff8175]">#1</span>
                <span className="stat-label">
                  {language === 'NE' ? 'एआई व्याख्याकर्ता' : 'Explainer Space'}
                </span>
              </div>
              <div className="stat">
                <span className="stat-num text-[#ff8175]">7+ Yrs</span>
                <span className="stat-label">
                  {language === 'NE' ? 'प्रविधि अनुभव' : 'Tech Experience'}
                </span>
              </div>
            </div>

            {/* Dhruv Rathee Editorial Awards List (.awards) */}
            <div className="awards">
              
              {/* Award / Milestone 1 */}
              <div className="award group">
                <div className="award-year">2024</div>
                <div>
                  <b className="group-hover:text-[#ff8175] transition-colors flex items-center gap-2">
                    <span>Founder & CEO — AI Clipzone</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#e4342f] opacity-80" />
                  </b>
                  <span>
                    {language === 'NE'
                      ? 'एआई क्लिपजोन (https://aiclipzone.vercel.app/) को स्थापना तथा सञ्चालन – एआई टुल्स र आधुनिक डिजिटल सेवाहरूको हब।'
                      : 'Founded and launched AI Clipzone (aiclipzone.vercel.app), leading next-gen artificial intelligence tools curation & modern web platforms.'}
                  </span>
                </div>
              </div>

              {/* Award / Milestone 2 */}
              <div className="award group">
                <div className="award-year">2023</div>
                <div>
                  <b className="group-hover:text-[#ff8175] transition-colors">
                    {language === 'NE'
                      ? '+२ व्यवस्थापन तथा एआई वेब विकास'
                      : '+2 Management & AI Web Architecture'}
                  </b>
                  <span>
                    {language === 'NE'
                      ? 'डेसिमल कलेज, वीरगञ्जमा +२ व्यवस्थापन अध्ययनसँगै तीव्र गतिका आधुनिक वेबसाइटहरूको सफल विकास।'
                      : 'Decimal College, Birgunj. Pursuing higher management studies alongside architecting bespoke high-performance web systems.'}
                  </span>
                </div>
              </div>

              {/* Award / Milestone 3 */}
              <div className="award group">
                <div className="award-year">2022</div>
                <div>
                  <b className="group-hover:text-[#ff8175] transition-colors">
                    {language === 'NE'
                      ? 'माध्यमिक शिक्षा (SEE उत्तीर्ण)'
                      : 'Secondary Education Examination (SEE)'}
                  </b>
                  <span>
                    {language === 'NE'
                      ? 'श्री जिल्ला उचङ्गल रामदेव कलवार माध्यमिक विद्यालयबाट माध्यमिक शिक्षा उत्तीर्ण गरी कम्प्युटर प्रविधिमा समर्पित।'
                      : 'Graduated from Shree Zilla Uchangal Ramdev Kalwar Secondary School with early passion for software, web, and technology.'}
                  </span>
                </div>
              </div>

            </div>

            {/* Philosophy Quote */}
            <div className="p-5 rounded-[18px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,240,238,0.08)]">
              <p className="font-serif italic text-base sm:text-lg text-[#f6f3f2]/90 leading-snug">
                "{language === 'NE' ? about.mottoNe : about.mottoEn}"
              </p>
              <div className="mt-2 text-xs text-[#ff8175] font-semibold">
                — Rajababu Mehta (Founder & CEO, AI Clipzone)
              </div>
            </div>

            {/* Dhruv Rathee Disclaimer / Footnote (.who-note) */}
            <p className="who-note">
              {language === 'NE'
                ? '* सबै तथ्यांक र आधिकारिक विवरणहरू सार्वजनिक पोर्टफोलियो तथा एआई क्लिपजोन (aiclipzone.vercel.app) बाट प्रमाणित।'
                : '* Figures and credentials are verified from public portfolio records and AI Clipzone (aiclipzone.vercel.app).'}
            </p>

          </div>

        </div>

        {/* ========================================================
           FEATURED PLATFORM SHOWCASE CARD (.ac - DR ACADEMY STYLE)
           Showcasing AI Clipzone (Founder & CEO)
           ======================================================== */}
        <div className="ac">
          <div className="relative z-10 max-w-3xl">
            <div className="ac-tag">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'NE' ? 'आधिकारिक प्लेटफर्म • संस्थापक तथा सीईओ' : 'Featured Platform • Founder & CEO'}</span>
            </div>

            <h3 className="ac-h">
              AI Clipzone — <span className="font-serif italic font-normal text-[#e4342f]">
                {language === 'NE' ? 'आधुनिक एआई हब' : 'Next-Gen AI Platform'}
              </span>
            </h3>

            <p className="ac-p">
              {language === 'NE'
                ? 'राजाबाबु मेहताद्वारा स्थापित तथा सञ्चालित एआई क्लिपजोन (AI Clipzone) – आधुनिक आर्टिफिसियल इन्टेलिजेन्स, उपयोगी डिजिटल टुल्स तथा रचनात्मक वेबसाइट समाधानहरूको अग्रणी अनलाइन केन्द्र।'
                : 'Founded and led by Rajababu Mehta, AI Clipzone is an interactive platform curating the most powerful artificial intelligence tools, web solutions, and digital resources for creators, businesses, and learners.'}
            </p>

            <div className="ac-meta">
              <span className="ac-chip">Founder: Rajababu Mehta</span>
              <span className="ac-chip">URL: aiclipzone.vercel.app</span>
              <span className="ac-chip">Status: Live & Verified</span>
              <span className="ac-chip">Birgunj, Nepal</span>
            </div>

            <a
              href="https://aiclipzone.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="ac-btn"
            >
              <span>{language === 'NE' ? 'AI Clipzone खोल्नुहोस्' : 'Visit AI Clipzone'}</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* Lightbox / Zoom Modal for full photo viewing */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#101216] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhotoModal}
              alt="Rajababu Mehta"
              className="max-h-[85vh] w-auto max-w-full object-contain mx-auto block"
            />
          </div>
        </div>
      )}
    </section>
  );
};
