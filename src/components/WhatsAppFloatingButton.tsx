import React from 'react';
import { motion } from 'motion/react';
import { Language } from '../types';

interface WhatsAppFloatingButtonProps {
  language: Language;
  whatsappNumber?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  language,
  whatsappNumber = '9816689232',
}) => {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const greeting =
    language === 'NE'
      ? 'नमस्ते राजाबाबु, म तपाईँको वेबसाइटबाट सम्पर्क गर्दैछु।'
      : 'Hello Rajababu, I visited your official website and would like to connect!';
  const whatsappUrl = `https://wa.me/977${cleanNumber}?text=${encodeURIComponent(greeting)}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="btn-floating-whatsapp"
        aria-label={
          language === 'NE'
            ? 'राजाबाबु मेहतासँग ह्वाट्सएपमा कुरा गर्नुहोस्'
            : 'Chat with Rajababu Mehta on WhatsApp'
        }
        className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da851] text-white shadow-2xl shadow-[#25D366]/40 hover:shadow-[#25D366]/60 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      >
        {/* Subtle breathing ripple pulse */}
        <span
          className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-50 animate-ping pointer-events-none"
          style={{ animationDuration: '3s' }}
        />

        {/* Official WhatsApp Logo SVG */}
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          className="w-8 h-8 sm:w-9 sm:h-9 fill-white relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.101-.477-.15-.678.15-.2.301-.777.978-.953 1.18-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.786-1.676-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.238-.244-.588-.493-.509-.678-.518l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.2 2.123 3.242 5.143 4.547.719.311 1.28.497 1.718.636.722.23 1.379.197 1.9-.12.581-.354 1.78-1.272 2.031-2.502.251-1.23.251-2.283.176-2.502-.075-.226-.276-.326-.577-.476zM12.042 21.87c-1.802 0-3.567-.487-5.11-1.408l-.366-.217-3.8 1 .998-3.704-.239-.38c-1.01-1.609-1.543-3.469-1.543-5.38 0-5.526 4.496-10.021 10.023-10.021 2.678 0 5.195 1.043 7.087 2.937 1.892 1.894 2.934 4.414 2.933 7.094-.002 5.528-4.498 10.023-10.027 10.023zM20.52 3.48c-2.264-2.268-5.276-3.518-8.478-3.518-6.606 0-11.982 5.374-11.985 11.982 0 2.112.552 4.173 1.6 6.012l-1.698 6.204 6.347-1.665c1.77 1.012 3.791 1.545 5.854 1.546h.005c6.604 0 11.982-5.375 11.986-11.984 0-3.201-1.246-6.214-3.511-8.48z" />
        </svg>

        {/* Active Online Status Badge */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white flex items-center justify-center shadow-md">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 animate-pulse" />
        </span>

        {/* Hover Tooltip Card */}
        <span className="opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3.5 py-2 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-white shadow-2xl flex items-center gap-2 whitespace-nowrap backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-100 font-heading">
            {language === 'NE' ? 'ह्वाट्सएपमा च्याट गर्नुहोस्' : 'Chat on WhatsApp'}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-medium">9816689232</span>
        </span>
      </a>
    </motion.div>
  );
};
