import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { Language, ContactSettings } from '../types';

interface FaqSectionProps {
  language: Language;
  contact?: ContactSettings;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  language,
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqItems = [
    {
      questionEn: 'Who is the Founder of AI Clipzone?',
      questionNe: 'एआई क्लिपजोन (AI Clipzone) का संस्थापक को हुनुहुन्छ?',
      answerEn:
        'Rajababu Mehta is the Founder of AI Clipzone (https://aiclipzone.vercel.app/). He is an AI Website Developer, AI Explainer, and Student based in Birgunj, Nepal who architected, launched, and leads the AI Clipzone platform.',
      answerNe:
        'राजाबाबु मेहता एआई क्लिपजोन (AI Clipzone - https://aiclipzone.vercel.app/) का संस्थापक (Founder) हुनुहुन्छ। उहाँ वीरगञ्ज, नेपालका एक समर्पित एआई वेबसाइट डेभलपर, एआई व्याख्याकर्ता तथा विद्यार्थी हुनुहुन्छ जसले एआई क्लिपजोन प्लेटफर्मको स्थापना र नेतृत्व गर्नुभएको हो।',
      categoryEn: 'Founder',
      categoryNe: 'संस्थापक',
      linkUrl: 'https://aiclipzone.vercel.app/',
    },
    {
      questionEn: 'How do we start a website project together?',
      questionNe: 'हामी सँगै वेबसाइट निर्माण कार्य कसरी सुरु गर्छौं?',
      answerEn:
        'Simply drop a message in the Contact form below with your requirements, logo, or rough ideas. Rajababu will understand your vision, propose a clean design plan, and once approved, build and deploy the complete website.',
      answerNe:
        'तपाईँ तलको सम्पर्क फारम भरेर आफ्नो व्यवसायको आवश्यकता, लोगो वा विचार पठाउन सक्नुहुन्छ। तपाईँको आवश्यकता अनुसार डिजाइन तयार गरी पूर्ण वेबसाइट अनलाइन गरिनेछ।',
      categoryEn: 'Getting Started',
      categoryNe: 'सुरुवात',
    },
    {
      questionEn: 'Can I request custom features like Nepali language or online inquiry forms?',
      questionNe: 'के नेपाली भाषा वा अनलाइन सोधपुछ फारम प्रणाली थप्न सकिन्छ?',
      answerEn:
        'Yes, absolutely! Every website is custom-crafted to your specific goals. You can request bilingual Nepali/English switches, direct lead inquiry buttons, image galleries, Google Maps directions, and custom contact forms tailored to your customers.',
      answerNe:
        'अवश्य सकिन्छ! तपाईँको आवश्यकता अनुसार नेपाली र अंग्रेजी दुवै भाषा, सोधपुछ प्रणाली, तस्बिर ग्यालरी, गुगल म्याप र ग्राहक सोधपुछ फारमहरू समावेश गर्न सकिन्छ।',
      categoryEn: 'Custom Features',
      categoryNe: 'अनुकूलित विशेषताहरू',
    },
    {
      questionEn: 'How long does it take to deliver a completed website?',
      questionNe: 'वेबसाइट तयार हुन कति समय लाग्छ?',
      answerEn:
        'A standard high-performance business website or portfolio is typically delivered within 3 to 7 business days once content and details are finalized. Turnaround is prompt with real-time updates provided along the way.',
      answerNe:
        'आवश्यक सामग्री र जानकारी प्राप्त भएपछि सामान्यतया ३ देखि ७ दिनभित्र पूर्ण आधुनिक वेबसाइट तयार गरी अनलाइन गरिन्छ। कामको हरेक चरणमा तपाईँलाई अपडेट गराइन्छ।',
      categoryEn: 'Timeline',
      categoryNe: 'समय तालिका',
    },
    {
      questionEn: 'Are you available for clients outside Birgunj or Nepal?',
      questionNe: 'के वीरगञ्ज बाहिर वा देश बाहिरका ग्राहकहरूका लागि पनि काम गर्नुहुन्छ?',
      answerEn:
        'Yes! Remote collaboration is smooth and seamless via Google Meet and online communication. Projects can be coordinated seamlessly from Kathmandu, Pokhara, across Nepal, or international locations.',
      answerNe:
        'हो! गुगल मिट तथा अनलाइन सञ्चार मार्फत काठमाडौँ, पोखरा, नेपालभर तथा विदेशमा रहेका सेवाग्राहीहरूसँग पनि सहज रूपमा अनलाइन सहकार्य गर्न सकिन्छ।',
      categoryEn: 'Collaboration',
      categoryNe: 'सहकार्य',
    },
    {
      questionEn: 'Will my website work well on mobile phones and rank on Google?',
      questionNe: 'के मेरो वेबसाइट मोबाइलमा राम्रोसँग खुल्छ र गुगलमा देखिन्छ?',
      answerEn:
        'Yes, 100%! All websites are engineered with mobile-first responsiveness, tested from compact smartphones to ultra-wide displays. Comprehensive Schema.org markup, SEO meta tags, and sitemaps are integrated so Google and social networks index your brand cleanly.',
      answerNe:
        'हो, १००%! सबै वेबसाइटहरू मोबाइल र कम्प्युटर दुवैका लागि उपयुक्त र तीव्र गतिमा खुल्ने गरी बनाइन्छ। साथै गुगल सर्च र सामाजिक सञ्जालमा सहजै भेटिन आवश्यक सम्पूर्ण एसईओ (SEO) मापदण्ड पूरा गरिन्छ।',
      categoryEn: 'Mobile & SEO',
      categoryNe: 'मोबाइल र एसईओ',
    },
    {
      questionEn: 'What is your AI Explainer role and how does it help clients?',
      questionNe: 'एआई व्याख्याकर्ता (AI Explainer) को भूमिका के हो र यसले ग्राहकलाई के फाइदा हुन्छ?',
      answerEn:
        'As an AI enthusiast and student, Rajababu simplifies artificial intelligence tools, prompt workflows, and practical generative applications for students, creators, and businesses to automate repetitive tasks and boost daily productivity.',
      answerNe:
        'विद्यार्थी तथा प्रविधि अन्वेषकको रूपमा, राजाबाबु मेहताले नयाँ एआई प्रविधिहरू, प्रम्प्ट इन्जिनियरिङ र उपयोगी डिजिटल उपकरणहरूलाई सरल भाषामा बुझाउने काम गर्नुहुन्छ, जसले व्यवसायको काम छिटो र प्रभावकारी बनाउँछ।',
      categoryEn: 'AI Advisory',
      categoryNe: 'एआई परामर्श',
    },
  ];

  return (
    <section
      id="faq"
      className="py-20 sm:py-28 bg-[#0a0b0e] relative border-t border-[rgba(255,240,238,0.08)] overflow-hidden scroll-mt-20"
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header matching dhruvrathee.com (.sh) */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold tracking-widest uppercase text-[#f6f3f2]/50">
            <span className="w-2 h-2 rounded-full bg-[#e4342f]" />
            <span>{language === 'NE' ? 'प्रक्रिया र उत्तर' : 'Clear Answers'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] text-[#f6f3f2]">
            {language === 'NE' ? (
              <>
                प्रायः सोधिने <span className="font-serif italic font-normal text-[#e4342f]">प्रश्न तथा उत्तर</span>
              </>
            ) : (
              <>
                Frequently Asked <span className="font-serif italic font-normal text-[#e4342f]">Questions</span>
              </>
            )}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#f6f3f2]/70 max-w-2xl leading-relaxed">
            {language === 'NE'
              ? 'परियोजना सुरु गर्ने प्रक्रिया, समय, मोबाइल अनुकूलता र सहकार्य सम्बन्धी सबै विवरणहरू यहाँ पाउन सक्नुहुन्छ।'
              : 'Everything you need to know about starting a project, technical standards, project timelines, and remote communication.'}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5 max-w-4xl">
          {faqItems.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={index}
                className={`rounded-[20px] border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#101216] border-[#e4342f]/40 shadow-[0_16px_40px_-15px_rgba(0,0,0,0.8)]'
                    : 'bg-[#101216]/60 border-[rgba(255,240,238,0.08)] hover:border-[rgba(255,240,238,0.18)] hover:bg-[#101216]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 text-[#f6f3f2] hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="font-serif italic text-base sm:text-lg text-[#e4342f] font-normal shrink-0">
                      0{index + 1}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#f6f3f2]">
                      {language === 'NE' ? faq.questionNe : faq.questionEn}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-lg border transition-all shrink-0 flex items-center justify-center ${
                      isOpen
                        ? 'bg-[#e4342f] border-[#e4342f] text-white rotate-180 shadow-[0_2px_10px_rgba(228,52,47,0.6)]'
                        : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,240,238,0.08)] text-[#f6f3f2]/60'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-[#f6f3f2]/75 border-t border-[rgba(255,240,238,0.06)] leading-relaxed space-y-3">
                        <p>{language === 'NE' ? faq.answerNe : faq.answerEn}</p>
                        
                        {faq.linkUrl && (
                          <div>
                            <a
                              href={faq.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#e4342f] hover:bg-[#ff3d38] text-white text-xs font-bold transition-all shadow-md shadow-[#e4342f]/30"
                            >
                              <span>{language === 'NE' ? 'AI Clipzone खोल्नुहोस्' : 'Visit AI Clipzone'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-[#f6f3f2]/40 pt-1">
                          <span>{language === 'NE' ? 'वर्ग:' : 'Category:'}</span>
                          <span className="text-[#ff8175] font-semibold">
                            {language === 'NE' ? faq.categoryNe : faq.categoryEn}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact CTA under FAQ */}
        <div className="mt-12">
          <p className="text-[#f6f3f2]/60 text-xs sm:text-sm mb-3">
            {language === 'NE'
              ? 'के तपाईँको कुनै अन्य विशेष प्रश्न वा परियोजना सम्बन्धी सोधपुछ छ?'
              : 'Have another specific question or custom website requirement?'}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,240,238,0.12)] text-[#f6f3f2] font-semibold text-xs sm:text-sm transition-all"
          >
            <span>{language === 'NE' ? 'राजाबाबु मेहतालाई सन्देश पठाउनुहोस्' : 'Send a Message to Rajababu Mehta'}</span>
            <span className="text-[#e4342f]">→</span>
          </a>
        </div>

      </div>
    </section>
  );
};
