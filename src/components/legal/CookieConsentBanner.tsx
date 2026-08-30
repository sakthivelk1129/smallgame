import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Check, X, ExternalLink, Settings } from 'lucide-react';
import { sound } from '../../utils/sound';

interface CookieConsentBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [show, setShow] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [adsCookies, setAdsCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(true);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('desi_arcade_cookie_consent');
      if (!consent) {
        // Show after 1 second
        const timer = setTimeout(() => setShow(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // quiet fallback
    }
  }, []);

  const handleAcceptAll = () => {
    sound.playClick();
    try {
      localStorage.setItem('desi_arcade_cookie_consent', JSON.stringify({
        essential: true,
        analytics: true,
        advertising: true,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setShow(false);
  };

  const handleAcceptSelected = () => {
    sound.playClick();
    try {
      localStorage.setItem('desi_arcade_cookie_consent', JSON.stringify({
        essential: true,
        analytics: analyticsCookies,
        advertising: adsCookies,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setShow(false);
  };

  const handleRejectNonEssential = () => {
    sound.playClick();
    try {
      localStorage.setItem('desi_arcade_cookie_consent', JSON.stringify({
        essential: true,
        analytics: false,
        advertising: false,
        timestamp: new Date().toISOString()
      }));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside 
      id="cookie-consent-banner"
      aria-label="Cookie and Advertising Preferences"
      className="fixed bottom-14 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-lg bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md text-slate-100 select-none animate-fadeIn"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Cookie className="w-4 h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100">
              Cookie & Ad Transparency Notice
            </h4>
          </div>

          <button
            onClick={() => setShow(false)}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
          We use essential cookies for multiplayer game sessions and partner with Google AdSense to serve non-intrusive ads. You can accept or manage your preferences anytime.
        </p>

        {showCustomize && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Essential Game Cookies</div>
                <div className="text-[10px] text-slate-500">Required for room sync & player level</div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">Always Active</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-900">
              <div>
                <div className="font-bold text-slate-200">Personalized Google Ads</div>
                <div className="text-[10px] text-slate-500">Supports free arcade servers</div>
              </div>
              <input
                type="checkbox"
                checked={adsCookies}
                onChange={(e) => setAdsCookies(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onOpenPrivacyPolicy();
            }}
            className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Read Privacy Policy</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>

          <div className="flex items-center gap-1.5 ml-auto">
            {showCustomize ? (
              <button
                onClick={handleAcceptSelected}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Save Preferences
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowCustomize(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Customize
                </button>
                <button
                  onClick={handleRejectNonEssential}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md cursor-pointer"
                >
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </aside>
  );
};
