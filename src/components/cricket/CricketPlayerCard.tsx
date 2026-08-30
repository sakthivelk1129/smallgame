import React from 'react';
import { 
  CricketCard, 
  StatKey, 
  CricketRole, 
  CardRarity 
} from '../../types/cricket';
import { 
  Trophy, 
  Zap, 
  Shield, 
  Sparkles, 
  Flame, 
  Activity, 
  Target, 
  Swords, 
  Gauge, 
  Crosshair, 
  Award,
  Crown
} from 'lucide-react';
import { sound } from '../../utils/sound';

interface CricketPlayerCardProps {
  card: CricketCard;
  isInteractive?: boolean;
  selectedStat?: StatKey;
  onSelectStat?: (statKey: StatKey) => void;
  isWinnerCard?: boolean;
  isTiedCard?: boolean;
  highlightStat?: StatKey;
  size?: 'sm' | 'md' | 'lg';
  isFlipped?: boolean;
}

const STAT_CONFIGS: { 
  key: StatKey; 
  label: string; 
  category: 'BAT' | 'BOWL' | 'RANK'; 
  icon: any; 
  color: string;
}[] = [
  { key: 'rank', label: 'GLOBAL RANK', category: 'RANK', icon: Crown, color: 'text-amber-400' },
  
  // Batting Stats
  { key: 'batting', label: 'Batting', category: 'BAT', icon: Award, color: 'text-sky-400' },
  { key: 'strikeRate', label: 'Strike Rate', category: 'BAT', icon: Gauge, color: 'text-cyan-400' },
  { key: 'power', label: 'Power', category: 'BAT', icon: Flame, color: 'text-orange-400' },
  { key: 'consistency', label: 'Consistency', category: 'BAT', icon: Activity, color: 'text-emerald-400' },
  
  // Bowling Stats
  { key: 'bowling', label: 'Bowling', category: 'BOWL', icon: Target, color: 'text-rose-400' },
  { key: 'pace', label: 'Pace / Spin', category: 'BOWL', icon: Zap, color: 'text-yellow-400' },
  { key: 'accuracy', label: 'Accuracy', category: 'BOWL', icon: Crosshair, color: 'text-teal-400' },
  { key: 'wicketAbility', label: 'Wickets', category: 'BOWL', icon: Swords, color: 'text-purple-400' },
];

export const CricketPlayerCard: React.FC<CricketPlayerCardProps> = ({
  card,
  isInteractive = false,
  selectedStat,
  onSelectStat,
  isWinnerCard = false,
  isTiedCard = false,
  highlightStat,
  size = 'md',
  isFlipped = false
}) => {
  const getRarityBadge = (rarity: CardRarity) => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 text-slate-950 font-black border border-amber-300 shadow-lg shadow-amber-500/20';
      case 'EPIC':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black border border-purple-400 shadow-md shadow-purple-500/20';
      case 'RARE':
        return 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold border border-cyan-400';
      default:
        return 'bg-slate-800 text-slate-300 font-bold border border-slate-700';
    }
  };

  const getRoleBadge = (role: CricketRole) => {
    switch (role) {
      case 'BATSMAN':
        return { label: 'BATSMAN', icon: '🏏', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'BOWLER':
        return { label: 'BOWLER', icon: '🎯', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'ALL_ROUNDER':
        return { label: 'ALL-ROUNDER', icon: '⚡', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'WICKET_KEEPER':
        return { label: 'WK-BATSMAN', icon: '🧤', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
  };

  const roleInfo = getRoleBadge(card.role);

  if (isFlipped) {
    return (
      <div className={`rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-2 border-amber-500/30 p-5 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden select-none ${
        size === 'sm' ? 'w-48 h-64' : size === 'lg' ? 'w-80 h-[480px]' : 'w-72 h-[420px]'
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner mb-3 animate-pulse">
          🏏
        </div>
        <span className="font-serif font-black text-amber-300 text-lg tracking-widest uppercase">
          CRICKET CARD
        </span>
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-1">
          OFFICIAL 1000 POOL
        </span>
      </div>
    );
  }

  const cardWidth = size === 'sm' ? 'w-52 text-xs' : size === 'lg' ? 'w-80 text-sm' : 'w-72 text-xs';

  return (
    <div 
      className={`rounded-3xl bg-slate-950 border-2 transition-all select-none relative overflow-hidden flex flex-col justify-between shadow-2xl ${
        isWinnerCard 
          ? 'border-amber-400 shadow-amber-500/30 ring-4 ring-amber-400/40 scale-[1.03]' 
          : isTiedCard
          ? 'border-yellow-400 shadow-yellow-500/25 ring-2 ring-yellow-400/30'
          : card.rarity === 'LEGENDARY'
          ? 'border-amber-500/50 hover:border-amber-400'
          : card.rarity === 'EPIC'
          ? 'border-purple-500/50 hover:border-purple-400'
          : 'border-slate-800 hover:border-slate-700'
      } ${cardWidth}`}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Winner Banner */}
      {isWinnerCard && (
        <div className="absolute top-0 left-0 right-0 py-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] tracking-widest text-center shadow-md uppercase z-20 animate-bounce">
          🏆 ROUND WINNER 🏆
        </div>
      )}

      {/* Card Header Section */}
      <div className="relative p-3.5 pb-2 z-10 space-y-2 border-b border-slate-800/80">
        
        {/* Rarity & Card ID row */}
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider ${getRarityBadge(card.rarity)}`}>
            {card.rarity}
          </span>

          <span className="text-[10px] font-mono font-bold text-slate-400">
            {card.cardId}
          </span>
        </div>

        {/* Player Avatar & Main Info */}
        <div className="flex items-center gap-3 pt-1">
          {/* Avatar frame */}
          <div className="relative">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-900 border-2 border-slate-600 flex items-center justify-center text-xl shadow-inner relative overflow-hidden">
              <span className="text-2xl">{roleInfo.icon}</span>
              <span className="absolute bottom-0 right-0 text-[11px] leading-none bg-slate-950/80 rounded-tl px-1">
                {card.flagEmoji}
              </span>
            </div>
            {card.jerseyNumber && (
              <span className="absolute -bottom-1 -right-1 px-1 rounded bg-slate-900 border border-slate-700 text-[9px] font-mono font-bold text-amber-400">
                #{card.jerseyNumber}
              </span>
            )}
          </div>

          {/* Name & Country */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-100 truncate text-sm sm:text-base leading-tight">
              {card.playerName}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-400 truncate">
                {card.country}
              </span>
              <span className={`px-1.5 py-0.2 rounded border text-[9px] font-semibold ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Global Rank Selectable Button / Box */}
        <button
          type="button"
          disabled={!isInteractive}
          onClick={() => {
            if (isInteractive && onSelectStat) {
              sound.playClick();
              onSelectStat('rank');
            }
          }}
          className={`w-full py-1.5 px-3 rounded-xl border flex items-center justify-between transition-all ${
            selectedStat === 'rank' || highlightStat === 'rank'
              ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md shadow-amber-500/20 scale-[1.02]'
              : isInteractive
              ? 'bg-slate-900/90 hover:bg-amber-500/20 text-slate-200 border-amber-500/30 hover:border-amber-400 cursor-pointer'
              : 'bg-slate-900/60 text-slate-300 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>GLOBAL RANK</span>
            <span className="text-[9px] font-normal text-slate-400 lowercase">(#1 is best)</span>
          </div>

          <span className="font-mono font-black text-xs sm:text-sm text-amber-300">
            #{card.rank}
          </span>
        </button>
      </div>

      {/* Stats Body */}
      <div className="p-3.5 py-2 space-y-2.5 z-10 flex-1">
        
        {/* Batting Category */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-sky-400 uppercase tracking-wider px-1">
            <span>🏏 Batting Stats</span>
            <span className="text-[9px] text-slate-500">1–100 Max</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {STAT_CONFIGS.filter(s => s.category === 'BAT').map((stat) => {
              const val = card[stat.key as keyof CricketCard] as number;
              const isSelected = selectedStat === stat.key || highlightStat === stat.key;

              return (
                <button
                  key={stat.key}
                  type="button"
                  disabled={!isInteractive}
                  onClick={() => {
                    if (isInteractive && onSelectStat) {
                      sound.playClick();
                      onSelectStat(stat.key);
                    }
                  }}
                  className={`p-1.5 px-2 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 font-black border-sky-300 shadow-md shadow-sky-500/20 scale-[1.03]'
                      : isInteractive
                      ? 'bg-slate-900/80 hover:bg-sky-500/20 text-slate-200 border-slate-800 hover:border-sky-400 cursor-pointer'
                      : 'bg-slate-900/50 text-slate-300 border-slate-800/80'
                  }`}
                >
                  <span className="text-[10px] font-semibold truncate">
                    {stat.label}
                  </span>
                  <span className="font-mono font-bold text-xs ml-1">
                    {val}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bowling Category */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-rose-400 uppercase tracking-wider px-1">
            <span>🎯 Bowling Stats</span>
            <span className="text-[9px] text-slate-500">1–100 Max</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {STAT_CONFIGS.filter(s => s.category === 'BOWL').map((stat) => {
              const val = card[stat.key as keyof CricketCard] as number;
              const isSelected = selectedStat === stat.key || highlightStat === stat.key;

              return (
                <button
                  key={stat.key}
                  type="button"
                  disabled={!isInteractive}
                  onClick={() => {
                    if (isInteractive && onSelectStat) {
                      sound.playClick();
                      onSelectStat(stat.key);
                    }
                  }}
                  className={`p-1.5 px-2 rounded-xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-rose-500 text-slate-950 font-black border-rose-300 shadow-md shadow-rose-500/20 scale-[1.03]'
                      : isInteractive
                      ? 'bg-slate-900/80 hover:bg-rose-500/20 text-slate-200 border-slate-800 hover:border-rose-400 cursor-pointer'
                      : 'bg-slate-900/50 text-slate-300 border-slate-800/80'
                  }`}
                >
                  <span className="text-[10px] font-semibold truncate">
                    {stat.label}
                  </span>
                  <span className="font-mono font-bold text-xs ml-1">
                    {val}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Ability Banner (if any) */}
        {card.specialAbility && card.specialAbility !== 'NONE' && (
          <div className="px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-1.5 text-[10px] text-purple-300">
            <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="truncate">
              <strong>Ability:</strong> {card.specialAbility.replace('_', ' ')}
            </span>
          </div>
        )}

      </div>

      {/* Footer Interactive hint */}
      {isInteractive && (
        <div className="p-2 bg-amber-500/10 border-t border-amber-500/20 text-center text-[10px] font-bold text-amber-300 animate-pulse">
          👉 CLICK ANY STAT TO PLAY & LOCK
        </div>
      )}
    </div>
  );
};
