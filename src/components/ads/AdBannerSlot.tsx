import React, { useState } from 'react';
import { Sparkles, Trophy, Zap, ShieldCheck, Flame, ExternalLink, Info, X } from 'lucide-react';
import { sound } from '../../utils/sound';

export type AdSlotPosition = 
  | 'desktop-top-leaderboard'      // 1. Top Leaderboard (728x90 / responsive)
  | 'desktop-left-skyscraper'     // 2. Left Tower (160x600 / 300x600)
  | 'desktop-right-skyscraper'    // 3. Right Tower (160x600 / 300x600)
  | 'desktop-bottom-leaderboard'   // 4. Bottom Leaderboard (728x90)
  | 'desktop-mid-left'            // 5. Mid Grid Left (300x250)
  | 'desktop-mid-right'           // 6. Mid Grid Right (300x250)
  | 'mobile-top-banner'           // 7. Mobile Top Banner (320x50 / responsive mobile leaderboard)
  | 'mobile-bottom-banner';       // 8. Mobile single bottom banner (320x50 / 300x50)

interface AdBannerSlotProps {
  position: AdSlotPosition;
  adClient?: string; // Optional Google AdSense client ID (e.g., "ca-pub-XXXXXXXXXXXXXXXX")
  adSlotId?: string; // Optional Google AdSense slot ID
  onActionClick?: () => void;
  className?: string;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  position,
  adClient,
  adSlotId,
  onActionClick,
  className = ''
}) => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  // =========================================================================
  // 1. DESKTOP TOP LEADERBOARD (728x90 / Responsive)
  // =========================================================================
  if (position === 'desktop-top-leaderboard') {
    return (
      <aside 
        id="ad-slot-desktop-top"
        aria-label="Advertisement Banner Top" 
        className={`hidden lg:block w-full max-w-5xl mx-auto my-3 select-none ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-slate-500 px-2 pb-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>ADVERTISEMENT • GOOGLE ADS PARTNER</span>
          </span>
          <span className="text-[9px] text-slate-600">728x90 LEADERBOARD</span>
        </div>

        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800/90 rounded-2xl p-3 px-5 shadow-lg flex items-center justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 text-2xl font-black shadow-md shrink-0 group-hover:scale-105 transition-transform">
              🏏
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  FEATURED SPONSOR
                </span>
                <span className="text-sm font-bold text-slate-100">
                  Cricket World Legends 2026 • 1,000 Player Card Deck
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Play real-time batting & bowling card battles, collect vintage stars, and climb the leaderboard!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                sound.playClick();
                onActionClick?.();
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Explore Deck</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // 2. DESKTOP LEFT SKYSCRAPER / TOWER (160x600 / 300x600)
  // =========================================================================
  if (position === 'desktop-left-skyscraper') {
    return (
      <aside 
        id="ad-slot-desktop-left"
        aria-label="Advertisement Banner Left Tower" 
        className={`hidden xl:flex flex-col justify-between w-60 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl select-none sticky top-20 h-fit space-y-4 ${className}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              SPONSORED
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold border border-blue-500/30">
              160x600
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-blue-950/60 via-slate-950 to-slate-950 border border-blue-500/30 text-center space-y-2.5">
            <div className="text-3xl">👑</div>
            <div className="font-serif font-black text-sm text-blue-300">
              Raja Rani Royal Club
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Master the ancient royal deduction game. Outsmart the Police as Thief or claim bounty as King!
            </p>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 flex items-center justify-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Instant Web Match</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-left">
            <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero App Downloads</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Share 6-digit room code with WhatsApp friends for instant party fun!
            </p>
          </div>
        </div>

        <div className="text-[9px] text-slate-500 text-center border-t border-slate-800/80 pt-2 font-mono">
          GOOGLE ADSENSE COMPLIANT AD SPACE
        </div>
      </aside>
    );
  }

  // =========================================================================
  // 3. DESKTOP RIGHT SKYSCRAPER / TOWER (160x600 / 300x600)
  // =========================================================================
  if (position === 'desktop-right-skyscraper') {
    return (
      <aside 
        id="ad-slot-desktop-right"
        aria-label="Advertisement Banner Right Tower" 
        className={`hidden xl:flex flex-col justify-between w-60 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl select-none sticky top-20 h-fit space-y-4 ${className}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              SPONSORED
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold border border-rose-500/30">
              🔥 HOT
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-rose-950/60 via-slate-950 to-slate-950 border border-rose-500/30 text-center space-y-2.5">
            <div className="text-3xl">🚀</div>
            <div className="font-serif font-black text-sm text-rose-300">
              BOOST Paper Slip Live
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Tamil Nadu's viral school slip game. Pick your slips secretly and scream <strong>BOOST!</strong>
            </p>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-rose-300 flex items-center justify-center gap-1 font-bold">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>Multiplayer Rounds</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-left">
            <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Live Leaderboards</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Earn XP, level up your avatar, and dominate global player ranks.
            </p>
          </div>
        </div>

        <div className="text-[9px] text-slate-500 text-center border-t border-slate-800/80 pt-2 font-mono">
          ADS AUTOMATICALLY HIDE IN GAME
        </div>
      </aside>
    );
  }

  // =========================================================================
  // 4. DESKTOP BOTTOM LEADERBOARD (728x90)
  // =========================================================================
  if (position === 'desktop-bottom-leaderboard') {
    return (
      <aside 
        id="ad-slot-desktop-bottom"
        aria-label="Advertisement Banner Bottom" 
        className={`hidden lg:block w-full max-w-5xl mx-auto mt-6 mb-2 select-none ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-slate-500 px-2 pb-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>ADVERTISEMENT • PREMIUM GAMING NETWORK</span>
          </span>
          <span className="text-[9px] text-slate-600">728x90 FOOTER LEADERBOARD</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-md shrink-0">
              🐂
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>Bulls & Cows 1v1 Word Mastermind</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                  NEW AI BOT MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sharpen your vocabulary and logic skills in 3 to 7-letter real-time word duels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 hidden xl:inline">Safe Google Ads Unit</span>
          </div>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // 5. DESKTOP MID-LEFT SPOTLIGHT (300x250 Medium Rectangle)
  // =========================================================================
  if (position === 'desktop-mid-left') {
    return (
      <aside 
        id="ad-slot-desktop-mid-left"
        aria-label="Advertisement 300x250 Left" 
        className={`hidden md:block w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 shadow-md select-none text-left space-y-2 ${className}`}
      >
        <div className="flex items-center justify-between text-[9px] uppercase font-mono tracking-widest text-slate-500 border-b border-slate-800 pb-1.5">
          <span>ADVERTISEMENT</span>
          <span>300x250</span>
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-bold text-amber-300">Fast Anti-Cheat Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Server-synchronized turns, zero client manipulation, and live audio cues.
          </p>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // 6. DESKTOP MID-RIGHT SPOTLIGHT (300x250 Medium Rectangle)
  // =========================================================================
  if (position === 'desktop-mid-right') {
    return (
      <aside 
        id="ad-slot-desktop-mid-right"
        aria-label="Advertisement 300x250 Right" 
        className={`hidden md:block w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 shadow-md select-none text-left space-y-2 ${className}`}
      >
        <div className="flex items-center justify-between text-[9px] uppercase font-mono tracking-widest text-slate-500 border-b border-slate-800 pb-1.5">
          <span>ADVERTISEMENT</span>
          <span>300x250</span>
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <span className="text-xs font-bold text-blue-300">Global Public Matchmaking</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Connect instantly with Indian party game players around the globe.
          </p>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // 7. MOBILE TOP BANNER (320x50 / 300x60 Standard Mobile Leaderboard)
  // =========================================================================
  if (position === 'mobile-top-banner') {
    return (
      <aside 
        id="ad-slot-mobile-top-banner"
        aria-label="Mobile Top Advertisement Banner" 
        className={`lg:hidden w-full mx-auto my-2 px-1 select-none ${className}`}
      >
        <div className="flex items-center justify-between text-[9px] uppercase font-mono tracking-widest text-slate-500 px-1 pb-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>SPONSORED AD</span>
          </span>
          <span className="text-[8px] text-slate-500">MOBILE LEADERBOARD</span>
        </div>

        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-2xl p-2.5 px-3 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-2.5 max-w-[80%]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 text-base font-black shrink-0 shadow-sm">
              🏏
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  FEATURED
                </span>
                <span className="text-xs font-bold text-slate-100 truncate">
                  Cricket Legends 2026 Deck
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                1,000 Vintage & Modern Player Cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onActionClick && (
              <button
                onClick={() => {
                  sound.playClick();
                  onActionClick();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shadow-sm flex items-center gap-1 transition-all"
              >
                <Zap className="w-2.5 h-2.5" />
                <span>Play</span>
              </button>
            )}
            <button
              onClick={() => {
                sound.playClick();
                setClosed(true);
              }}
              className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Close Ad"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // =========================================================================
  // 8. MOBILE BOTTOM STICKY BANNER (320x50 / 300x50 Standard Mobile Leaderboard)
  // =========================================================================
  return (
    <aside 
      id="ad-slot-mobile-bottom-banner"
      aria-label="Mobile Advertisement Banner" 
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-amber-500/30 p-1.5 px-3 backdrop-blur-md shadow-2xl flex items-center justify-between select-none ${className}`}
    >
      <div className="flex items-center gap-2.5 max-w-[85%]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 text-base font-black shrink-0 shadow-sm">
          🎮
        </div>
        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-mono font-bold text-amber-400 uppercase bg-amber-400/10 px-1 rounded">
              AD
            </span>
            <span className="text-[11px] font-bold text-slate-100 truncate">
              Desi Party Arcade • 4 Multiplayer Games
            </span>
          </div>
          <p className="text-[9px] text-slate-400 truncate">
            Raja Rani • BOOST • Bulls & Cows • Cricket Battle
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            sound.playClick();
            setClosed(true);
          }}
          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Close Ad"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
