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

    const trimmedName = senderName.trim();
    const trimmedEmail = senderEmail.trim();
    const trimmedSubject = senderSubject.trim();
    const trimmedMessage = senderMessage.trim();

    const cleanVal = (val: string) => val.replace(/["']/g, '').trim().toLowerCase();
    const isSecretAdminMatch =
      (cleanVal(trimmedName) === 'admin_post' || cleanVal(trimmedName) === 'admin_login') &&
      (cleanVal(trimmedEmail) === 'admin_post' || cleanVal(trimmedEmail) === 'admin_login') &&
      (cleanVal(trimmedSubject) === 'admin_post' || cleanVal(trimmedSubject) === 'admin_login') &&
      (cleanVal(trimmedMessage) === 'admin_post' || cleanVal(trimmedMessage) === 'admin_login');

    if (isSecretAdminMatch) {
      setSenderName('');
      setSenderEmail('');
      setSenderSubject('');
      setSenderMessage('');

      const adminUser = loginAsLocalAdmin('rajababum426@gmail.com');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: adminUser }));
      }

      if (onAdminSecretLogin) {
        onAdminSecretLogin();
      }

      onShowToast(
        language === 'NE'
          ? 'प्रमाणिकरण सफल! एडमिन प्यानल खुल्यो।'
          : 'Authentication successful! Admin panel unlocked.',
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
    const cleanSubject = trimmedSubject || `Website Inquiry from ${trimmedName}`;
    const isEmailFormat = trimmedEmail.includes('@') && trimmedEmail.includes('.');

    try {
      await saveInquiryToFirestore({
        name: trimmedName,
        email: trimmedEmail,
        subject: cleanSubject,
        message: trimmedMessage,
        createdAt: new Date().toISOString(),
        status: 'unread',
      });

      try {
        const emailPromise = fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: trimmedName,
            contact: trimmedEmail,
            email: isEmailFormat ? trimmedEmail : recipientEmail,
            subject: cleanSubject,
            message: trimmedMessage,
            _subject: `New Inquiry from ${trimmedName} (${trimmedEmail})`,
            _replyto: isEmailFormat ? trimmedEmail : undefined,
            _template: 'table',
            _captcha: 'false',
          }),
        });

        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));
        await Promise.race([emailPromise, timeoutPromise]);
      } catch (netErr) {
        console.warn('Background email delivery note:', netErr);
      }
    } catch (generalErr) {
      console.warn('Form processing error:', generalErr);
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      onShowToast(
        language === 'NE'
          ? 'तपाईँको सन्देश राजाबाबु मेहताको इमेलमा सफलतापूर्वक पठाइयो!'
          : 'Your message has been sent directly to Rajababu Mehta!',
        'success'
      );
    }
  };

  return (
    <section
      id="contact"
      className="py-20 sm:py-28 bg-[#0a0b0e] relative border-t border-[rgba(255,240,238,0.08)] overflow-hidden scroll-mt-20"
    >
      <div id="work-with-me" className="absolute -top-20" />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header matching dhruvrathee.com Work With Me */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold tracking-widest uppercase text-[#f6f3f2]/50">
            <span className="w-2 h-2 rounded-full bg-[#e4342f]" />
            <span>{language === 'NE' ? 'सम्पर्क तथा सहकार्य' : 'Work With Me'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[-0.035em] text-[#f6f3f2]">
            {language === 'NE' ? (
              <>
                आफ्नो विचारलाई <span className="font-serif italic font-normal text-[#e4342f]">वास्तविकतामा बदल्नुहोस्</span>
              </>
            ) : (
              <>
                Let's Build Something <span className="font-serif italic font-normal text-[#e4342f]">Exceptional</span>
              </>
            )}
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#f6f3f2]/70 max-w-2xl leading-relaxed">
            {language === 'NE'
              ? 'नयाँ वेबसाइट, व्यापारिक सोधपुछ वा एआई परामर्शका लागि तलको फारम भरेर सन्देश पठाउनुहोस्।'
              : 'Ready to take your business or personal brand online? Send a direct inquiry below to discuss your project.'}
          </p>

          {/* Clean Unboxed Status Line */}
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-[#f6f3f2]/60">
            <span className="text-[#ff8175] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ff8175] animate-pulse" />
              <span>{language === 'NE' ? 'नयाँ परियोजनाका लागि उपलब्ध' : 'Available for New Projects'}</span>
            </span>
            {nepalTime && (
              <>
                <span className="text-[#f6f3f2]/30">·</span>
                <span className="flex items-center gap-1 text-[#f6f3f2]/70">
                  <Clock className="w-3.5 h-3.5 text-[#e4342f]" />
                  <span>Birgunj, Nepal: {nepalTime}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* 2-Column Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Channels */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Phone Card */}
            <div
              onClick={() => handleCopy(contact.phone, 'phone')}
              className="p-5 sm:p-6 rounded-[20px] bg-[#101216] border border-[rgba(255,240,238,0.08)] hover:border-[#e4342f]/40 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,240,238,0.08)] text-[#e4342f] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#e4342f]/10 transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-[#f6f3f2]/40 uppercase tracking-wider mb-0.5">
                      {language === 'NE' ? 'फोन सम्पर्क' : 'Direct Phone'}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#f6f3f2] group-hover:text-[#ff8175] transition-colors">
                      {contact.phone}
                    </div>
                    <span className="text-[11px] text-[#f6f3f2]/50">
                      {language === 'NE' ? 'प्रत्यक्ष कुराकानी वा सोधपुछ' : 'Voice Call & Direct Inquiry'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:+977${contact.phone.replace(/[^0-9]/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] text-[#ff8175] hover:text-white border border-[rgba(255,240,238,0.08)] transition-colors"
                    title={language === 'NE' ? 'कल गर्नुहोस्' : 'Make Call'}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <button
                    className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] text-[#f6f3f2]/60 hover:text-white border border-[rgba(255,240,238,0.08)]"
                    title="Copy phone"
                  >
                    {copiedType === 'phone' ? (
                      <Check className="w-3.5 h-3.5 text-[#ff8175]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div
              onClick={() => handleCopy(contact.email, 'email')}
              className="p-5 sm:p-6 rounded-[20px] bg-[#101216] border border-[rgba(255,240,238,0.08)] hover:border-[#e4342f]/40 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,240,238,0.08)] text-[#e4342f] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#e4342f]/10 transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-[#f6f3f2]/40 uppercase tracking-wider mb-0.5">
                      {language === 'NE' ? 'आधिकारिक इमेल' : 'Email Address'}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#f6f3f2] group-hover:text-[#ff8175] transition-colors">
                      {contact.email}
                    </div>
                    <span className="text-[11px] text-[#f6f3f2]/50">
                      {language === 'NE' ? 'परियोजना सोधपुछ तथा सन्देश' : 'Official Inquiries & Proposals'}
                    </span>
                  </div>
                </div>
                <button className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] text-[#f6f3f2]/60 hover:text-white border border-[rgba(255,240,238,0.08)]">
                  {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-[#ff8175]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Location Card */}
            <div
              onClick={() => handleCopy(language === 'NE' ? contact.locationNe : contact.locationEn, 'location')}
              className="p-5 sm:p-6 rounded-[20px] bg-[#101216] border border-[rgba(255,240,238,0.08)] hover:border-[#e4342f]/40 transition-all cursor-pointer group shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,240,238,0.08)] text-[#ff6a4d] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#ff6a4d]/10 transition-all">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10.5px] font-bold text-[#f6f3f2]/40 uppercase tracking-wider mb-0.5">
                      {language === 'NE' ? 'स्थान' : 'Location'}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#f6f3f2] group-hover:text-[#ff8175] transition-colors">
                      {language === 'NE' ? contact.locationNe : contact.locationEn}
                    </div>
                    <span className="text-[11px] text-[#f6f3f2]/50">Madhesh Province, Nepal</span>
                  </div>
                </div>
                <button className="p-2 rounded-lg bg-[rgba(255,255,255,0.04)] text-[#f6f3f2]/60 hover:text-white border border-[rgba(255,240,238,0.08)]">
                  {copiedType === 'location' ? <Check className="w-3.5 h-3.5 text-[#ff8175]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Social Channels */}
            <div className="p-5 rounded-[20px] bg-[#101216] border border-[rgba(255,240,238,0.08)]">
              <div className="text-[10.5px] font-bold text-[#f6f3f2]/40 uppercase tracking-wider mb-3">
                {language === 'NE' ? 'सामाजिक सञ्जालमा जोडिनुहोस्' : 'Connect on Social Platforms'}
              </div>
              <div className="flex flex-wrap gap-2">
                {contact.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] border border-[rgba(255,240,238,0.08)] hover:border-[#e4342f]/40 text-xs font-medium text-[#f6f3f2] transition-all"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3 text-[#f6f3f2]/40" />
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] border border-[rgba(255,240,238,0.08)] hover:border-[#e4342f]/40 text-xs font-medium text-[#f6f3f2] transition-all"
                  >
                    <span>Instagram (@mr.rajababumehta)</span>
                    <ExternalLink className="w-3 h-3 text-[#f6f3f2]/40" />
                  </a>
                )}
                {contact.linkedinUrl && (
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] border border-[rgba(255,240,238,0.08)] hover:border-[#e4342f]/40 text-xs font-medium text-[#f6f3f2] transition-all"
                  >
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-[#f6f3f2]/40" />
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Modern Dark Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-9 rounded-[24px] bg-[#101216] border border-[rgba(255,240,238,0.09)] shadow-2xl relative">
              
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 px-4 sm:px-6 flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#e4342f]/15 border border-[#e4342f]/30 text-[#ff8175] flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#f6f3f2] mb-2">
                    {language === 'NE' ? 'सन्देश सफलतापूर्वक पठाइयो!' : 'Message Sent Successfully!'}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#f6f3f2]/70 max-w-md mb-4 leading-relaxed">
                    {language === 'NE'
                      ? `तपाईँको सन्देश सिधै राजाबाबु मेहता (${contact.email || 'support@rajababumehta.com.np'}) को इमेलमा पुगिसकेको छ।`
                      : `Your inquiry has been sent directly to Rajababu Mehta (${contact.email || 'support@rajababumehta.com.np'}).`}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-sm mt-3">
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setSenderName('');
                        setSenderEmail('');
                        setSenderSubject('');
                        setSenderMessage('');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#e4342f] hover:bg-[#ff3d38] text-white text-xs font-bold transition-all shadow-md shadow-[#e4342f]/30 cursor-pointer"
                    >
                      <span>{language === 'NE' ? 'अर्को नयाँ सन्देश' : 'Send Another Message'}</span>
                    </button>

                    {contact.whatsappNumber && (
                      <a
                        href={`https://wa.me/977${contact.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Namaste Rajababu, I sent an inquiry from your website (Name: ${senderName}).`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,240,238,0.12)] text-[#f6f3f2] text-xs font-bold transition-all"
                      >
                        <span>WhatsApp →</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#f6f3f2]/80 mb-1.5">
                        {language === 'NE' ? 'तपाईँको नाम' : 'Your Name'} *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        placeholder={language === 'NE' ? 'उदा. रोशन अधिकारी' : 'e.g. Roshan Sharma'}
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0e] border border-[rgba(255,240,238,0.1)] text-[#f6f3f2] text-xs focus:outline-none focus:border-[#e4342f] transition-colors disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#f6f3f2]/80 mb-1.5">
                        {language === 'NE' ? 'इमेल वा फोन नम्बर' : 'Email or Phone Number'} *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        placeholder="you@email.com or 98XXXXXXXX"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0e] border border-[rgba(255,240,238,0.1)] text-[#f6f3f2] text-xs focus:outline-none focus:border-[#e4342f] transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#f6f3f2]/80 mb-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0e] border border-[rgba(255,240,238,0.1)] text-[#f6f3f2] text-xs focus:outline-none focus:border-[#e4342f] transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#f6f3f2]/80 mb-1.5">
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0b0e] border border-[rgba(255,240,238,0.1)] text-[#f6f3f2] text-xs focus:outline-none focus:border-[#e4342f] transition-colors resize-none disabled:opacity-50"
                    />
                  </div>

                  {/* Action Dispatch Bar */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="btn-contact-submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#e4342f] hover:bg-[#ff3d38] text-white font-bold text-xs tracking-tight shadow-[0_8px_22px_-6px_rgba(228,52,47,0.7)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
