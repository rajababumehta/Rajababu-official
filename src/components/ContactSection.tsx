import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  Calendar,
  Sliders,
  CheckSquare,
  Square,
  MessageSquare,
  ArrowRight,
  Send,
  Smartphone,
  Globe,
  Bot,
  Code2,
  CalendarCheck,
  Layers,
  FileText,
  CheckCircle2,
  Headphones,
  Navigation,
} from 'lucide-react';
import { ContactSettings, Language } from '../types';
import { loginAsLocalAdmin } from '../services/firebase';

interface ContactSectionProps {
  language: Language;
  contact: ContactSettings;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  onAdminSecretLogin?: () => void;
}

// Project Presets for Quick Selection
interface ProjectPreset {
  id: string;
  titleEn: string;
  titleNe: string;
  icon: any;
  baseBudgetNpr: string;
  baseBudgetUsd: string;
  defaultTimeline: string;
  features: string[];
}

const PROJECT_PRESETS: ProjectPreset[] = [
  {
    id: 'business',
    titleEn: 'Modern Business Website',
    titleNe: 'आधुनिक व्यापारिक वेबसाइट',
    icon: Globe,
    baseBudgetNpr: 'रु १५,००० - २५,०००+',
    baseBudgetUsd: '$120 - $200+',
    defaultTimeline: '10 - 14 Days',
    features: ['responsive', 'seo', 'whatsapp', 'domain'],
  },
  {
    id: 'portfolio',
    titleEn: 'Personal Brand & Portfolio',
    titleNe: 'व्यक्तिगत ब्राण्ड तथा पोर्टफोलियो',
    icon: Laptop,
    baseBudgetNpr: 'रु १०,००० - १८,०००+',
    baseBudgetUsd: '$80 - $150+',
    defaultTimeline: '5 - 7 Days',
    features: ['responsive', 'seo', 'animations', 'cv_portal'],
  },
  {
    id: 'ai_webapp',
    titleEn: 'AI Explainer & Smart Web App',
    titleNe: 'एआई व्याख्याकर्ता तथा स्मार्ट वेब एप',
    icon: Bot,
    baseBudgetNpr: 'रु २५,००० - ४५,०००+',
    baseBudgetUsd: '$200 - $350+',
    defaultTimeline: '14 - 21 Days',
    features: ['responsive', 'ai_assistant', 'database', 'whatsapp', 'seo'],
  },
  {
    id: 'redesign',
    titleEn: 'Website Redesign & Speedup',
    titleNe: 'वेबसाइट सुधार तथा स्पिड अप्टिमाइजेसन',
    icon: Zap,
    baseBudgetNpr: 'रु ८,००० - १५,०००+',
    baseBudgetUsd: '$60 - $120+',
    defaultTimeline: '3 - 5 Days',
    features: ['seo', 'responsive', 'animations'],
  },
];

interface FeatureOption {
  id: string;
  labelEn: string;
  labelNe: string;
}

const FEATURE_OPTIONS: FeatureOption[] = [
  { id: 'responsive', labelEn: '100% Mobile Responsive Layout', labelNe: '१००% मोबाइल रेस्पोन्सिभ डिजाइन' },
  { id: 'seo', labelEn: 'Search Engine (SEO) & High Speed', labelNe: 'एसईओ तथा उच्च स्पिड अप्टिमाइजेसन' },
  { id: 'whatsapp', labelEn: 'Direct WhatsApp & Lead Capture', labelNe: 'ह्वाट्सएप तथा ग्राहक लिड इन्टिग्रेसन' },
  { id: 'database', labelEn: 'Cloud Firestore Database & CMS', labelNe: 'क्लाउड डाटाबेस तथा एडमिन प्यानल' },
  { id: 'ai_assistant', labelEn: 'AI Explainer / Chatbot Integration', labelNe: 'एआई च्याटबोट तथा स्मार्ट सहयोग' },
  { id: 'domain', labelEn: 'Custom Domain & SSL Hosting Setup', labelNe: 'कस्टम डोमेन तथा सुरक्षित होस्टिङ' },
  { id: 'animations', labelEn: 'Interactive UI Animations', labelNe: 'आधुनिक इन्टर्याक्टिभ एनिमेसनहरू' },
  { id: 'cv_portal', labelEn: 'Downloadable PDF / Media Portal', labelNe: 'डाउनलोड गर्न मिल्ने मिडिया पोर्टल' },
];

function Laptop(props: any) {
  return <Code2 {...props} />;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  language,
  contact,
  onShowToast,
  onAdminSecretLogin,
}) => {
  // Main Tab Navigation: 'estimator' | 'booking' | 'direct'
  const [activeTab, setActiveTab] = useState<'estimator' | 'booking' | 'direct'>('estimator');

  // Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderSubject, setSenderSubject] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('business');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'responsive',
    'seo',
    'whatsapp',
    'domain',
  ]);
  const [selectedTimeline, setSelectedTimeline] = useState<string>('standard');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastGmailUrl, setLastGmailUrl] = useState('');
  const [lastMailtoUrl, setLastMailtoUrl] = useState('');
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');

  // Consultation Booking State
  const [bookingTopic, setBookingTopic] = useState('New Website Planning');
  const [bookingMedium, setBookingMedium] = useState<'WhatsApp Call' | 'Phone Call' | 'Google Meet'>('WhatsApp Call');
  const [bookingTimeSlot, setBookingTimeSlot] = useState('Evening (6:00 PM - 8:30 PM NPT)');
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingNotes, setBookingNotes] = useState('');

  // Copied states
  const [copiedType, setCopiedType] = useState<'email' | 'phone' | 'location' | 'brief' | null>(null);

  // Live Nepal Time (Birgunj, GMT+5:45)
  const [nepalTime, setNepalTime] = useState<string>('');
  const [isOfficeHours, setIsOfficeHours] = useState(true);

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

        // Compute hour in Nepal to show "Active Now" or "Offline / Rapid WhatsApp"
        const nptParts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour: 'numeric',
          hour12: false,
        }).format(now);
        const hour = parseInt(nptParts, 10);
        setIsOfficeHours(hour >= 8 && hour < 22);
      } catch {
        setNepalTime('Nepal (GMT+5:45)');
      }
    };

    updateNepalTime();
    const interval = setInterval(updateNepalTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle preset selection
  const handleSelectPreset = (preset: ProjectPreset) => {
    setSelectedPresetId(preset.id);
    setSelectedFeatures(preset.features);
    setSenderSubject(
      language === 'NE'
        ? `${preset.titleNe} को लागि सोधपुछ`
        : `Inquiry for ${preset.titleEn}`
    );
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleCopy = (text: string, type: 'email' | 'phone' | 'location' | 'brief') => {
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

  // Compile formatted project brief for email or WhatsApp
  const compiledBrief = useMemo(() => {
    const activePreset = PROJECT_PRESETS.find((p) => p.id === selectedPresetId);
    const featureLabels = selectedFeatures
      .map((fId) => FEATURE_OPTIONS.find((f) => f.id === fId)?.labelEn)
      .filter(Boolean)
      .join(', ');

    return `Hello Rajababu Mehta,

PROJECT INQUIRY BRIEF:
• Client Name: ${senderName.trim() || 'Prospective Client'}
• Contact / Email: ${senderEmail.trim() || 'Not specified'}
• Project Category: ${activePreset ? activePreset.titleEn : 'Custom Project'}
• Estimated Investment Tier: ${activePreset ? `${activePreset.baseBudgetNpr} (${activePreset.baseBudgetUsd})` : 'Custom'}
• Desired Timeline: ${selectedTimeline === 'urgent' ? 'Urgent (< 7 Days)' : selectedTimeline === 'standard' ? 'Standard (10 - 14 Days)' : 'Flexible'}
• Selected Key Features: ${featureLabels || 'Standard'}

PROJECT REQUIREMENTS & NOTES:
${senderMessage.trim() || 'I would like to discuss building a website with you. Please let me know your availability.'}

----------------------------------------
Sent from rajababumehta.com.np`;
  }, [senderName, senderEmail, selectedPresetId, selectedFeatures, selectedTimeline, senderMessage]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Secret Admin Verification Trigger
    // Required: Name = "Admin_pannel", Email = "rajababum426@gmail.com", Subject = "Admin_pannel", Message = "Admin_login"
    const trimmedName = senderName.trim();
    const trimmedEmail = senderEmail.trim().toLowerCase();
    const trimmedSubject = senderSubject.trim();
    const trimmedMessage = senderMessage.trim();

    const isSecretAdminMatch =
      (trimmedName === 'Admin_pannel' || trimmedName.toLowerCase() === 'admin_pannel') &&
      trimmedEmail === 'rajababum426@gmail.com' &&
      (trimmedSubject === 'Admin_pannel' || trimmedSubject.toLowerCase() === 'admin_pannel') &&
      (trimmedMessage === 'Admin_login' || trimmedMessage.toLowerCase() === 'admin_login');

    if (isSecretAdminMatch) {
      setSenderName('');
      setSenderEmail('');
      setSenderSubject('');
      setSenderMessage('');

      loginAsLocalAdmin('rajababum426@gmail.com');

      if (onAdminSecretLogin) {
        onAdminSecretLogin();
      }

      onShowToast(
        language === 'NE'
          ? 'गोप्य प्रमाणिकरण सफल भयो! एडमिन प्यानल खुल्दैछ...'
          : 'Secret administrator authentication successful! Welcome to the Admin Panel.',
        'success'
      );
      return;
    }

    const recipientEmail = (contact.email || 'rajababum426@gmail.com').trim();
    const cleanSubject = senderSubject.trim()
      ? `${senderSubject.trim()} - Inquiry from ${senderName.trim() || 'Client'}`
      : `Website Inquiry from ${senderName.trim() || 'Client'}`;

    const encodedSubject = encodeURIComponent(cleanSubject);
    const encodedBody = encodeURIComponent(compiledBrief);

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipientEmail
    )}&su=${encodedSubject}&body=${encodedBody}`;

    const standardMailto = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

    const rawWhatsapp = (contact.whatsappNumber || '9815259426').replace(/[^0-9]/g, '');
    const cleanWhatsapp = rawWhatsapp.startsWith('977') ? rawWhatsapp : `977${rawWhatsapp}`;
    const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
      `Hello Rajababu! I am interested in working with you.\n\n${compiledBrief}`
    )}`;

    setLastGmailUrl(gmailComposeUrl);
    setLastMailtoUrl(standardMailto);
    setLastWhatsAppUrl(waUrl);

    const newWindow = window.open(gmailComposeUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = standardMailto;
    }

    setIsSubmitted(true);
    onShowToast(
      language === 'NE'
        ? `जिमेल खुल्दैछ! तपाईँको सन्देश ${recipientEmail} मा पठाउन तयार छ।`
        : `Opening Gmail to send your message to ${recipientEmail}!`,
      'success'
    );
  };

  // Dispatch consultation booking via WhatsApp or Email
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientEmail = (contact.email || 'rajababum426@gmail.com').trim();
    const rawWhatsapp = (contact.whatsappNumber || '9815259426').replace(/[^0-9]/g, '');
    const cleanWhatsapp = rawWhatsapp.startsWith('977') ? rawWhatsapp : `977${rawWhatsapp}`;

    const bookingBrief = `Hello Rajababu Mehta,

I would like to schedule a discovery consultation with you:

• Name: ${senderName.trim() || 'Client'}
• Contact: ${senderEmail.trim() || 'Not specified'}
• Preferred Topic: ${bookingTopic}
• Preferred Meeting Medium: ${bookingMedium}
• Preferred Date: ${bookingDate}
• Preferred Time: ${bookingTimeSlot}
• Discussion Notes: ${bookingNotes.trim() || 'General website / project inquiry'}

Please confirm if this schedule works for you. Thank you!`;

    if (bookingMedium === 'WhatsApp Call' || bookingMedium === 'Phone Call') {
      const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(bookingBrief)}`;
      window.open(waUrl, '_blank');
      onShowToast(
        language === 'NE'
          ? 'ह्वाट्सएपमा परामर्श अनुरोध पठाइँदैछ...'
          : 'Opening WhatsApp to send your consultation booking request...',
        'success'
      );
    } else {
      const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        recipientEmail
      )}&su=${encodeURIComponent(`Consultation Booking Request - ${senderName.trim() || 'Client'}`)}&body=${encodeURIComponent(
        bookingBrief
      )}`;
      window.open(gmailComposeUrl, '_blank');
      onShowToast(
        language === 'NE'
          ? 'जिमेलमा परामर्श अनुरोध तयार भयो!'
          : 'Consultation booking opened in Gmail!',
        'success'
      );
    }
  };

  const activePreset = PROJECT_PRESETS.find((p) => p.id === selectedPresetId);

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 bg-slate-950 relative border-t border-slate-900 overflow-hidden scroll-mt-20"
    >
      {/* Visual Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-[350px] h-[250px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header & Real-time Live Radar */}
        <div className="flex flex-col items-center text-center mb-14 sm:mb-18">
          
          {/* Top Live Status Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>
                {isOfficeHours
                  ? (language === 'NE' ? 'सक्रिय • नयाँ वेबसाइट परियोजनाका लागि उपलब्ध' : 'Active Now • Available for New Projects')
                  : (language === 'NE' ? 'अहिले अफलाइन • ह्वाट्सएपमा द्रुत जवाफ' : 'Available • Fast Response on WhatsApp')}
              </span>
            </div>

            {nepalTime && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono font-medium backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Birgunj, Nepal: {nepalTime}</span>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'NE' ? 'सम्पर्क तथा परियोजना योजनाकार' : 'Interactive Project Studio & Contact'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight max-w-3xl mb-4">
            {language === 'NE'
              ? 'आफ्नो विचारलाई वास्तविकतामा बदल्नुहोस्'
              : 'Let’s Build Something Truly Exceptional Together'}
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            {language === 'NE'
              ? 'नयाँ वेबसाइट, व्यापारिक ब्रान्डिङ वा एआई सोधपुछका लागि तलको अन्तरक्रियात्मक स्टुडियो प्रयोग गर्नुहोस्।'
              : 'Plan your next website, estimate timelines, schedule a discovery call, or send an instant direct brief.'}
          </p>

          {/* Value Prop Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'NE' ? '२ घण्टाभित्र ह्वाट्सएप प्रतिक्रिया' : '< 2hr WhatsApp Response'}</span>
            </div>
            <span className="text-slate-800 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'NE' ? 'पारदर्शी लगानी र स्पष्ट सर्त' : '100% Transparent Estimates'}</span>
            </div>
            <span className="text-slate-800 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'NE' ? 'सिधै डेभलपरसँग कुराकानी' : 'Direct Developer Collaboration'}</span>
            </div>
            <span className="text-slate-800 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'NE' ? 'निःशुल्क प्रारम्भिक परामर्श' : 'Free 15-Min Discovery Call'}</span>
            </div>
          </div>
        </div>

        {/* Feature Mode Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('estimator')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'estimator'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>{language === 'NE' ? 'परियोजना अनुमानक र सन्देश' : 'Project Estimator & Brief'}</span>
            </button>
            <button
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'booking'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{language === 'NE' ? 'परामर्श समय निर्धारण' : 'Schedule Discovery Call'}</span>
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'direct'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>{language === 'NE' ? 'तत्काल सम्पर्क च्यानल' : 'Direct Channels & Info'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: INTERACTIVE PROJECT ESTIMATOR & INQUIRY */}
        {activeTab === 'estimator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: The Interactive Planner Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-2xl relative">
                
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-bold text-slate-100 mb-2 font-heading">
                      {language === 'NE' ? 'परियोजना विवरण तयार भएको छ!' : 'Project Brief Ready to Send!'}
                    </h4>
                    <p className="text-sm text-slate-300 max-w-md mb-2 leading-relaxed">
                      {language === 'NE'
                        ? `तपाईँको परियोजना विवरण राजाबाबु मेहता (${contact.email || 'rajababum426@gmail.com'}) को लागि जिमेलमा लोड गरिएको छ।`
                        : `Your tailored brief has been pre-formatted and addressed to ${contact.email || 'rajababum426@gmail.com'}.`}
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                      {language === 'NE'
                        ? 'तपाईँ जिमेल वा ह्वाट्सएप मध्ये कुनै पनि माध्यमबाट तत्काल पठाउन सक्नुहुन्छ:'
                        : 'You can complete sending via Gmail or directly on WhatsApp:'}
                    </p>
                    
                    <div className="flex flex-wrap gap-3 justify-center mb-6">
                      {lastGmailUrl && (
                        <a
                          href={lastGmailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02]"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{language === 'NE' ? 'जिमेलमा खोल्नुहोस्' : 'Open in Gmail'}</span>
                        </a>
                      )}
                      {lastWhatsAppUrl && (
                        <a
                          href={lastWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 hover:scale-[1.02]"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{language === 'NE' ? 'ह्वाट्सएपमा पठाउनुहोस्' : 'Send via WhatsApp'}</span>
                        </a>
                      )}
                      <button
                        onClick={() => handleCopy(compiledBrief, 'brief')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                      >
                        {copiedType === 'brief' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{language === 'NE' ? 'विवरण कपी गर्नुहोस्' : 'Copy Full Brief'}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setSenderName('');
                        setSenderEmail('');
                        setSenderSubject('');
                        setSenderMessage('');
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
                    >
                      {language === 'NE' ? 'नयाँ सोधपुछ सुरु गर्नुहोस्' : 'Start Another Inquiry'}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    
                    {/* Step 1: Select Project Type Preset */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">1</span>
                          <span>{language === 'NE' ? 'परियोजनाको प्रकार छान्नुहोस्' : 'Select Project Blueprint'}</span>
                        </label>
                        <span className="text-[11px] text-slate-500">
                          {language === 'NE' ? 'अनुमानित लागत र समयसहित' : 'Includes estimated timeline'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {PROJECT_PRESETS.map((preset) => {
                          const IconComp = preset.icon;
                          const isSelected = selectedPresetId === preset.id;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => handleSelectPreset(preset)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`p-2 rounded-xl transition-colors ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-blue-400'
                                  }`}
                                >
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate">
                                    {language === 'NE' ? preset.titleNe : preset.titleEn}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    {preset.baseBudgetNpr}
                                  </div>
                                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-500" />
                                    <span>{preset.defaultTimeline}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2: Key Features Customizer */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">2</span>
                          <span>{language === 'NE' ? 'समावेश गर्नुपर्ने सुविधाहरू' : 'Select Desired Features'}</span>
                        </label>
                        <span className="text-[11px] text-slate-500">
                          {selectedFeatures.length} {language === 'NE' ? 'छानिएको' : 'selected'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {FEATURE_OPTIONS.map((f) => {
                          const isChecked = selectedFeatures.includes(f.id);
                          return (
                            <div
                              key={f.id}
                              onClick={() => toggleFeature(f.id)}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-slate-800/80 border-blue-500/50 text-slate-100'
                                  : 'bg-slate-950/50 border-slate-800/70 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <span className="truncate">{language === 'NE' ? f.labelNe : f.labelEn}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 3: Desired Timeline */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">3</span>
                        <span>{language === 'NE' ? 'परियोजना सम्पन्न गर्ने समय' : 'Desired Timeline'}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { id: 'urgent', labelEn: 'Urgent (< 7 Days)', labelNe: 'द्रुत (< ७ दिन)' },
                          { id: 'standard', labelEn: 'Standard (10 - 14 Days)', labelNe: 'सामान्य (१० - १४ दिन)' },
                          { id: 'flexible', labelEn: 'Flexible', labelNe: 'लचिलो' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSelectedTimeline(t.id)}
                            className={`py-2 px-3 rounded-xl border font-medium text-center transition-all ${
                              selectedTimeline === t.id
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {language === 'NE' ? t.labelNe : t.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 4: Contact Details & Message */}
                    <div className="space-y-4 pt-2 border-t border-slate-800/80">
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
                          {language === 'NE' ? 'परियोजना विषय' : 'Subject'}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            language === 'NE'
                              ? 'उदा. नयाँ वेबसाइट, एआई परामर्श, वा अन्य'
                              : 'e.g. New Website for Business, AI Integration'
                          }
                          value={senderSubject}
                          onChange={(e) => setSenderSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          {language === 'NE' ? 'थप विवरण वा विशेष आवश्यकता' : 'Custom Requirements or Notes'}
                        </label>
                        <textarea
                          rows={3}
                          placeholder={
                            language === 'NE'
                              ? 'तपाईँको विचार, वर्तमान वेबसाइटको लिङ्क वा कुनै विशेष चाहना यहाँ लेख्नुहोस्...'
                              : 'Tell Rajababu about your brand, current links, design inspiration, or specific questions...'
                          }
                          value={senderMessage}
                          onChange={(e) => setSenderMessage(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {/* Dispatch Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="submit"
                        id="btn-contact-submit"
                        className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Mail className="w-4 h-4" />
                        <span>{language === 'NE' ? 'जिमेलमा पठाउनुहोस् (Send via Gmail)' : 'Send Proposal via Gmail'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const rawWhatsapp = (contact.whatsappNumber || '9815259426').replace(/[^0-9]/g, '');
                          const cleanWhatsapp = rawWhatsapp.startsWith('977') ? rawWhatsapp : `977${rawWhatsapp}`;
                          const waUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                            `Hello Rajababu Mehta! Here is my project inquiry:\n\n${compiledBrief}`
                          )}`;
                          window.open(waUrl, '_blank');
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{language === 'NE' ? 'ह्वाट्सएपमा कुरा गर्नुहोस्' : 'Chat on WhatsApp'}</span>
                      </button>
                    </div>

                  </form>
                )}

              </div>
            </div>

            {/* Right 5 Columns: Dynamic Live Project Blueprint Card */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Dynamic Live Estimate Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {language === 'NE' ? 'परियोजना सारांश र अनुमान' : 'Live Blueprint Summary'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Transparent Estimate
                  </span>
                </div>

                {activePreset && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-0.5">
                        {language === 'NE' ? 'छानिएको प्रारूप:' : 'Selected Blueprint:'}
                      </div>
                      <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span>{language === 'NE' ? activePreset.titleNe : activePreset.titleEn}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/70">
                      <div>
                        <div className="text-[10px] text-slate-400">{language === 'NE' ? 'अनुमानित लगानी (NPR):' : 'Est. Investment:'}</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">{activePreset.baseBudgetNpr}</div>
                        <div className="text-[10px] text-slate-500">{activePreset.baseBudgetUsd}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">{language === 'NE' ? 'अनुमानित समय:' : 'Est. Delivery:'}</div>
                        <div className="text-xs font-bold text-blue-400 mt-0.5">
                          {selectedTimeline === 'urgent' ? '< 7 Days' : activePreset.defaultTimeline}
                        </div>
                        <div className="text-[10px] text-slate-500">Agile Milestones</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-400 mb-1.5">
                        {language === 'NE' ? 'छानिएका मुख्य सुविधाहरू:' : 'Key Included Modules:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedFeatures.map((fId) => {
                          const f = FEATURE_OPTIONS.find((item) => item.id === fId);
                          if (!f) return null;
                          return (
                            <span
                              key={f.id}
                              className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
                            >
                              {language === 'NE' ? f.labelNe : f.labelEn}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{language === 'NE' ? 'विकासकर्ता:' : 'Lead Developer:'}</span>
                        <span className="font-semibold text-slate-200">Rajababu Mehta</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{language === 'NE' ? 'स्थान:' : 'Base Station:'}</span>
                        <span className="text-slate-300">Birgunj, Parsa, Nepal</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{language === 'NE' ? 'परामर्श शुल्क:' : 'Initial Consultation:'}</span>
                        <span className="text-emerald-400 font-bold">100% Free (निःशुल्क)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(compiledBrief, 'brief')}
                      className="w-full py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
                    >
                      {copiedType === 'brief' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{language === 'NE' ? 'कपी गरियो!' : 'Brief Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>{language === 'NE' ? 'यो विवरण कपी गर्नुहोस्' : 'Copy Formatted Brief'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Verified Trust & Delivery Guarantees */}
              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'NE' ? 'विश्वसनीयता र कार्य प्रतिबद्धता' : 'Our Professional Standards'}</span>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Clean TypeScript & responsive Tailwind architecture.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Free post-launch warranty & training support included.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>Zero spam guarantee — your information is 100% private.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CONSULTATION & DISCOVERY CALL SCHEDULER */}
        {activeTab === 'booking' && (
          <div className="max-w-3xl mx-auto">
            <div className="p-6 sm:p-9 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-2xl">
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 font-heading">
                    {language === 'NE' ? 'निःशुल्क १५ मिनेटको परामर्श बुक गर्नुहोस्' : 'Schedule a Free 15-Minute Discovery Call'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'NE'
                      ? 'तपाईँको विचार, समय र बजेटबारे प्रत्यक्ष छलफल गर्न उपयुक्त समय छान्नुहोस्।'
                      : 'Discuss your project vision, feasibility, and custom milestones directly with Rajababu.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-5">
                
                {/* Topic Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'NE' ? 'छलफलको मुख्य विषय' : 'Primary Discussion Topic'} *
                  </label>
                  <select
                    value={bookingTopic}
                    onChange={(e) => setBookingTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="New Website Planning">New Website Planning & Architecture</option>
                    <option value="Business Portfolio & Branding">Business Portfolio & Personal Brand</option>
                    <option value="AI Explainer & Smart Features">AI Explainer & Smart Web App</option>
                    <option value="Website Redesign & Speed Audit">Website Redesign & Speed Audit</option>
                    <option value="General Tech Talk or Student Collaboration">Student Tech Talk / Educational Discussion</option>
                  </select>
                </div>

                {/* Preferred Medium */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'NE' ? 'कुराकानीको माध्यम' : 'Preferred Communication Medium'} *
                  </label>
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    {(['WhatsApp Call', 'Phone Call', 'Google Meet'] as const).map((medium) => (
                      <button
                        key={medium}
                        type="button"
                        onClick={() => setBookingMedium(medium)}
                        className={`p-3 rounded-xl border text-center font-medium transition-all ${
                          bookingMedium === medium
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {medium}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'इच्छित मिति' : 'Preferred Date'} *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'इच्छित समय (Nepal Time)' : 'Preferred Time Slot (NPT)'} *
                    </label>
                    <select
                      value={bookingTimeSlot}
                      onChange={(e) => setBookingTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    >
                      <option value="Morning (9:00 AM - 11:30 AM NPT)">Morning (9:00 AM - 11:30 AM NPT)</option>
                      <option value="Afternoon (1:30 PM - 4:30 PM NPT)">Afternoon (1:30 PM - 4:30 PM NPT)</option>
                      <option value="Evening (6:00 PM - 8:30 PM NPT)">Evening (6:00 PM - 8:30 PM NPT)</option>
                    </select>
                  </div>
                </div>

                {/* Client Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'तपाईँको नाम' : 'Your Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Roshan Sharma"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'फोन वा ह्वाट्सएप नम्बर' : 'WhatsApp or Phone Number'} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="98XXXXXXXX or you@email.com"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'NE' ? 'छलफल गर्न चाहेका बुँदाहरू' : 'Meeting Agenda & Questions'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide context on what you would like to explore during the call..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>
                      {language === 'NE'
                        ? 'परामर्श समय पठाउनुहोस् (Confirm & Request Call)'
                        : `Confirm & Send Meeting Request via ${bookingMedium === 'WhatsApp Call' ? 'WhatsApp' : 'Gmail'}`}
                    </span>
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* TAB 3: DIRECT CONNECT CHANNELS, OFFICE HOURS & BIRGUNJ HQ */}
        {activeTab === 'direct' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 6 Columns: Interactive Contact Cards */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Phone / Voice Call */}
              <div
                onClick={() => handleCopy(contact.phone, 'phone')}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        {language === 'NE' ? 'फोन सम्पर्क' : 'Direct Voice Call'}
                      </div>
                      <div className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {contact.phone}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {language === 'NE' ? 'प्रत्यक्ष कुराकानी वा सोधपुछ' : 'Voice Call & Direct Nepali / English Inquiry'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:+977${contact.phone.replace(/[^0-9]/g, '')}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-slate-950 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/50 transition-colors"
                      title="Make Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button
                      className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-slate-200 border border-slate-800"
                      title="Copy phone"
                    >
                      {copiedType === 'phone' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Official Email */}
              <div
                onClick={() => handleCopy(contact.email, 'email')}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        {language === 'NE' ? 'आधिकारिक इमेल' : 'Official Business Email'}
                      </div>
                      <div className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                        {contact.email}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {language === 'NE' ? 'परियोजना सोधपुछ तथा सन्देश' : 'Proposals, contracts & developer correspondence'}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-slate-200 border border-slate-800">
                    {copiedType === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* WhatsApp Instant Chat Button */}
              <div
                onClick={() => {
                  const rawWhatsapp = (contact.whatsappNumber || '9815259426').replace(/[^0-9]/g, '');
                  const cleanWhatsapp = rawWhatsapp.startsWith('977') ? rawWhatsapp : `977${rawWhatsapp}`;
                  window.open(`https://wa.me/${cleanWhatsapp}?text=Hello%20Rajababu!%20I%20visited%20your%20website%20and%20would%20like%20to%20connect.`, '_blank');
                }}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        {language === 'NE' ? 'ह्वाट्सएप तत्काल च्याट' : 'WhatsApp Direct Chat'}
                      </div>
                      <div className="text-base sm:text-lg font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                        <span>+977 {contact.whatsappNumber || '9815259426'}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {language === 'NE' ? 'तत्काल च्याट तथा सन्देश' : 'Fastest response channel (< 2 hours)'}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 group-hover:border-emerald-500/50">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Social Channels */}
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
                      href={
                        contact.instagramUrl.startsWith('http')
                          ? contact.instagramUrl
                          : `https://www.instagram.com/${contact.instagramUrl.replace('@', '')}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-pink-600/20 border border-slate-800 hover:border-pink-500 text-xs font-medium text-slate-200 transition-all"
                    >
                      <span>Instagram (@mr.rajababumehta)</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                  {contact.linkedinUrl && (
                    <a
                      href={contact.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-blue-700/20 border border-slate-800 hover:border-blue-600 text-xs font-medium text-slate-200 transition-all"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                  {contact.githubUrl && (
                    <a
                      href={contact.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-all"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Right 6 Columns: Working Hours & Birgunj HQ Card */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Location & Interactive Coordinates */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        {language === 'NE' ? 'स्थान तथा आधार केन्द्र' : 'Headquarters & Location'}
                      </div>
                      <div className="text-base font-bold text-slate-100">
                        {language === 'NE' ? contact.locationNe : contact.locationEn}
                      </div>
                    </div>
                  </div>

                  <a
                    href="https://www.google.com/maps/place/Birgunj,+Nepal"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-blue-400 text-xs font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/70 text-xs text-slate-400 leading-relaxed">
                  {language === 'NE'
                    ? 'वीरगञ्ज, पर्सा, मधेश प्रदेश (नेपाल) मा अवस्थित भएर नेपालभर तथा अन्तर्राष्ट्रिय स्तरमा अनलाइन माध्यमबाट वेब विकास तथा एआई परामर्श सेवा प्रदान गर्दै।'
                    : 'Based in Birgunj, Parsa, Madhesh Province (Nepal). Providing full-stack web engineering, modern brand portfolio builds, and AI explainer tools remotely nationwide and worldwide.'}
                </div>
              </div>

              {/* Working Hours Schedule */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {language === 'NE' ? 'कार्यालय तथा परामर्श समय' : 'Availability & Response Schedule'}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-400 font-mono">Nepal Time (GMT+5:45)</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
                    <span className="text-slate-300 font-medium">Sunday – Friday</span>
                    <span className="text-emerald-400 font-semibold font-mono">8:00 AM – 9:00 PM NPT</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
                    <span className="text-slate-300 font-medium">Saturday</span>
                    <span className="text-blue-400 font-semibold font-mono">10:00 AM – 6:00 PM NPT</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/50">
                    <span className="text-slate-300 font-medium">Urgent & Production Inquiries</span>
                    <span className="text-purple-400 font-semibold">Priority 24/7 WhatsApp</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-slate-400 flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {language === 'NE'
                      ? 'परियोजनाका लागि पहिलो परामर्श र छलफल पूर्ण रूपमा निःशुल्क छ।'
                      : 'All initial consultations, milestone roadmaps, and project assessments are 100% free of charge.'}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
