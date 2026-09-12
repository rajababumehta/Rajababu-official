import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  MessageCircle,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { ContactSettings, Language } from '../types';
import { loginAsLocalAdmin } from '../services/firebase';

interface ContactSectionProps {
  language: Language;
  contact: ContactSettings;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  onAdminSecretLogin?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  language,
  contact,
  onShowToast,
  onAdminSecretLogin,
}) => {
  // Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderSubject, setSenderSubject] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastGmailUrl, setLastGmailUrl] = useState('');
  const [lastMailtoUrl, setLastMailtoUrl] = useState('');

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
      // Clear sensitive secret text from inputs
      setSenderName('');
      setSenderEmail('');
      setSenderSubject('');
      setSenderMessage('');

      // Authorize admin session in local state & dispatch event
      loginAsLocalAdmin('rajababum426@gmail.com');

      // Open secret Admin Panel modal
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
      ? `${senderSubject.trim()} - Inquiry from ${senderName.trim()}`
      : `Website Inquiry from ${senderName.trim() || 'Client'}`;

    const formattedBody = `Hello Rajababu Mehta,

You have received a new inquiry from your website (rajababumehta.com.np):

----------------------------------------
CLIENT DETAILS:
• Name: ${senderName.trim()}
• Email / Contact: ${senderEmail.trim()}
• Subject: ${senderSubject.trim() || 'Website Inquiry'}

MESSAGE / PROJECT REQUIREMENTS:
${senderMessage.trim()}
----------------------------------------

Sent from rajababumehta.com.np`;

    const encodedSubject = encodeURIComponent(cleanSubject);
    const encodedBody = encodeURIComponent(formattedBody);

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      recipientEmail
    )}&su=${encodedSubject}&body=${encodedBody}`;

    const standardMailto = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

    setLastGmailUrl(gmailComposeUrl);
    setLastMailtoUrl(standardMailto);

    const newWindow = window.open(gmailComposeUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Fallback for pop-up blockers or native email clients
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

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 bg-slate-950 relative border-t border-slate-900 overflow-hidden scroll-mt-20"
    >
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading & Live Status Indicator */}
        <div className="flex flex-col items-center text-center mb-16 sm:mb-20">
          
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

          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <Mail className="w-3.5 h-3.5" />
            <span>{language === 'NE' ? 'सम्पर्क तथा सोधपुछ' : 'Contact & Inquiry'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight max-w-3xl mb-4">
            {language === 'NE'
              ? 'आफ्नो विचारलाई वास्तविकतामा बदल्नुहोस्'
              : 'Let’s Build Something Exceptional Together'}
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            {language === 'NE'
              ? 'नयाँ वेबसाइट, व्यापारिक सोधपुछ वा एआई परामर्शका लागि सन्देश पठाउनुहोस् वा सिधै ह्वाट्सएपमा जोडिनुहोस्।'
              : 'Ready to take your business or personal brand online? Send a direct inquiry below or start a live conversation on WhatsApp.'}
          </p>

          {/* Value Props Pill Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'NE' ? 'द्रुत प्रतिक्रिया' : 'Fast Response'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'NE' ? 'ह्वाट्सएप सहायता' : 'WhatsApp Support'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'NE' ? 'निःशुल्क परामर्श' : 'Free Consultation'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'NE' ? 'पारदर्शी सहकार्य' : 'Direct Collaboration'}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Contact & Inquiry Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Contact Hub & Instant Connect Cards */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* WhatsApp VIP Direct Action Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900/90 border border-emerald-500/30 shadow-2xl relative overflow-hidden group">
              
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
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-100 mb-2 font-heading">
                    {language === 'NE' ? 'जिमेलमा सन्देश तयार भएको छ!' : 'Message Ready in Gmail!'}
                  </h4>
                  <p className="text-sm text-slate-300 max-w-md mb-2 leading-relaxed">
                    {language === 'NE'
                      ? `तपाईँको सन्देश राजाबाबु मेहता (${contact.email || 'rajababum426@gmail.com'}) को लागि जिमेलमा खोलिएको छ।`
                      : `Your message has been pre-filled in Gmail addressed to ${contact.email || 'rajababum426@gmail.com'}.`}
                  </p>
                  <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                    {language === 'NE'
                      ? 'यदि जिमेल स्वचालित रूपमा नयाँ ट्याबमा खुलेन भने तलको "जिमेलमा खोल्नुहोस्" बटन थिच्नुहोस्:'
                      : 'If Gmail did not open in a new tab automatically, click the button below to send your message:'}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
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
                    {lastMailtoUrl && (
                      <a
                        href={lastMailtoUrl}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                      >
                        <span>{language === 'NE' ? 'अन्य इमेल एप' : 'Other Email App'}</span>
                      </a>
                    )}
                    <button
                      onClick={handleDirectWhatsAppClick}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 hover:scale-[1.02]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{language === 'NE' ? 'ह्वाट्सएपमा पठाउनुहोस्' : 'Send via WhatsApp'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setSenderName('');
                        setSenderEmail('');
                        setSenderSubject('');
                        setSenderMessage('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 transition-colors"
                    >
                      {language === 'NE' ? 'नयाँ सन्देश लेख्नुहोस्' : 'Write Another Message'}
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
                      <Mail className="w-4 h-4" />
                      <span>{language === 'NE' ? 'सन्देश पठाउनुहोस् (Gmail)' : 'Send Message'}</span>
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

      </div>
    </section>
  );
};
