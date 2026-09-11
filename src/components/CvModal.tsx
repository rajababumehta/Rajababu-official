import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  GraduationCap,
  Briefcase,
  Code2,
  Globe,
  Sparkles,
  Calendar,
  Languages as LanguagesIcon,
  Share2,
  FileText,
} from 'lucide-react';
import { RAJABABU_CV_DATA } from '../data/cvData';
import { Language } from '../types';

interface CvModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onShowToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const CvModal: React.FC<CvModalProps> = ({
  isOpen,
  onClose,
  language,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const cv = RAJABABU_CV_DATA;

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrint = () => {
    onShowToast(
      language === 'NE'
        ? 'प्रिन्ट वा PDF सुरक्षित गर्न तयार गरिँदै...'
        : 'Preparing CV for PDF download / print...',
      'info'
    );
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCopyText = () => {
    const plainTextCv = `=========================================
${cv.name}
${cv.role}
=========================================
Location: ${cv.location}
Email: ${cv.email}
Phone: ${cv.phone}
Website: ${cv.website}

--- PROFESSIONAL SUMMARY ---
${cv.summary}

--- CAREER OBJECTIVE ---
${cv.objective}

--- EDUCATION ---
• ${cv.education[0].degree} (${cv.education[0].status})
  ${cv.education[0].institution}
• ${cv.education[1].degree} (${cv.education[1].status})
  ${cv.education[1].institution}

--- TECHNICAL SKILLS ---
${cv.technicalSkills.map((s) => `• ${s}`).join('\n')}

--- PROJECTS ---
• ${cv.projects[0].title}
  ${cv.projects[0].type}
  Website: ${cv.projects[0].url}

--- EXPERIENCE ---
${cv.experience.title} (${cv.experience.duration})
${cv.experience.description}

--- LANGUAGES ---
${cv.languages.join(', ')}

--- SOCIAL MEDIA ---
• Facebook: Available on request
• Instagram: Available on request

--- PERSONAL DETAILS ---
Date of Birth: ${cv.personalDetails.dobBs} (${cv.personalDetails.dobAd})
Location: ${cv.personalDetails.location}

=========================================
${cv.name}
${cv.role}
=========================================`;

    navigator.clipboard.writeText(plainTextCv);
    setCopied(true);
    onShowToast(
      language === 'NE'
        ? 'CV को सम्पूर्ण विवरण सफलतापूर्वक कपी गरियो!'
        : 'Full CV content copied to clipboard!',
      'success'
    );
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md no-print"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10"
          >
            {/* Top Action Bar (hidden on print) */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{language === 'NE' ? 'राजाबाबु मेहताको आधिकारिक CV' : 'Official Curriculum Vitae (CV)'}</span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      Verified
                    </span>
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer"
                  title={language === 'NE' ? 'PDF डाउनलोड वा प्रिन्ट गर्नुहोस्' : 'Download CV as PDF'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'NE' ? 'डाउनलोड PDF' : 'Download CV (PDF)'}</span>
                </button>

                <button
                  onClick={handleCopyText}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all active:scale-95 cursor-pointer"
                  title="Copy CV text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all focus:outline-none"
                  aria-label="Close CV"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable CV Document Body */}
            <div className="overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-8 bg-slate-900/90 text-slate-200">
              
              {/* Printable CV Paper Sheet Target */}
              <div
                id="printable-cv-document"
                className="bg-slate-950/60 sm:bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-lg space-y-8"
              >
                {/* CV Header: Identity & Contact Info */}
                <div className="border-b border-slate-800 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight font-heading uppercase">
                        {cv.name}
                      </h1>
                      <p className="text-sm sm:text-base font-semibold text-blue-400 mt-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>{cv.role}</span>
                      </p>
                    </div>

                    {/* Quick Contact Chips */}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{cv.location}</span>
                      </div>
                      <a
                        href={`mailto:${cv.email}`}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-blue-400 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{cv.email}</span>
                      </a>
                      <a
                        href={`tel:${cv.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:text-emerald-400 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{cv.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Section 1: Professional Summary */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    <span>{language === 'NE' ? 'व्यावसायिक सारांश (Professional Summary)' : 'Professional Summary'}</span>
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed pl-4 border-l-2 border-blue-500/30">
                    {cv.summary}
                  </p>
                </div>

                {/* Section 2: Career Objective */}
                <div className="space-y-2">
                  <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                    <span>{language === 'NE' ? 'करियर उद्देश्य (Career Objective)' : 'Career Objective'}</span>
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                    {cv.objective}
                  </p>
                </div>

                {/* Section 3: Education */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'NE' ? 'शैक्षिक योग्यता (Education)' : 'Education'}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cv.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-100">{edu.degree}</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                              {edu.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-snug">{edu.institution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Technical Skills */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>{language === 'NE' ? 'प्राविधिक सीपहरू (Technical Skills)' : 'Technical Skills'}</span>
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {cv.technicalSkills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 5: Projects */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-400" />
                    <span>{language === 'NE' ? 'प्रमुख परियोजना (Projects)' : 'Projects'}</span>
                  </h2>
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-purple-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-100">
                          {cv.projects[0].title}
                        </h3>
                        <p className="text-xs text-purple-300 font-medium">{cv.projects[0].type}</p>
                      </div>
                      <a
                        href={cv.projects[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-bold transition-all w-fit no-print"
                      >
                        <span>aiclipzone.vercel.app</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cv.projects[0].description}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-2 hidden print:block">
                      URL: {cv.projects[0].url}
                    </p>
                  </div>
                </div>

                {/* Section 6: Experience */}
                <div className="space-y-3">
                  <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    <span>{language === 'NE' ? 'कार्य अनुभव (Experience)' : 'Experience'}</span>
                  </h2>
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-100">
                        {cv.experience.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold w-fit">
                        {cv.experience.duration}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {cv.experience.description}
                    </p>
                  </div>
                </div>

                {/* Section 7 & 8: Languages & Personal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Languages */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                      <LanguagesIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{language === 'NE' ? 'भाषाहरू (Languages)' : 'Languages'}</span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {cv.languages.map((lang, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="space-y-2">
                    <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{language === 'NE' ? 'व्यक्तिगत विवरण (Personal Details)' : 'Personal Details'}</span>
                    </h2>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>
                        <strong className="text-slate-400">Date of Birth:</strong>{' '}
                        {cv.personalDetails.dobBs} ({cv.personalDetails.dobAd})
                      </p>
                      <p>
                        <strong className="text-slate-400">Location:</strong> {cv.personalDetails.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 9: Social Media */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{language === 'NE' ? 'सामाजिक सञ्जाल (Social Media)' : 'Social Media'}</span>
                  </h2>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                    <div>
                      <strong className="text-slate-300">Facebook:</strong> Available on request
                    </div>
                    <div>
                      <strong className="text-slate-300">Instagram:</strong> Available on request
                    </div>
                  </div>
                </div>

                {/* Footer Signature */}
                <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
                  <div>
                    <span className="font-bold text-slate-200 block text-sm">{cv.name}</span>
                    <span className="text-blue-400">{cv.role}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Official Portfolio: rajababumehta.com.np
                  </div>
                </div>

              </div>

              {/* Bottom Actions inside modal (hidden on print) */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 no-print">
                <p className="text-xs text-slate-400">
                  {language === 'NE'
                    ? 'यो बायोडाटा (CV) उच्च गुणस्तरको PDF को रूपमा सिधै डाउनलोड वा प्रिन्ट गर्न सकिन्छ।'
                    : 'This verified Curriculum Vitae can be saved directly as a clean PDF or printed.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'NE' ? 'डाउनलोड PDF' : 'Download CV (PDF)'}</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    {language === 'NE' ? 'बन्द गर्नुहोस्' : 'Close'}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
