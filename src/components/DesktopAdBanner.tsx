import React from 'react';
import { Sparkles, Trophy, Flame, Play, ShieldCheck, Zap } from 'lucide-react';

interface DesktopAdBannerProps {
  position: 'top' | 'sidebar';
  onPlayBoost?: () => void;
  onPlayRajaRani?: () => void;
}

export const DesktopAdBanner: React.FC<DesktopAdBannerProps> = ({
  position,
  onPlayBoost,
  onPlayRajaRani
}) => {
  if (position === 'top') {
    return (
      <aside aria-label="Arcade Sponsor Banner" className="hidden lg:flex items-center justify-between bg-gradient-to-r from-indigo-950 via-slate-900 to-amber-950/80 border border-slate-800 rounded-2xl p-3 px-5 shadow-lg my-3 w-full max-w-6xl mx-auto select-none">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-950 text-xl font-black shadow-md">
            🎮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                ARCADE SPONSOR
              </span>
              <span className="text-xs font-black text-slate-100">
                Traditional Desi Multiplayer Party Games Online
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero downloads • Instant room codes • Play Raja Rani & Tamil Nadu's paper game BOOST with friends!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onPlayBoost && (
            <button
              onClick={onPlayBoost}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-black text-xs shadow-md shadow-rose-500/20 flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Try BOOST Live</span>
            </button>
          )}
          {onPlayRajaRani && (
            <button
              onClick={onPlayRajaRani}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center gap-1.5 transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Play Raja Rani</span>
            </button>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Arcade Sidebar Banner" className="hidden xl:flex flex-col justify-between w-64 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl select-none sticky top-20 h-fit space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-[10px] font-mono font-black tracking-wider text-slate-400 uppercase">
            ARCADE SPOTLIGHT
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
            🔥 TRENDING
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 text-center space-y-2">
          <div className="text-3xl">🚀</div>
          <div className="font-serif font-black text-sm text-amber-300">
            BOOST: Paper Slip Party
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            3 hidden slips per player. Pick papers on your turn and hit <strong>BOOST!</strong> when you hold 3 matching words!
          </p>
          {onPlayBoost && (
            <button
              onClick={onPlayBoost}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Play BOOST Now</span>
            </button>
          )}
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-1.5">
          <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anti-Cheat Real-Time Engine</span>
          </div>
          <p className="text-[10px] text-slate-400">
            100% server-authoritative turns, secret paper pools, and synchronized timers across all devices.
          </p>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/80 pt-2">
        Ad space expands to full screen during live matches
      </div>
    </aside>
  );
};
