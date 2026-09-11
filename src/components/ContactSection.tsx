import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Clock,
  Sparkles,
  Code,
  Globe,
  Zap,
  MessageCircle,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Layers,
  ArrowRight,
  Smartphone,
  FileCode,
} from 'lucide-react';
import { ContactSettings, Language } from '../types';

interface ContactSectionProps {
  language: Language;
  contact: ContactSettings;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  language,
  contact,
  onShowToast,
}) => {
  // Navigation / View Tabs
  const [activeTab, setActiveTab] = useState<'planner' | 'deliverables' | 'faq'>('planner');

  // Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderSubject, setSenderSubject] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Copied states
  const [copiedType, setCopiedType] = useState<'email' | 'phone' | 'location' | null>(null);

  // Live Nepal Time (GMT+5:45)
  const [nepalTime, setNepalTime] = useState<string>('');

  useEffect(() => {
    const updateNepalTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setNepalTime(formatter.format(now));
      } catch {
        setNepalTime('Nepal (GMT+5:45)');
      }
    };

    updateNepalTime();
    const interval = setInterval(updateNepalTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Expanded FAQ items
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleCopy = (text: string, type: 'email' | 'phone' | 'location') => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // fallback
    }
    setCopiedType(type);
    onShowToast(
      language === 'NE' ? 'क्लिपबोर्डमा प्रतिलिपि गरियो!' : 'Copied to clipboard!',
      'success'
    );
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Compile WhatsApp pre-filled message based on contact inputs
  const generateWhatsAppMessage = () => {
    let text = `Hello Rajababu Mehta,\nI am contacting you from your official website (rajababumehta.com.np):\n\n`;
    if (senderName.trim()) {
      text += `• Name: ${senderName.trim()}\n`;
    }
    if (senderEmail.trim()) {
      text += `• Contact: ${senderEmail.trim()}\n`;
    }
    if (senderSubject.trim()) {
      text += `• Subject: ${senderSubject.trim()}\n`;
    }
    if (senderMessage.trim()) {
      text += `• Message: ${senderMessage.trim()}\n`;
    }

    return encodeURIComponent(text);
  };

  const handleDirectWhatsAppClick = () => {
    const message = generateWhatsAppMessage();
    const cleanNumber = contact.whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/977${cleanNumber}?text=${message}`;
    window.open(url, '_blank');
    onShowToast(
      language === 'NE'
        ? 'ह्वाट्सएप खुल्दैछ... तपाईँको विवरण स्वचालित रूपमा भरिएको छ!'
        : 'Launching WhatsApp with your pre-filled project blueprint!',
      'info'
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    onShowToast(
      language === 'NE'
        ? 'सन्देश सफलतापूर्वक प्राप्त भयो! राजाबाबु मेहताले चाँडै सम्पर्क गर्नुहुनेछ।'
        : 'Inquiry received! Rajababu Mehta will review your specifications and reply promptly.',
      'success'
    );
  };

  const deliverablesList = [
    {
      titleEn: 'Next-Gen Frontend Architecture',
      titleNe: 'आधुनिक फ्रन्टएन्ड संरचना',
      descEn: 'Built with React 19, Tailwind CSS, and Vite. Smooth transitions, sub-second load speeds, zero boilerplate clunkiness.',
      descNe: 'रियाक्ट र टेलविन्ड सीएसएसमा आधारित। तीव्र गतिमा खुल्ने र उच्च गुणस्तरको आधुनिक कोड संरचना।',
      icon: Code,
    },
    {
      titleEn: 'Pixel-Perfect Mobile Responsiveness',
      titleNe: 'उत्कृष्ट मोबाइल अनुकूलता',
      descEn: 'Engineered from 320px smartphones to ultra-wide 4K monitors. Fluid layouts and comfortable tap targets.',
      descNe: 'सबै किसिमका स्मार्टफोन, ट्याब्लेट र कम्प्युटरमा स्पष्ट र चिटिक्क देखिने डिजाइन।',
      icon: Smartphone,
    },
    {
      titleEn: 'Search Engine & Social Discovery',
      titleNe: 'सर्च इन्जिन तथा सामाजिक सञ्जाल अप्टिमाइजेसन',
      descEn: 'Comprehensive Schema.org JSON-LD, sitemap.xml, robots.txt, and Open Graph previews for Facebook/WhatsApp sharing.',
      descNe: 'गुगल सर्च र फेसबुक, ह्वाट्सएप सेयरिङका लागि आवश्यक सबै मेटा ट्याग तथा साइटम्याप सेटअप।',
      icon: Globe,
    },
    {
      titleEn: 'Instant Turnkey Deployment',
      titleNe: 'सहज डोमेन र होस्टिङ व्यवस्थापन',
      descEn: 'Free assistance connecting your custom domain (e.g. .com, .com.np) with HTTPS SSL security certificate included.',
      descNe: 'कस्टम डोमेन जोड्न सहयोग र निःशुल्क एसएसएल (SSL) सुरक्षा प्रमाणपत्रको व्यवस्था।',
      icon: ShieldCheck,
    },
  ];

  const faqItems = [
    {
      questionEn: 'How do we start a website project together?',
      questionNe: 'हामी सँगै वेबसाइट निर्माण कार्य कसरी सुरु गर्छौं?',
      answerEn: 'Simply drop a message here or connect directly on WhatsApp (9816689232). Share your requirements, logo or ideas. Rajababu will propose a clean design preview, and once approved, build and deploy the complete website.',
      answerNe: 'तपाईँ यहाँ फारम भरेर वा सिधै ह्वाट्सएप (९८१६६८९२३२) मा सम्पर्क गर्न सक्नुहुन्छ। आफ्नो आवश्यकता र विचार सुनाउनुहोस्, उपयुक्त डिजाइन तयार गरी पूर्ण वेबसाइट अनलाइन गरिनेछ।',
    },
    {
      questionEn: 'Can I request custom features like Nepali language or WhatsApp checkout?',
      questionNe: 'के नेपाली भाषा वा ह्वाट्सएप अर्डर प्रणाली थप्न सकिन्छ?',
      answerEn: 'Yes, absolutely! Every website is custom-crafted to your specific goals, including bilingual Nepali/English switches, direct WhatsApp lead buttons, image galleries, and inquiry forms.',
      answerNe: 'अवश्य सकिन्छ! तपाईँको आवश्यकता अनुसार नेपाली र अंग्रेजी दुवै भाषा, ह्वाट्सएप सिधा अर्डर, तस्बिर ग्यालरी र सम्पर्क फारमहरू समावेश गर्न सकिन्छ।',
    },
    {
      questionEn: 'Are you available for clients outside Birgunj or Nepal?',
      questionNe: 'के वीरगञ्ज बाहिर वा देश बाहिरका ग्राहकहरूका लागि पनि काम गर्नुहुन्छ?',
      answerEn: 'Yes! Remote collaboration is smooth and seamless via WhatsApp, Google Meet, and Email. Projects can be coordinated from anywhere in Nepal or internationally.',
      answerNe: 'हो! ह्वाट्सएप, गुगल मिट र इमेल मार्फत नेपालभर वा विदेशमा रहेका सेवाग्राहीहरूसँग पनि सहज रूपमा अनलाइन सहकार्य गर्न सकिन्छ।',
    },
    {
      questionEn: 'What is your AI Explainer role?',
      questionNe: 'एआई व्याख्याकर्ता (AI Explainer) को भूमिका के हो?',
      answerEn: 'As an AI enthusiast and student, Rajababu simplifies artificial intelligence tools, prompt workflows, and practical generative applications for students, creators, and local businesses looking to boost productivity.',
      answerNe: 'विद्यार्थी तथा प्रविधि अन्वेषकको रूपमा, राजाबाबु मेहताले नयाँ एआई प्रविधिहरू, प्रम्प्ट इन्जिनियरिङ र उपयोगी डिजिटल उपकरणहरूलाई सरल भाषामा बुझाउने काम गर्नुहुन्छ।',
    },
  ];

  return (
    <section id="services" className="py-20 sm:py-28 bg-slate-950 relative border-t border-slate-900 overflow-hidden scroll-mt-24">
      <div id="contact" className="absolute -top-24" />
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading & Live Status Indicator */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          
          {/* Status Badge + Live Birgunj Clock */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                {language === 'NE'
                  ? 'नयाँ वेबसाइट परियोजनाका लागि उपलब्ध'
                  : 'Available for New Website Projects'}
              </span>
            </div>

            {nepalTime && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Birgunj: {nepalTime}</span>
              </div>
            )}
          </div>

          {Boolean(
            (language === 'NE' ? contact.headingNe : contact.headingEn) &&
            !contact.headingEn?.includes('Visionary') &&
            !contact.headingEn?.includes('Collaborate')
          ) && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight max-w-3xl mb-4">
              {language === 'NE' ? contact.headingNe : contact.headingEn}
            </h2>
          )}
          
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            {language === 'NE' ? contact.subheadingNe : contact.subheadingEn}
          </p>

          {/* Premium Value Props Pill Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-6 text-xs text-slate-400">
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
              <span>{language === 'NE' ? 'द्रुत प्रतिक्रिया' : 'Fast Response'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'NE' ? 'भरपर्दो प्राविधिक सहयोग' : 'Reliable Ongoing Support'}</span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <button
              onClick={() => setActiveTab('planner')}
              id="tab-btn-planner"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'planner'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{language === 'NE' ? 'सम्पर्क तथा सन्देश' : 'Contact & Inquiry'}</span>
            </button>

            <button
              onClick={() => setActiveTab('deliverables')}
              id="tab-btn-deliverables"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'deliverables'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>{language === 'NE' ? 'हामी के प्रदान गर्छौं' : 'Web Deliverables & Standards'}</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              id="tab-btn-faq"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'faq'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{language === 'NE' ? 'प्रायः सोधिने प्रश्नहरू' : 'FAQ & Process'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Project Planner & Messaging Hub */}
        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Direct Contact Hub & Instant Connect Cards */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* WhatsApp VIP Direct Action Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden group">
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        {language === 'NE' ? 'द्रुत प्रतिक्रिया' : 'Fastest Response'}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
                        {language === 'NE' ? 'ह्वाट्सएप सिधा च्याट' : 'WhatsApp Direct Chat'}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(contact.phone, 'phone')}
                    className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                    title="Copy WhatsApp number"
                  >
                    {copiedType === 'phone' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {language === 'NE'
                    ? 'कुनै पनि सोधपुछ वा वेबसाइट छलफलका लागि ९८१६६८९२३२ मा सिधै ह्वाट्सएप सन्देश पठाउनुहोस्।'
                    : 'Chat directly on WhatsApp to discuss your website scope, pricing, or ideas with zero wait time.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={handleDirectWhatsAppClick}
                    id="btn-whatsapp-blueprint"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.01]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{language === 'NE' ? 'ह्वाट्सएपमा सिधै च्याट गर्नुहोस्' : 'Chat on WhatsApp (9816689232)'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`tel:+977${contact.phone.replace(/[^0-9]/g, '')}`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              </div>

              {/* Email Card */}
              <div
                onClick={() => handleCopy(contact.email, 'email')}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        {language === 'NE' ? 'इमेल सम्पर्क' : 'Email Address'}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {contact.email}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-slate-200 border border-slate-800">
                    {copiedType === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Location Card */}
              <div
                onClick={() => handleCopy(language === 'NE' ? contact.locationNe : contact.locationEn, 'location')}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        {language === 'NE' ? 'स्थान' : 'Location & Headquarters'}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                        {language === 'NE' ? contact.locationNe : contact.locationEn}
                      </div>
                      <span className="text-[11px] text-slate-500">Madhesh Province, Nepal</span>
                    </div>
                  </div>
                  <button className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-slate-200 border border-slate-800">
                    {copiedType === 'location' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Social Channels Row */}
              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {language === 'NE' ? 'सामाजिक सञ्जालमा जोडिनुहोस्' : 'Connect on Social Platforms'}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {contact.facebookUrl && (
                    <a
                      href={contact.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500 text-xs font-medium text-slate-200 transition-all"
                    >
                      <span>Facebook</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                  {contact.instagramUrl && (
                    <a
                      href={contact.instagramUrl.startsWith('http') ? contact.instagramUrl : `https://www.instagram.com/${contact.instagramUrl.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-pink-600/20 border border-slate-800 hover:border-pink-500 text-xs font-medium text-slate-200 transition-all"
                    >
                      <span>Instagram (@mr.rajababumehta)</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Project Planner & Blueprint Dispatcher */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-9 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-2xl relative">
                
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-100 mb-2 font-heading">
                      {language === 'NE' ? 'सन्देश तथा विवरण प्राप्त भयो!' : 'Project Blueprint Received!'}
                    </h4>
                    <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                      {language === 'NE'
                        ? 'तपाईँको परियोजना विवरण सफलतापूर्वक सुरक्षित गरिएको छ। राजाबाबु मेहताले छिट्टै इमेल वा ह्वाट्सएप मार्फत सम्पर्क गर्नुहुनेछ।'
                        : 'Thank you for reaching out! Rajababu Mehta has received your project specifications and will review the timeline and requirements promptly.'}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={handleDirectWhatsAppClick}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{language === 'NE' ? 'ह्वाट्सएपमा पनि पठाउनुहोस्' : 'Also Send on WhatsApp for Faster Reply'}</span>
                      </button>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        {language === 'NE' ? 'नयाँ फारम खोल्नुहोस्' : 'Create Another Inquiry'}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          {language === 'NE' ? 'तपाईँको नाम' : 'Your Name'} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={language === 'NE' ? 'उदा. रोशन अधिकारी' : 'e.g. Roshan Sharma'}
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          {language === 'NE' ? 'इमेल वा फोन नम्बर' : 'Email or Phone Number'} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="you@email.com or 98XXXXXXXX"
                          value={senderEmail}
                          onChange={(e) => setSenderEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {language === 'NE' ? 'विषय' : 'Subject'}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          language === 'NE'
                            ? 'उदा. नयाँ वेबसाइट, एआई परामर्श, वा अन्य'
                            : 'e.g. New Website, AI Inquiry, Collaboration'
                        }
                        value={senderSubject}
                        onChange={(e) => setSenderSubject(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {language === 'NE' ? 'सन्देश वा परियोजना विवरण' : 'Message or Project Details'} *
                      </label>
                      <textarea
                        rows={4}
                        required
                        placeholder={
                          language === 'NE'
                            ? 'तपाईँको सन्देश वा परियोजनाको आवश्यकता यहाँ लेख्नुहोस्...'
                            : 'Tell Rajababu about your website idea, requirements, questions, or timeline...'
                        }
                        value={senderMessage}
                        onChange={(e) => setSenderMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Dual Action Dispatch Bar */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        id="btn-contact-submit"
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Send className="w-4 h-4" />
                        <span>{language === 'NE' ? 'अनलाइन सन्देश पठाउनुहोस्' : 'Send Message'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDirectWhatsAppClick}
                        id="btn-contact-whatsapp-instant"
                        className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-700/20 hover:scale-[1.01]"
                        title="Send this message directly to WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-200" />
                        <span>{language === 'NE' ? 'ह्वाट्सएपमा सिधै पठाउनुहोस्' : 'Send via WhatsApp'}</span>
                      </button>
                    </div>

                  </form>
                )}

              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Web Deliverables & Technical Standards Showcase */}
        {activeTab === 'deliverables' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {deliverablesList.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-100 font-heading mb-2">
                        {language === 'NE' ? item.titleNe : item.titleEn}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {language === 'NE' ? item.descNe : item.descEn}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-1 text-[11px] font-semibold text-blue-400">
                      <span>{language === 'NE' ? 'पूर्ण रूपमा समावेश' : 'Included by Default'}</span>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Turnkey Process Workflow Steps */}
            <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800">
              <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-heading mb-6 text-center">
                {language === 'NE' ? 'वेबसाइट निर्माणको ४-चरण प्रक्रिया' : 'The 4-Step Seamless Website Workflow'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: '01',
                    titleEn: 'Requirement & Concept',
                    titleNe: 'आवश्यकता र अवधारणा',
                    descEn: 'Connect on WhatsApp (9816689232) to finalize pages, brand colors, and core objectives.',
                    descNe: 'ह्वाट्सएपमा कुराकानी गरी पृष्ठ संख्या, ब्रान्ड र लक्ष्य निर्धारण गरिन्छ।',
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
                ].map((st, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-xl font-extrabold text-blue-500 font-heading block mb-1">
                      {st.step}
                    </span>
                    <h5 className="text-xs font-bold text-slate-200 mb-1">
                      {language === 'NE' ? st.titleNe : st.titleEn}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {language === 'NE' ? st.descNe : st.descEn}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setActiveTab('planner')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  <span>{language === 'NE' ? 'अहिले नै सुरु गर्नुहोस्' : 'Start Your Project Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Interactive FAQ Accordion */}
        {activeTab === 'faq' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-3.5"
          >
            {faqItems.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold font-heading">
                      {language === 'NE' ? faq.questionNe : faq.questionEn}
                    </span>
                    <div className="p-1 rounded-lg bg-slate-950 text-slate-400">
                      {isOpen ? <ChevronDown className="w-4 h-4 rotate-180 transition-transform" /> : <ChevronDown className="w-4 h-4 transition-transform" />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 border-t border-slate-800/60 leading-relaxed">
                      {language === 'NE' ? faq.answerNe : faq.answerEn}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Action Footer in FAQ */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center mt-8">
              <h4 className="text-sm font-bold text-slate-200 mb-2">
                {language === 'NE' ? 'अन्य कुनै प्रश्न छ?' : 'Have a custom question or specific idea?'}
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                {language === 'NE'
                  ? 'राजाबाबु मेहतालाई सिधै सम्पर्क गर्न सक्नुहुन्छ।'
                  : 'Reach out directly to Rajababu Mehta for quick, honest advice.'}
              </p>
              <button
                onClick={() => {
                  setActiveTab('planner');
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'NE' ? 'सम्पर्क फारममा जानुहोस्' : 'Send Project Inquiry'}</span>
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
};
