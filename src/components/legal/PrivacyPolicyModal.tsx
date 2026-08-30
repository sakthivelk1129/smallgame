import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  Globe, 
  CheckCircle2, 
  Mail,
  AlertCircle
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl font-black shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-slate-100">
                Privacy Policy
              </h2>
              <p className="text-xs text-slate-400">Last updated: August 2026 • Compliant with Google AdSense & GDPR/CCPA</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Legal Text */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs space-y-1">
            <p>
              At <strong>Small Paper Game</strong> (accessible via our web application), one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by our platform and how we use it.
            </p>
            <p>
              If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong className="text-amber-400">sakthivelk1129@gmail.com</strong>.
            </p>
          </div>

          {/* Section 1: Google AdSense & DoubleClick DART Cookies */}
          <div className="space-y-2">
            <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
              <span>1. Google DoubleClick DART Cookie & Advertising Partners</span>
            </h3>
            <p className="text-slate-300 text-xs">
              Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our website and other sites on the internet.
            </p>
            <p className="text-slate-300 text-xs">
              Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-blue-400 underline">https://policies.google.com/technologies/ads</a>.
            </p>
            <p className="text-slate-400 text-xs">
              Our advertising partners may use cookies and web beacons on our site. Our advertising partners include Google AdSense. Each of our advertising partners has their own Privacy Policy for their policies on user data.
            </p>
          </div>

          {/* Section 2: Information We Collect */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              <span>2. Information We Collect</span>
            </h3>
            <p className="text-slate-300 text-xs">
              When you use our party arcade, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li><strong>Guest Information:</strong> Nickname and chosen avatar stored locally in browser localStorage to save game state and level progression.</li>
              <li><strong>Google Authentication:</strong> When opting for Google Login, your public profile name, email, and avatar are securely handled to maintain your cloud rank and statistics.</li>
              <li><strong>Game Session Data:</strong> Ephemeral in-game moves, room codes, chat messages, and scores required to sync real-time WebSocket gameplay across participants.</li>
            </ul>
          </div>

          {/* Section 3: Log Files & Analytics */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              <span>3. Log Files</span>
            </h3>
            <p className="text-slate-300 text-xs">
              Desi Party Arcade follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
            </p>
          </div>

          {/* Section 4: GDPR Data Protection Rights */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              <span>4. GDPR Data Protection Rights</span>
            </h3>
            <p className="text-slate-300 text-xs">
              We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>The right to access – You have the right to request copies of your personal data.</li>
              <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
              <li>The right to erasure – You have the right to request that we erase your personal data under certain conditions.</li>
              <li>The right to restrict processing & data portability.</li>
            </ul>
          </div>

          {/* Section 5: CCPA Privacy Rights */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              <span>5. CCPA Privacy Rights (Do Not Sell My Personal Information)</span>
            </h3>
            <p className="text-slate-300 text-xs">
              Under the CCPA, among other rights, California consumers have the right to request that a business disclose what categories of personal data it collects and request that a business not sell the consumer's personal data. We do not sell user personal data.
            </p>
          </div>

          {/* Section 6: Children's Information */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              <span>6. Children's Information (COPPA)</span>
            </h3>
            <p className="text-slate-300 text-xs">
              Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Desi Party Arcade does not knowingly collect any Personal Identifiable Information from children under the age of 13.
            </p>
          </div>

          {/* Contact */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <strong>Data Controller Contact:</strong> Sakthivel (<span className="text-amber-400 font-mono">sakthivelk1129@gmail.com</span>)
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
