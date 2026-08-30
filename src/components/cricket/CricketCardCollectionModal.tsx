import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  Crown, 
  Sparkles, 
  Layers, 
  ArrowUpDown,
  Download,
  Upload
} from 'lucide-react';
import { getCricketDatabase, importCustomCricketData } from '../../data/cricketDatabase';
import { CricketCard, CricketRole, CardRarity } from '../../types/cricket';
import { CricketPlayerCard } from './CricketPlayerCard';
import { sound } from '../../utils/sound';

interface CricketCardCollectionModalProps {
  onClose: () => void;
}

export const CricketCardCollectionModal: React.FC<CricketCardCollectionModalProps> = ({
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'batting' | 'power' | 'bowling' | 'pace'>('rank');
  const [selectedCard, setSelectedCard] = useState<CricketCard | null>(null);

  const database = useMemo(() => getCricketDatabase(), []);

  const countries = useMemo(() => {
    const set = new Set<string>();
    database.forEach(c => set.add(c.country));
    return Array.from(set).sort();
  }, [database]);

  const filteredCards = useMemo(() => {
    return database.filter(c => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesName = c.playerName.toLowerCase().includes(q);
        const matchesCountry = c.country.toLowerCase().includes(q);
        const matchesId = c.cardId.toLowerCase().includes(q);
        if (!matchesName && !matchesCountry && !matchesId) return false;
      }

      if (selectedCountry !== 'ALL' && c.country !== selectedCountry) return false;
      if (selectedRole !== 'ALL' && c.role !== selectedRole) return false;
      if (selectedRarity !== 'ALL' && c.rarity !== selectedRarity) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank; // lowest rank #1 first
      return (b[sortBy] as number) - (a[sortBy] as number);
    });
  }, [database, searchTerm, selectedCountry, selectedRole, selectedRarity, sortBy]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-6xl max-h-[90vh] bg-slate-950 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-300">
                1,000 CRICKET CARDS ENCYCLOPEDIA
              </h2>
              <p className="text-xs text-slate-400">
                Showing {filteredCards.length} of 1,000 unique international cricket player cards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/30 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search player, country, or card ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Country Filter */}
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">🌍 All Countries</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">🏏 All Roles</option>
            <option value="BATSMAN">Batsman</option>
            <option value="BOWLER">Bowler</option>
            <option value="ALL_ROUNDER">All-Rounder</option>
            <option value="WICKET_KEEPER">Wicket-Keeper</option>
          </select>

          {/* Rarity Filter */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">✨ All Rarities</option>
            <option value="LEGENDARY">Legendary (Top 50)</option>
            <option value="EPIC">Epic (51–200)</option>
            <option value="RARE">Rare (201–500)</option>
            <option value="COMMON">Common (501–1000)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="rank">👑 Rank (#1 Best)</option>
            <option value="batting">🏏 Highest Batting</option>
            <option value="power">🔥 Highest Power</option>
            <option value="bowling">🎯 Highest Bowling</option>
            <option value="pace">⚡ Highest Pace</option>
          </select>
        </div>

        {/* Cards Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCards.slice(0, 100).map((card) => (
            <div 
              key={card.cardId} 
              onClick={() => {
                sound.playCardClick();
                setSelectedCard(card);
              }}
              className="cursor-pointer flex justify-center hover:scale-[1.02] transition-transform"
            >
              <CricketPlayerCard
                card={card}
                isInteractive={false}
                size="sm"
              />
            </div>
          ))}

          {filteredCards.length > 100 && (
            <div className="col-span-full text-center py-4 text-xs text-slate-400">
              Showing first 100 results. Refine your search to find specific cards among the 1,000 database.
            </div>
          )}

          {filteredCards.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 space-y-2">
              <div className="text-3xl">🔍</div>
              <p className="text-sm">No cricket player cards match your filters.</p>
            </div>
          )}
        </div>

        {/* Card Detail Popup if clicked */}
        {selectedCard && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
            <div className="flex flex-col items-center gap-3">
              <CricketPlayerCard
                card={selectedCard}
                isInteractive={false}
                size="lg"
              />
              <button
                onClick={() => setSelectedCard(null)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
