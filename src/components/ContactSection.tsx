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
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { ContactSettings, Language } from '../types';
import { loginAsLocalAdmin, saveInquiryToFirestore } from '../services/firebase';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Secret Admin Verification Trigger
    // Required: Name = "Admin_pannel", Email = "support@rajababumehta.com.np", Subject = "Admin_pannel", Message = "Admin_login"
    const trimmedName = senderName.trim();
    const trimmedEmail = senderEmail.trim().toLowerCase();
    const trimmedSubject = senderSubject.trim();
    const trimmedMessage = senderMessage.trim();

    const isSecretAdminMatch =
      (trimmedName === 'Admin_pannel' || trimmedName.toLowerCase() === 'admin_pannel') &&
      trimmedEmail === 'support@rajababumehta.com.np' &&
      (trimmedSubject === 'Admin_pannel' || trimmedSubject.toLowerCase() === 'admin_pannel') &&
      (trimmedMessage === 'Admin_login' || trimmedMessage.toLowerCase() === 'admin_login');

    if (isSecretAdminMatch) {
      // Clear sensitive secret text from inputs
      setSenderName('');
      setSenderEmail('');
      setSenderSubject('');
      setSenderMessage('');

      // Authorize admin session in local state & dispatch event
      loginAsLocalAdmin('support@rajababumehta.com.np');

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

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      onShowToast(
        language === 'NE'
          ? 'कृपया सबै अनिवार्य विवरण भर्नुहोस्।'
          : 'Please complete all required fields.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    const recipientEmail = (contact.email || 'support@rajababumehta.com.np').trim();
    const cleanSubject = trimmedSubject || `New Website Inquiry from ${trimmedName}`;

    // 1. Direct persistence into Firestore and LocalStorage
    try {
      await saveInquiryToFirestore({
        name: trimmedName,
        email: trimmedEmail,
        subject: cleanSubject,
        message: trimmedMessage,
        createdAt: new Date().toISOString(),
        status: 'unread',
      });
    } catch (saveErr) {
      console.warn('Inquiry local/firestore save note:', saveErr);
    }

    // 2. Automatic background email delivery via FormSubmit AJAX (user does NOT need to open any mail app)
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          _replyto: trimmedEmail,
          subject: cleanSubject,
          message: trimmedMessage,
          _subject: `New Inquiry from ${trimmedName} (rajababumehta.com.np)`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
    } catch (netErr) {
      console.warn('Background email delivery note:', netErr);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);

    onShowToast(
      language === 'NE'
        ? 'तपाईँको सन्देश राजाबाबु मेहताको इमेलमा सफलतापूर्वक पठाइयो!'
        : 'Your message has been sent directly to Rajababu Mehta!',
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
              ? 'नयाँ वेबसाइट, व्यापारिक सोधपुछ वा एआई परामर्शका लागि तलको फारम भरेर सन्देश पठाउनुहोस्।'
              : 'Ready to take your business or personal brand online? Send a direct inquiry below to discuss your project.'}
          </p>

          {/* Value Props Pill Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'NE' ? 'द्रुत प्रतिक्रिया' : 'Fast Response'}</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'NE' ? 'आधिकारिक इमेल' : 'Official Email'}</span>
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
            
            {/* Phone / Voice Call Card */}
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
                      {language === 'NE' ? 'फोन सम्पर्क' : 'Direct Phone'}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {contact.phone}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {language === 'NE' ? 'प्रत्यक्ष कुराकानी वा सोधपुछ' : 'Voice Call & Direct Inquiry'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:+977${contact.phone.replace(/[^0-9]/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-950 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/50 transition-colors"
                    title={language === 'NE' ? 'कल गर्नुहोस्' : 'Make Call'}
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

            {/* Email Card */}
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
                      {language === 'NE' ? 'आधिकारिक इमेल' : 'Email Address'}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {contact.email}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {language === 'NE' ? 'परियोजना सोधपुछ तथा सन्देश' : 'Official Inquiries & Proposals'}
                    </span>
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
                {contact.linkedinUrl && (
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-sky-600/20 border border-slate-800 hover:border-sky-500 text-xs font-medium text-slate-200 transition-all"
                  >
                    <span>LinkedIn</span>
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
                  className="py-10 px-4 sm:px-6 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <h4 className="text-2xl font-bold text-slate-100 mb-2 font-heading">
                    {language === 'NE' ? 'सन्देश सफलतापूर्वक पठाइयो!' : 'Message Sent Successfully!'}
                  </h4>
                  <p className="text-sm text-slate-300 max-w-md mb-4 leading-relaxed">
                    {language === 'NE'
                      ? `तपाईँको सन्देश सिधै राजाबाबु मेहता (${contact.email || 'support@rajababumehta.com.np'}) को इमेलमा पुगिसकेको छ। तपाईँले आफ्नो कुनै पनि इमेल अकाउन्ट खोल्नु पर्दैन।`
                      : `Your inquiry has been sent directly to Rajababu Mehta (${contact.email || 'support@rajababumehta.com.np'}). You do not need to send anything from your personal email account.`}
                  </p>

                  <div className="w-full max-w-sm bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left mb-6 text-xs text-slate-300 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      {language === 'NE' ? 'पठाइएको विवरण' : 'Delivered Details'}
                    </div>
                    <div>
                      <span className="text-slate-500">{language === 'NE' ? 'नाम:' : 'Name:'} </span>
                      <span className="font-semibold text-slate-200">{senderName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">{language === 'NE' ? 'सम्पर्क:' : 'Contact:'} </span>
                      <span className="font-semibold text-slate-200">{senderEmail}</span>
                    </div>
                    {senderSubject && (
                      <div>
                        <span className="text-slate-500">{language === 'NE' ? 'विषय:' : 'Subject:'} </span>
                        <span className="text-slate-200">{senderSubject}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSenderName('');
                      setSenderEmail('');
                      setSenderSubject('');
                      setSenderMessage('');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{language === 'NE' ? 'अर्को नयाँ सन्देश पठाउनुहोस्' : 'Send Another Message'}</span>
                  </button>
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
                        disabled={isSubmitting}
                        placeholder={language === 'NE' ? 'उदा. रोशन अधिकारी' : 'e.g. Roshan Sharma'}
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {language === 'NE' ? 'इमेल वा फोन नम्बर' : 'Email or Phone Number'} *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        placeholder="you@email.com or 98XXXXXXXX"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'विषय' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      disabled={isSubmitting}
                      placeholder={
                        language === 'NE'
                          ? 'उदा. नयाँ वेबसाइट, एआई परामर्श, वा अन्य'
                          : 'e.g. New Website, AI Inquiry, Collaboration'
                      }
                      value={senderSubject}
                      onChange={(e) => setSenderSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'सन्देश वा परियोजना विवरण' : 'Message or Project Details'} *
                    </label>
                    <textarea
                      rows={4}
                      required
                      disabled={isSubmitting}
                      placeholder={
                        language === 'NE'
                          ? 'तपाईँको सन्देश वा परियोजनाको आवश्यकता यहाँ लेख्नुहोस्...'
                          : 'Tell Rajababu about your website idea, requirements, questions, or timeline...'
                      }
                      value={senderMessage}
                      onChange={(e) => setSenderMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none disabled:opacity-50"
                    />
                  </div>

                  {/* Action Dispatch Bar */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="btn-contact-submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{language === 'NE' ? 'सन्देश सिधै पठाइँदैछ...' : 'Sending message directly...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{language === 'NE' ? 'सिधै सन्देश पठाउनुहोस् (Send Message)' : 'Send Message Directly'}</span>
                        </>
                      )}
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
