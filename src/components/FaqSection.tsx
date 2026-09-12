import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Language, ContactSettings } from '../types';

interface FaqSectionProps {
  language: Language;
  contact: ContactSettings;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  language,
  contact,
}) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqItems = [
    {
      questionEn: 'How do we start a website project together?',
      questionNe: 'हामी सँगै वेबसाइट निर्माण कार्य कसरी सुरु गर्छौं?',
      answerEn:
        'Simply drop a message in the Contact form below or connect directly on WhatsApp (9816689232). Share your business requirements, logo, or rough ideas. Rajababu will understand your vision, propose a clean design plan, and once approved, build and deploy the complete website.',
      answerNe:
        'तपाईँ तलको सम्पर्क फारम भरेर वा सिधै ह्वाट्सएप (९८१६६८९२३२) मा सम्पर्क गर्न सक्नुहुन्छ। आफ्नो व्यवसायको आवश्यकता, लोगो वा विचार सुनाउनुहोस्। तपाईँको आवश्यकता अनुसार डिजाइन तयार गरी पूर्ण वेबसाइट अनलाइन गरिनेछ।',
      categoryEn: 'Getting Started',
      categoryNe: 'सुरुवात',
    },
    {
      questionEn: 'Can I request custom features like Nepali language or WhatsApp checkout?',
      questionNe: 'के नेपाली भाषा वा ह्वाट्सएप अर्डर प्रणाली थप्न सकिन्छ?',
      answerEn:
        'Yes, absolutely! Every website is custom-crafted to your specific goals. You can request bilingual Nepali/English switches, direct WhatsApp lead buttons, image galleries, Google Maps directions, and custom contact forms tailored to your customers.',
      answerNe:
        'अवश्य सकिन्छ! तपाईँको आवश्यकता अनुसार नेपाली र अंग्रेजी दुवै भाषा, ह्वाट्सएप सिधा अर्डर, तस्बिर ग्यालरी, गुगल म्याप र ग्राहक सोधपुछ फारमहरू समावेश गर्न सकिन्छ।',
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
        'Yes! Remote collaboration is smooth and seamless via WhatsApp, Google Meet, and Email. Projects can be coordinated seamlessly from Kathmandu, Pokhara, across Nepal, or international locations.',
      answerNe:
        'हो! ह्वाट्सएप, गुगल मिट र इमेल मार्फत काठमाडौँ, पोखरा, नेपालभर तथा विदेशमा रहेका सेवाग्राहीहरूसँग पनि सहज रूपमा अनलाइन सहकार्य गर्न सकिन्छ।',
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

  const handleWhatsAppContact = () => {
    const cleanNumber = contact.whatsappNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      'Namaste Rajababu! I have a question regarding a website project.'
    );
    window.open(`https://wa.me/977${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <section
      id="faq"
      className="py-24 sm:py-32 bg-slate-950 relative border-t border-slate-900 overflow-hidden scroll-mt-20"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[250px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              {language === 'NE' ? 'प्रायः सोधिने प्रश्न तथा प्रक्रिया' : 'FAQ & Process Guide'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight max-w-2xl mb-4">
            {language === 'NE'
              ? 'तपाईँका जिज्ञासाहरूको स्पष्ट उत्तर'
              : 'Clear Answers to Frequent Inquiries'}
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            {language === 'NE'
              ? 'परियोजना सुरु गर्ने प्रक्रिया, समय, मोबाइल अनुकूलता र सहकार्य सम्बन्धी सबै विवरणहरू यहाँ पाउन सक्नुहुन्छ।'
              : 'Everything you need to know about starting a project, technical standards, project timelines, and remote communication.'}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 mb-16">
          {faqItems.map((faq, index) => {
            const isOpen = expandedFaq === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/90 border-blue-500/40 shadow-xl shadow-blue-950/20'
                    : 'bg-slate-900/50 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-400 font-mono hidden sm:inline-block">
                      0{index + 1}
                    </span>
                    <span className="text-base sm:text-lg font-bold font-heading">
                      {language === 'NE' ? faq.questionNe : faq.questionEn}
                    </span>
                  </div>
                  <div
                    className={`p-2 rounded-xl border transition-all shrink-0 ${
                      isOpen
                        ? 'bg-blue-600/20 border-blue-500/30 text-blue-400 rotate-180'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
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
                      <div className="px-5 sm:px-6 pb-6 pt-2 text-sm text-slate-300 border-t border-slate-800/80 leading-relaxed">
                        <p>{language === 'NE' ? faq.answerNe : faq.answerEn}</p>
                        <div className="mt-4 flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            {language === 'NE' ? 'वर्ग:' : 'Category:'}
                          </span>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
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

        {/* Quick Question CTA Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 shadow-2xl text-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 text-blue-400 mb-4 border border-blue-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading mb-2">
            {language === 'NE' ? 'अन्य कुनै विशेष प्रश्न वा विचार छ?' : 'Have a Specific Question or Custom Idea?'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-6 leading-relaxed">
            {language === 'NE'
              ? 'आफ्नो आवश्यकता अनुसार सिधै छलफल गर्न राजाबाबु मेहतालाई सन्देश पठाउनुहोस् वा तलको फारम प्रयोग गर्नुहोस्।'
              : 'Direct consultation is completely free. Feel free to discuss your idea on WhatsApp or send a message using the Contact form below.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-blue-600/25"
            >
              <Mail className="w-4 h-4" />
              <span>{language === 'NE' ? 'सम्पर्क फारममा जानुहोस्' : 'Go to Contact Form'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={handleWhatsAppContact}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-bold transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>{language === 'NE' ? 'ह्वाट्सएपमा सोधपुछ' : 'WhatsApp Inquiry'}</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
