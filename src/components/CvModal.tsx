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
  Loader2,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>('/brand-avatar.png');
  const cv = RAJABABU_CV_DATA;

  // Pre-render avatar as dataURL to ensure 100% crisp rendering without CORS/canvas taint
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 320;
        canvas.height = img.naturalHeight || 320;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const data = canvas.toDataURL('image/png');
          setAvatarDataUrl(data);
        }
      } catch (err) {
        console.warn('Avatar dataURL creation note:', err);
      }
    };
    img.src = '/brand-avatar.png';
  }, []);

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

  // Direct 1-Page PDF Download
  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-cv-document');
    if (!element) return;

    setIsDownloading(true);
    onShowToast(
      language === 'NE'
        ? '१-पेज आधिकारिक सेतो PDF तयार गरिँदैछ...'
        : 'Generating verified 1-page white PDF...',
      'info'
    );

    try {
      // High-resolution canvas snapshot on 100% pure white background
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = 210; // mm
      const pageHeight = 297; // mm

      // Full A4 page rendering with clean 100% white background (no dark borders)
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');

      // Make all blue links interactive and clickable in the PDF
      const docRect = element.getBoundingClientRect();
      const linkElements = element.querySelectorAll<HTMLAnchorElement>('a[href]');
      linkElements.forEach((anchor) => {
        const aRect = anchor.getBoundingClientRect();
        if (aRect.width > 0 && aRect.height > 0 && anchor.href) {
          const x = ((aRect.left - docRect.left) / docRect.width) * pageWidth;
          const y = ((aRect.top - docRect.top) / docRect.height) * pageHeight;
          const w = (aRect.width / docRect.width) * pageWidth;
          const h = (aRect.height / docRect.height) * pageHeight;
          pdf.link(x, y, w, h, { url: anchor.href });
        }
      });

      pdf.save('Rajababu_Mehta_CV.pdf');

      onShowToast(
        language === 'NE'
          ? 'CV सफलतापूर्वक १ पेजमा डाउनलोड भयो!'
          : 'CV downloaded successfully on 1 page!',
        'success'
      );
    } catch (err) {
      console.error('PDF error, falling back to print dialog:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // System Print / Save as PDF
  const handlePrint = () => {
    onShowToast(
      language === 'NE'
        ? 'प्रिन्ट / PDF विन्डो खुल्दैछ...'
        : 'Opening print / save as PDF window...',
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
  ${cv.projects[0].description}

--- EXPERIENCE ---
${cv.experience.title} (${cv.experience.duration})
${cv.experience.description}

--- LANGUAGES ---
${cv.languages.join(', ')}

--- SOCIAL MEDIA ---
• Facebook: ${cv.socialMedia[0].url}
• Instagram: @${cv.socialMedia[1].handle} (${cv.socialMedia[1].url})

--- PERSONAL DETAILS ---
Date of Birth: ${cv.personalDetails.dobBs} (${cv.personalDetails.dobAd})
Location: ${cv.personalDetails.location}

=========================================
${cv.name} · ${cv.website}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden z-10"
          >
            {/* Top Action Bar (hidden on print) */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/95 border-b border-slate-800 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{language === 'NE' ? 'राजाबाबु मेहताको आधिकारिक CV' : 'Official Curriculum Vitae (CV)'}</span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                      1-Page PDF
                    </span>
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* 1-Click Direct PDF Download */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 active:scale-95 cursor-pointer"
                  title={language === 'NE' ? '१-पेज PDF सिधै डाउनलोड गर्नुहोस्' : 'Download Verified 1-Page PDF'}
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{language === 'NE' ? 'डाउनलोड PDF (1 Page)' : 'Download PDF (1 Page)'}</span>
                </button>

                {/* Print / System Dialog */}
                <button
                  onClick={handlePrint}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all active:scale-95 cursor-pointer"
                  title={language === 'NE' ? 'प्रिन्ट गर्नुहोस्' : 'Print / Save as PDF'}
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>{language === 'NE' ? 'प्रिन्ट' : 'Print'}</span>
                </button>

                {/* Copy Text */}
                <button
                  onClick={handleCopyText}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all active:scale-95 cursor-pointer"
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

            {/* Scrollable CV Document Viewport */}
            <div className="overflow-y-auto p-3 sm:p-6 bg-slate-900/90 text-slate-200">
              
              {/* 1-PAGE PRINTABLE CV DOCUMENT TARGET - Pure White Paper Sheet */}
              <div
                id="printable-cv-document"
                className="bg-white text-slate-900 border border-slate-200 rounded-xl p-5 sm:p-7 shadow-2xl space-y-4 max-w-3xl mx-auto font-sans"
                style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
              >
                {/* 1. CV HEADER: Avatar, Name, Title, Institution, and Contact Matrix */}
                <div className="pb-4 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-center gap-3.5 sm:gap-4">
                      {/* High-Resolution Clear Avatar Photo */}
                      <div className="cv-avatar-box shrink-0 w-[72px] h-[72px] sm:w-[76px] sm:h-[76px] rounded-full p-[2px] bg-blue-600 shadow-sm border border-blue-200">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                          <img
                            src={avatarDataUrl}
                            alt={cv.name}
                            className="cv-avatar-img w-full h-full object-cover object-center"
                            crossOrigin="anonymous"
                            loading="eager"
                            decoding="sync"
                          />
                        </div>
                      </div>

                      <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight font-heading uppercase">
                          {cv.name}
                        </h1>
                        <p className="text-xs sm:text-sm font-bold text-blue-600 mt-0.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                          <span>{cv.role}</span>
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                          {cv.education[0].institution}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quick Contact Chips (Prominent Blue Links) */}
                    <div className="flex flex-col sm:items-end gap-1 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{cv.location}</span>
                      </div>
                      <a
                        href={`tel:${cv.phone}`}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                      >
                        <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{cv.phone}</span>
                      </a>
                      <a
                        href={`mailto:${cv.email}`}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                      >
                        <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{cv.email}</span>
                      </a>
                      <a
                        href={cv.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                      >
                        <Globe className="w-3 h-3 text-blue-600 shrink-0" />
                        <span className="font-mono text-[10.5px]">rajababumehta.com.np</span>
                      </a>
                    </div>

                  </div>
                </div>

                {/* 2. COMPACT 2-COLUMN STRUCTURE (Guaranteed to fit 1 single page) */}
                <div className="cv-columns-grid grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
                  
                  {/* LEFT COLUMN (42% width) */}
                  <div className="md:col-span-5 space-y-3">
                    
                    {/* Education */}
                    <div className="space-y-1.5">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{language === 'NE' ? 'शैक्षिक योग्यता (Education)' : 'Education'}</span>
                      </h2>
                      <div className="space-y-1.5">
                        {cv.education.map((edu, idx) => (
                          <div
                            key={idx}
                            className="cv-card-bg p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]"
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-bold text-slate-900">{edu.degree}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border ${
                                idx === 0
                                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              }`}>
                                {edu.status}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-600 leading-tight">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Skills */}
                    <div className="space-y-1.5">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{language === 'NE' ? 'प्राविधिक सीप (Skills)' : 'Technical Skills'}</span>
                      </h2>
                      <div className="flex flex-wrap gap-1.5">
                        {cv.technicalSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-blue-50/80 border border-blue-200 text-[10.5px] text-slate-800 font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    <div className="space-y-1">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <LanguagesIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{language === 'NE' ? 'भाषाहरू (Languages)' : 'Languages'}</span>
                      </h2>
                      <p className="text-[11px] text-slate-700 font-medium">
                        {cv.languages.join(' · ')}
                      </p>
                    </div>

                    {/* Personal Details */}
                    <div className="space-y-1">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{language === 'NE' ? 'व्यक्तिगत विवरण (Personal)' : 'Personal Details'}</span>
                      </h2>
                      <div className="text-[10.5px] text-slate-700 space-y-0.5 font-medium">
                        <p>
                          <strong className="text-slate-900">DOB:</strong> {cv.personalDetails.dobBs} ({cv.personalDetails.dobAd})
                        </p>
                        <p>
                          <strong className="text-slate-900">Location:</strong> {cv.personalDetails.location}
                        </p>
                      </div>
                    </div>

                    {/* Social Profiles (Prominent Blue Links) */}
                    <div className="space-y-1.5 pt-0.5">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{language === 'NE' ? 'सामाजिक सञ्जाल (Social Profiles)' : 'Social Profiles'}</span>
                      </h2>
                      <div className="space-y-1 text-[10.5px]">
                        <a
                          href={cv.socialMedia[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                        >
                          <span><strong>Facebook:</strong> Rajababu Mehta</span>
                          <ExternalLink className="w-3 h-3 text-blue-600 no-print" />
                        </a>
                        <a
                          href={cv.socialMedia[1].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                        >
                          <span><strong>Instagram:</strong> @mr.rajababumehta</span>
                          <ExternalLink className="w-3 h-3 text-blue-600 no-print" />
                        </a>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN (58% width) */}
                  <div className="md:col-span-7 space-y-3">
                    
                    {/* Professional Summary */}
                    <div className="space-y-1">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        <span>{language === 'NE' ? 'व्यावसायिक सारांश (Summary)' : 'Professional Summary'}</span>
                      </h2>
                      <p className="text-[11px] text-slate-700 leading-relaxed pl-3 border-l-2 border-blue-600 font-normal">
                        {cv.summary}
                      </p>
                    </div>

                    {/* Career Objective */}
                    <div className="space-y-1">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        <span>{language === 'NE' ? 'करियर उद्देश्य (Objective)' : 'Career Objective'}</span>
                      </h2>
                      <p className="text-[11px] text-slate-700 leading-relaxed pl-3 border-l-2 border-indigo-600 font-normal">
                        {cv.objective}
                      </p>
                    </div>

                    {/* Experience */}
                    <div className="space-y-1.5">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{language === 'NE' ? 'कार्य अनुभव (Experience)' : 'Experience'}</span>
                      </h2>
                      <div className="cv-card-bg p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-slate-900">{cv.experience.title}</h3>
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 text-[9.5px] font-bold">
                            {cv.experience.duration}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-700 leading-relaxed">
                          {cv.experience.description}
                        </p>
                      </div>
                    </div>

                    {/* Key Project (Prominent Blue Link) */}
                    <div className="space-y-1.5">
                      <h2 className="text-[11px] font-extrabold tracking-wider text-slate-900 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-200">
                        <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{language === 'NE' ? 'प्रमुख परियोजना (Key Project)' : 'Key Project'}</span>
                      </h2>
                      <div className="cv-card-bg p-2.5 rounded-lg bg-slate-50 border border-blue-200 text-[11px] space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-slate-900">{cv.projects[0].title}</h3>
                          <a
                            href={cv.projects[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <span>aiclipzone.vercel.app</span>
                            <ExternalLink className="w-3 h-3 text-blue-600 no-print" />
                          </a>
                        </div>
                        <p className="text-[10.5px] text-blue-800 font-semibold">
                          {cv.projects[0].type}
                        </p>
                        <p className="text-[10.5px] text-slate-700 leading-relaxed">
                          {cv.projects[0].description}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 3. FOOTER SIGNATURE BAR */}
                <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10.5px] text-slate-600 font-medium">
                  <a
                    href={cv.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Official Portfolio: rajababumehta.com.np
                  </a>
                  <span className="text-slate-500">Verified Student & AI Web Developer</span>
                </div>

              </div>

              {/* Modal Bottom Guidance (hidden on print) */}
              <div className="max-w-3xl mx-auto pt-3 flex items-center justify-between text-xs text-slate-400 no-print">
                <span>
                  {language === 'NE'
                    ? '✨ १-पेज उच्च-गुणस्तरको PDF तयार छ।'
                    : '✨ Single-page high-definition PDF ready.'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>{language === 'NE' ? 'डाउनलोड PDF' : 'Download PDF'}</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
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

