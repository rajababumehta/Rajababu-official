import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle2, AlertCircle, Sparkles, Send, Users, ShieldCheck } from 'lucide-react';
import { Language, NewsletterSubscriber } from '../types';
import { STORAGE_KEYS } from '../data/defaults';

interface NewsletterSignupProps {
  language: Language;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ language }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSubscribers, setActiveSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [currentSubscriberEmail, setCurrentSubscriberEmail] = useState<string | null>(null);

  // Load existing subscribers from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS);
      if (stored) {
        const parsed: NewsletterSubscriber[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const activeOnly = parsed.filter((s) => s.active);
          setActiveSubscribers(activeOnly);
        }
      }
    } catch (e) {
      console.warn('Failed to load newsletter subscribers from localStorage', e);
    }
  }, []);

  const validateEmail = (inputEmail: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(inputEmail.trim().toLowerCase());
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatus('error');
      setErrorMessage(
        language === 'NE'
          ? 'कृपया आफ्नो वैध इमेल ठेगाना प्रविष्ट गर्नुहोस्।'
          : 'Please enter a valid email address.'
      );
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setStatus('error');
      setErrorMessage(
        language === 'NE'
          ? 'अमान्य इमेल ढाँचा! कृपया सही इमेल लेख्नुहोस् (उदा: you@example.com)।'
          : 'Invalid email format! Please enter a valid email (e.g. you@example.com).'
      );
      return;
    }

    setStatus('loading');

    // Simulate quick instant response
    setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS);
        let currentList: NewsletterSubscriber[] = [];
        if (stored) {
          try {
            currentList = JSON.parse(stored) || [];
          } catch {
            currentList = [];
          }
        }

        const existingIndex = currentList.findIndex(
          (s) => s.email.toLowerCase() === cleanEmail
        );

        if (existingIndex >= 0 && currentList[existingIndex].active) {
          setStatus('already');
          setCurrentSubscriberEmail(cleanEmail);
          return;
        }

        let updatedList: NewsletterSubscriber[];
        if (existingIndex >= 0) {
          // Reactivate
          updatedList = currentList.map((s, idx) =>
            idx === existingIndex
              ? { ...s, active: true, subscribedAt: new Date().toISOString() }
              : s
          );
        } else {
          // Add new subscriber
          const newSubscriber: NewsletterSubscriber = {
            id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            email: cleanEmail,
            subscribedAt: new Date().toISOString(),
            source: 'footer_newsletter',
            active: true,
          };
          updatedList = [newSubscriber, ...currentList];
        }

        localStorage.setItem(
          STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS,
          JSON.stringify(updatedList)
        );

        const activeList = updatedList.filter((s) => s.active);
        setActiveSubscribers(activeList);
        setCurrentSubscriberEmail(cleanEmail);
        setStatus('success');
        setEmail('');
      } catch (err) {
        console.error('Error saving subscriber to localStorage', err);
        setStatus('error');
        setErrorMessage(
          language === 'NE'
            ? 'सब्सक्राइब गर्दा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।'
            : 'Something went wrong while subscribing. Please try again.'
        );
      }
    }, 400);
  };

  const handleUnsubscribe = () => {
    if (!currentSubscriberEmail) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS);
      if (stored) {
        const currentList: NewsletterSubscriber[] = JSON.parse(stored) || [];
        const updatedList = currentList.map((s) =>
          s.email.toLowerCase() === currentSubscriberEmail.toLowerCase()
            ? { ...s, active: false }
            : s
        );
        localStorage.setItem(
          STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS,
          JSON.stringify(updatedList)
        );
        setActiveSubscribers(updatedList.filter((s) => s.active));
        setStatus('idle');
        setCurrentSubscriberEmail(null);
      }
    } catch (err) {
      console.error('Error unsubscribing', err);
    }
  };

  return (
    <div
      id="newsletter-signup-widget"
      className="relative rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-md overflow-hidden"
    >
      {/* Decorative Glow effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading & Context */}
        <div className="lg:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {language === 'NE'
                ? 'नयाँ प्रविधि र एआई अपडेट'
                : 'Web Tech & AI Newsletter'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 font-heading tracking-tight">
            {language === 'NE'
              ? 'वेबसाइट डिजाइन र एआई सिकाइ अपडेट प्राप्त गर्नुहोस्'
              : 'Stay in the Loop with Web & AI Tech'}
          </h3>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            {language === 'NE'
              ? 'नयाँ वेबसाइट टेम्प्लेट, आधुनिक वेब विकास शैली, र उपयोगी एआई उपकरण सम्बन्धी जानकारी सिधै आफ्नो इमेलमा पाउनुहोस्। कुनै स्पाम छैन, जब मन लाग्छ अनसब्सक्राइब गर्न सक्नुहुन्छ।'
              : 'Get free updates on new web templates, modern web engineering practices, and practical AI tools. No spam, zero noise, unsubscribe anytime with one click.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {language === 'NE'
                  ? `${activeSubscribers.length} जना सक्रिय पाठक जोडिनुभएको छ`
                  : `${activeSubscribers.length} active subscriber${activeSubscribers.length === 1 ? '' : 's'}`}
              </span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {language === 'NE' ? 'इमेल गोपनीयता सुरक्षित' : 'Privacy strictly protected'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Signup Form or Status Card */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {status === 'success' || status === 'already' ? (
              <motion.div
                key="subscribed-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-slate-200 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-100 font-heading">
                      {status === 'success'
                        ? language === 'NE'
                          ? 'सफलतापूर्वक सब्सक्राइब भयो!'
                          : 'You’re on the list!'
                        : language === 'NE'
                        ? 'तपाईँ पहिले नै जोडिनुभएको छ!'
                        : 'Already Subscribed!'}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {language === 'NE'
                        ? `${currentSubscriberEmail} मा नयाँ अपडेटहरू पठाइनेछ। हामीसँग जोडिनुभएकोमा धन्यवाद!`
                        : `We’ll send new web development releases and AI insights to ${currentSubscriberEmail}.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setCurrentSubscriberEmail(null);
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    {language === 'NE' ? 'अर्को इमेल थप्नुहोस्' : 'Add another email'}
                  </button>

                  <button
                    type="button"
                    onClick={handleUnsubscribe}
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    {language === 'NE' ? 'अनसब्सक्राइब गर्नुहोस्' : 'Unsubscribe'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form-state"
                onSubmit={handleSubscribe}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="newsletter-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder={
                      language === 'NE'
                        ? 'तपाईँको इमेल ठेगाना (उदा: name@gmail.com)'
                        : 'Enter your email address (e.g. name@gmail.com)'
                    }
                    disabled={status === 'loading'}
                    className="w-full pl-10 pr-32 py-3 sm:py-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-500 text-sm transition-all outline-none"
                  />
                  <div className="absolute inset-y-1.5 right-1.5 flex items-center">
                    <button
                      id="newsletter-submit-btn"
                      type="submit"
                      disabled={status === 'loading'}
                      className="h-full px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {status === 'loading' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{language === 'NE' ? 'जोडिनुहोस्' : 'Subscribe'}</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-rose-400 text-xs px-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                <p className="text-[11px] text-slate-500 px-1">
                  {language === 'NE'
                    ? 'हामी तपाईँको इनबक्सको सम्मान गर्छौं। कुनै अनावश्यक विज्ञापन वा स्पाम पठाइने छैन।'
                    : 'We respect your inbox. Strict zero-spam policy, only genuine tech updates.'}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
