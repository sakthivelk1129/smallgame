import React from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Gamepad2 
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-black shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif font-black text-slate-100">
                Terms of Service
              </h2>
              <p className="text-xs text-slate-400">Rules of Fair Play & User Agreement • Small Paper Game</p>
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          <div className="space-y-2">
            <h3 className="font-bold text-amber-300 text-sm">1. Acceptance of Terms</h3>
            <p className="text-slate-300 text-xs">
              By accessing and playing games on <strong>Small Paper Game</strong> (including Small Paper Game BOOST, Kingdom Court: King & Thief, Bulls & Cows, and Cricket Card Battle), you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm">2. Fair Play & Community Conduct</h3>
            <p className="text-slate-300 text-xs">
              To ensure an enjoyable experience for all players across our public and private rooms:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>Users must not use abusive, hateful, or discriminatory language in room chat or player nicknames.</li>
              <li>Attempting to manipulate WebSocket packets, cheat in games, or reverse-engineer secret card decks is strictly prohibited.</li>
              <li>Hosts have the authority to remove or kick disruptive players from private lobbies.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm">3. Advertisements & Monetization Disclosure</h3>
            <p className="text-slate-300 text-xs">
              Desi Party Arcade is free-to-play. We may display standard, non-intrusive banner advertisements provided by Google Ads / Google AdSense and accredited advertising networks on our portal and login views. Advertisements will not interfere with active gameplay controls or live match visibility.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm">4. Intellectual Property</h3>
            <p className="text-slate-300 text-xs">
              The arcade software, custom visual assets, animations, game rule algorithms, and design elements are the intellectual property of Desi Party Arcade and its creators. Traditional party game concepts (such as Indian court games and classroom slip games) are celebrated as cultural heritage.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-100 text-sm">5. Disclaimer of Warranties & Limitation of Liability</h3>
            <p className="text-slate-300 text-xs">
              The games and services are provided on an 'as is' and 'as available' basis without warranties of any kind. In no event shall Desi Party Arcade or its contributors be liable for any damages arising out of the use or inability to use the platform.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            For questions regarding these terms, contact <strong className="text-amber-400">sakthivelk1129@gmail.com</strong>.
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
            Agree & Close
          </button>
        </div>

      </div>
    </div>
  );
};
