import React, { useState } from 'react';
import { Sparkles, Lock, CheckCircle2, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { BoostGameState, BoostPrivateState } from '../types/boost';
import { sound } from '../utils/sound';

interface BoostWordEntryViewProps {
  gameState: BoostGameState;
  privateData: BoostPrivateState;
  currentSocketId: string;
  onSubmitWord: (word: string) => void;
}

const INSPIRATION_WORDS = ['TIGER', 'MANGO', 'CHETTI', 'CRICKET', 'ROCKET', 'SAMBAR', 'DIAMOND'];

export const BoostWordEntryView: React.FC<BoostWordEntryViewProps> = ({
  gameState,
  privateData,
  currentSocketId,
  onSubmitWord
}) => {
  const [wordInput, setWordInput] = useState('');
  const hasSubmitted = !!privateData.mySubmittedWord;
  const me = gameState.players.find(p => p.id === currentSocketId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordInput.trim() || hasSubmitted) return;
    sound.playPop();
    onSubmitWord(wordInput.trim().toUpperCase());
  };

  const submittedCount = gameState.players.filter(p => p.hasSubmittedWord).length;
  const totalPlayers = gameState.players.length;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 select-none max-w-lg mx-auto w-full space-y-6 animate-fadeIn">
      
      {/* Header Announcement */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ROUND {gameState.currentRound} OF {gameState.totalRounds}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100">
          Enter ONE Secret Word
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The game will automatically generate <strong>3 virtual paper slips</strong> containing this word for the pool table.
        </p>
      </div>

      {/* Input Box / Submitted Card */}
      <div className="w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-md">
        
        {!hasSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Your Secret Word:</span>
                <span className="text-[10px] text-rose-400 font-mono">1 Word Only</span>
              </label>

              <input
                type="text"
                required
                autoFocus
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="e.g. TIGER"
                maxLength={14}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-2xl font-mono font-black text-amber-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-400 tracking-wider transition-all"
              />
            </div>

            {/* Inspiration pills */}
            <div className="space-y-1.5 text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                💡 Need ideas? Pick one:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRATION_WORDS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setWordInput(w);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 transition-colors"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!wordInput.trim() || wordInput.trim().length < 2}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 disabled:opacity-40 disabled:pointer-events-none text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>CONFIRM & LOCK WORD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/10 animate-bounce">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-black text-xl text-emerald-400">
                Word Submitted & Locked!
              </h3>
              <p className="text-xs text-slate-400">
                Your secret word: <strong className="text-amber-300 font-mono text-sm px-2 py-0.5 rounded bg-slate-950 border border-slate-800">{privateData.mySubmittedWord}</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Waiting for opponents ({submittedCount}/{totalPlayers} submitted)</span>
            </div>
          </div>
        )}

        {/* Players Submission Status List */}
        <div className="border-t border-slate-800/80 pt-4 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 text-left">
            Court Courtiers Status:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {gameState.players.map(p => (
              <div
                key={p.id}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="truncate max-w-[80px] font-semibold text-slate-300">
                  {p.avatar} {p.name}
                </span>
                {p.hasSubmittedWord ? (
                  <span className="text-emerald-400 text-[10px] font-bold">✓ Ready</span>
                ) : (
                  <span className="text-slate-500 text-[10px]">Thinking...</span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>100% Secret • Other players will never see your word until revealed</span>
      </div>

    </div>
  );
};
