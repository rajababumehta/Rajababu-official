import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallButtonProps {
  language?: Language;
  variant?: 'navbar' | 'mobile-menu' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  language = 'EN',
  variant = 'navbar',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Handle click for Desktop / Android / Chromium vs iOS Safari
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // In cases where browser hasn't fired beforeinstallprompt yet or already dismissed
      setShowIOSGuide(true);
    }
  };

  const labelText = language === 'NE' ? 'एप स्थापना गर्नुहोस्' : 'Install App';
  const iosLabelText = language === 'NE' ? 'होम स्क्रिनमा राख्नुहोस्' : 'Add to Home Screen';

  const renderButtonContent = () => {
    if (variant === 'mobile-menu') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-600/30 transition-all font-medium text-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-slate-100">{labelText}</div>
              <div className="text-[11px] text-slate-400">
                {language === 'NE' ? 'अफलाइन चलाउन मिल्ने' : 'Fast, offline-ready web app'}
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-blue-400" />
        </button>
      );
    }

    if (variant === 'floating') {
      return (
        <button
          type="button"
          onClick={handleClick}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xl shadow-blue-500/30 border border-blue-400/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>{labelText}</span>
        </button>
      );
    }

    // Default: 'navbar' compact pill
    return (
      <button
        type="button"
        id="btn-pwa-install"
        onClick={handleClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap"
        title={labelText}
      >
        <Download className="w-3.5 h-3.5 text-blue-400" />
        <span className="hidden sm:inline">{labelText}</span>
      </button>
    );
  };

  return (
    <>
      {renderButtonContent()}

      {/* iOS & Browser Guided Installation Modal */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shadow-md shadow-blue-500/20">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src="/brand-avatar.png"
                    alt="Rajababu Mehta"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-heading">
                  {language === 'NE' ? 'एप स्थापना गर्नुहोस्' : 'Install Rajababu Mehta App'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'NE' ? 'मोबाइल वा कम्प्युटरमा' : 'Install on Mobile or PC'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 mb-5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  1
                </span>
                <span>
                  {language === 'NE'
                    ? 'ब्राउजरको तल वा माथि रहेको शेयर (Share) वा तीन थोप्ला (⋮) बटनमा थिच्नुहोस्।'
                    : 'Tap the browser Share button (in Safari) or the Menu (⋮) button in Chrome.'}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  2
                </span>
                <span>
                  {language === 'NE'
                    ? 'सूचीबाट "Add to Home Screen" (होम स्क्रिनमा थप्नुहोस्) वा "Install" विकल्प छान्नुहोस्।'
                    : 'Scroll and tap "Add to Home Screen" or "Install App".'}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-[11px]">
                  ✓
                </span>
                <span>
                  {language === 'NE'
                    ? 'अब तपाईं सिधै मोबाइल एप झैँ द्रुत गतिमा चलाउन सक्नुहुनेछ!'
                    : 'Enjoy instant launch and offline access directly from your home screen!'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-colors"
            >
              {language === 'NE' ? 'बुझें (ठिक छ)' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
