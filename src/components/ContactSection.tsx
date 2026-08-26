import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { ContactSettings, Language } from '../types';

interface ContactSectionProps {
  language: Language;
  contact: ContactSettings;
  onSecretAdminLogin: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  language,
  contact,
  onSecretAdminLogin,
  onShowToast,
}) => {
  // Form State
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderSubject, setSenderSubject] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Copied states
  const [copiedType, setCopiedType] = useState<'email' | 'phone' | 'location' | null>(null);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = senderName.trim().toLowerCase();
    const cleanEmail = senderEmail.trim().toLowerCase();
    const cleanMsg = senderMessage.trim().toLowerCase();

    // Secret Admin Gate check
    // Name: admin, Email: rajababum426@gmail.com, Message: login
    if (cleanName === 'admin' && cleanEmail === 'rajababum426@gmail.com' && cleanMsg === 'login') {
      onSecretAdminLogin();
      setSenderName('');
      setSenderEmail('');
      setSenderSubject('');
      setSenderMessage('');
      return;
    }

    // Normal submission workflow
    setIsSubmitted(true);
    onShowToast(
      language === 'NE'
        ? 'सन्देश सफलतापूर्वक पठाइयो! चाँडै प्रतिक्रिया दिइनेछ।'
        : 'Message delivered successfully! We will get back to you shortly.',
      'success'
    );
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-slate-950 relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Mail className="w-3.5 h-3.5" />
            <span>{language === 'NE' ? contact.badgeNe : contact.badgeEn}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight max-w-3xl mb-4">
            {language === 'NE' ? contact.headingNe : contact.headingEn}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            {language === 'NE' ? contact.subheadingNe : contact.subheadingEn}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Click-to-Copy Cards & Socials */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Email Card */}
            <div
              onClick={() => handleCopy(contact.email, 'email')}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      {language === 'NE' ? 'इमेल सम्पर्क' : 'Email Address'}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {contact.email}
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-slate-200 border border-slate-800">
                  {copiedType === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone Card */}
            <div
              onClick={() => handleCopy(contact.phone, 'phone')}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      {language === 'NE' ? 'फोन / ह्वाट्सएप' : 'Phone / WhatsApp'}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {contact.phone}
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-slate-200 border border-slate-800">
                  {copiedType === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Location Card */}
            <div
              onClick={() => handleCopy(language === 'NE' ? contact.locationNe : contact.locationEn, 'location')}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      {language === 'NE' ? 'स्थान' : 'Primary Location'}
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                      {language === 'NE' ? contact.locationNe : contact.locationEn}
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-slate-200 border border-slate-800">
                  {copiedType === 'location' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Social Links Row */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                {language === 'NE' ? 'सामाजिक सञ्जाल लिङ्कहरू' : 'Connect on Social Media'}
              </div>
              <div className="flex flex-wrap gap-3">
                {contact.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500 text-xs font-medium text-slate-200 transition-colors"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {contact.linkedinUrl && (
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-blue-600/20 border border-slate-800 hover:border-blue-500 text-xs font-medium text-slate-200 transition-colors"
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
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
                  >
                    <span>GitHub</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
                {contact.whatsappNumber && (
                  <a
                    href={`https://wa.me/${contact.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-emerald-600/20 border border-slate-800 hover:border-emerald-500 text-xs font-medium text-slate-200 transition-colors"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Message Form & Secret Admin Gateway */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-sm shadow-2xl relative">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading mb-2">
                {language === 'NE' ? 'प्रत्यक्ष सन्देश पठाउनुहोस्' : 'Send a Direct Message'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-8">
                {language === 'NE'
                  ? 'कुनै प्रश्न, सहकार्य वा आमन्त्रणको लागि तलको फारम भर्नुहोस्।'
                  : 'Have a query, collaboration request, or speaking invitation? Drop a note below.'}
              </p>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-100 mb-2 font-heading">
                    {language === 'NE' ? 'सन्देश प्राप्त भयो!' : 'Message Received!'}
                  </h4>
                  <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
                    {language === 'NE'
                      ? 'तपाईँको सन्देश सफलतापूर्वक सुरक्षित गरिएको छ। राजाबाबु मेहताले चाँडै सम्पर्क गर्नुहुनेछ।'
                      : 'Thank you for reaching out. Rajababu Mehta or the team will review your inquiry and follow up promptly.'}
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    {language === 'NE' ? 'अर्को सन्देश पठाउनुहोस्' : 'Send Another Message'}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        {language === 'NE' ? 'तपाईँको नाम' : 'Your Name'} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={language === 'NE' ? 'उदा. रोशन अधिकारी' : 'e.g. John Doe'}
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        {language === 'NE' ? 'इमेल ठेगाना' : 'Email Address'} *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      {language === 'NE' ? 'विषय' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'NE' ? 'सहकार्य वा आमन्त्रण...' : 'Collaboration, Keynote or General Inquiry'}
                      value={senderSubject}
                      onChange={(e) => setSenderSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      {language === 'NE' ? 'सन्देश विवरण' : 'Message'} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={language === 'NE' ? 'तपाईँको सन्देश यहाँ लेख्नुहोस्...' : 'Share your ideas, goals, or proposal...'}
                      value={senderMessage}
                      onChange={(e) => setSenderMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    id="btn-contact-submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'NE' ? 'सन्देश पठाउनुहोस्' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
