import React, { useState } from 'react';
import { X, BookOpen, Crown, Shield, Zap, Target, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { ROLE_DEFINITIONS, SPECIAL_EVENTS } from '../data/roles';
import { sound } from '../utils/sound';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'basics' | 'roles' | 'special' | 'scoring'>('basics');

  const rolesList = Object.values(ROLE_DEFINITIONS);
  const eventsList = Object.values(SPECIAL_EVENTS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-amber-200">How to Play Kingdom Court (King & Thief)</h2>
              <p className="text-xs text-slate-400">Royal Paper Chit Rules, Secret Roles & Deduction Guide</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'basics', label: '1. Quick Rules', icon: Crown },
            { id: 'roles', label: '2. All Roles', icon: Shield },
            { id: 'special', label: '3. Special Mode', icon: Zap },
            { id: 'scoring', label: '4. Scoring System', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
          
          {/* TAB 1: BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <h3 className="font-serif font-bold text-base mb-1 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  The Concept
                </h3>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Raja Rani is the traditional beloved social deduction party game modernized for fast online multiplayer.
                  4 to 12 players are secretly assigned royal roles by the server. Only the King is announced publicly!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">1</span>
                    Secret Role Assignment
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    You receive your secret identity (Police, Thief, Minister, Queen, etc.). Keep it strictly hidden!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">2</span>
                    The King Proclamation
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    The Raja is announced publicly to all players. The Raja is the sovereign ruler and scores 1000 pts.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">3</span>
                    Interrogation (Up to 3 Min)
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    The Police has up to 3 minutes (180s) to cross-examine court subjects and deduce who is the Thief!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">4</span>
                    The Final Accusation
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    Police clicks to accuse a suspect. Catching the Thief scores +300 pts! Missing gives the Thief +300 pts!
                  </p>
                </div>
              </div>

              {/* 2 Discussion Modes Explained */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2.5">
                <div className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Two Discussion Styles Available</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-slate-200 flex items-center gap-1.5 mb-1">
                      <span>💬 Option 1: Court Debate</span>
                    </div>
                    <p className="text-slate-400 leading-snug">
                      Online chat is open. Everyone can type clues, fake claims, confuse the Police, and throw suspicion!
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                      <span>👁️ Option 2: Face-to-Face</span>
                    </div>
                    <p className="text-slate-400 leading-snug">
                      Chat clues are muted! Ideal when friends are in the same room or on video call—stare into their eyes and read poker faces!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="font-bold text-xs text-slate-200 mb-2">💡 Winning Strategies</div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li><strong className="text-slate-200">As Police:</strong> Watch out for players trying too hard to act innocent, or quiet players hiding in the shadows.</li>
                  <li><strong className="text-slate-200">As Thief:</strong> Throw suspicion onto innocent Ministers or Farmers. Use emotes to act calm or mock the court!</li>
                  <li><strong className="text-slate-200">As Minister/Spy:</strong> Drop subtle hints without exposing your identity to the Thief.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                The role deck dynamically adjusts from 4 to 12 players:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rolesList.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <div className="text-2xl p-2 rounded-lg bg-slate-900 border border-slate-700">
                      {r.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-slate-200">{r.name}</div>
                        <div className="text-xs font-mono font-bold text-amber-400">{r.basePoints} pts</div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{r.mission}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SPECIAL MODE */}
          {activeTab === 'special' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
                <div className="font-bold text-xs flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-rose-400" />
                  🔴 Special Mode Features
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  In Special Mode, characters gain unique 1-use superpowers and each round triggers a dramatic court event!
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Special Character Abilities</div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-amber-400">👑 Raja: Royal Order</span> — Inspect 2 suspects to learn if they hold Special or Normal roles.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-pink-400">👸 Rani: Protection</span> — Cast a divine royal shield to block point theft or negative events.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-purple-400">🧙 Minister: Investigation</span> — Scan a suspect to confirm whether they are NOT the Thief.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-blue-400">👮 Police: Double Accusation</span> — If first accusation misses, gain a 2nd chance!
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-emerald-400">🕵️ Spy: Secret Clue</span> — Intercept wiretaps that confirm innocent subjects.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-fuchsia-400">🤡 Joker: Escape</span> — If accused by Police, you escape and Police scores 0!
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="font-bold text-rose-400">🥷 Thief: Midnight Heist</span> — Secretly steal 50 points from another player!
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Random Court Events</div>
                <div className="grid grid-cols-2 gap-2">
                  {eventsList.map((ev) => (
                    <div key={ev.type} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                      <div className="font-bold text-amber-300">{ev.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{ev.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCORING */}
          {activeTab === 'scoring' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="font-bold text-xs text-amber-300 mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Base Point Breakdown per Round
                </div>

                <div className="divide-y divide-slate-800 text-xs">
                  <div className="py-1.5 flex justify-between">
                    <span>👑 Raja (King)</span>
                    <span className="font-mono font-bold text-amber-400">+1000 pts</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span>👸 Rani (Queen)</span>
                    <span className="font-mono font-bold text-amber-400">+500 pts</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span>🧙 Minister (Counselor)</span>
                    <span className="font-mono font-bold text-amber-400">+400 pts</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span>👮 Police (Catches Thief)</span>
                    <span className="font-mono font-bold text-emerald-400">+300 pts</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span>👮 Police (Wrong Accusation)</span>
                    <span className="font-mono font-bold text-rose-400">0 pts</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span>🥷 Thief (Escapes Police)</span>
                    <span className="font-mono font-bold text-emerald-400">+100 pts bonus</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span>🥷 Thief (Caught by Police)</span>
                    <span className="font-mono font-bold text-rose-400">0 pts</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span>👤 Innocent False Accusation Bounty</span>
                    <span className="font-mono font-bold text-cyan-400">+50 pts compensation</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
                ⭐ <strong className="text-slate-200">XP & Progression:</strong> Winning a match grants +100 XP, top 3 finishes grant +50 XP, and every round played grants +10 XP. Level up to unlock prestigious royal titles and avatars!
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all"
          >
            Got It, Let’s Play!
          </button>
        </div>

      </div>
    </div>
  );
};
