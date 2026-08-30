import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  X, 
  Sparkles 
} from 'lucide-react';
import { CricketChatMessage } from '../../types/cricket';
import { sound } from '../../utils/sound';

interface CricketChatDrawerProps {
  messages: CricketChatMessage[];
  onSendMessage: (text: string) => void;
  onSendEmote: (emote: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const QUICK_EMOTES = ['🏏', '🔥', '😂', '😱', '👀', '👏', '💀', '🏆', '⚡', '🎯'];
const QUICK_PHRASES = [
  'What a card!',
  'Unbelievable!',
  'Nice stat pick!',
  'Gimme those cards!',
  'Tie-breaker incoming!',
  'GG WP!'
];

export const CricketChatDrawer: React.FC<CricketChatDrawerProps> = ({
  messages,
  onSendMessage,
  onSendEmote,
  isOpen,
  onToggle
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sound.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          sound.playClick();
          onToggle();
        }}
        className="fixed bottom-4 right-4 z-40 p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2 font-black text-xs"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">Pavilion Chat</span>
      </button>

      {/* Drawer Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 max-h-[460px] bg-slate-950 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-fadeIn">
          
          {/* Header */}
          <div className="p-3 px-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <span>🏏 Pavilion Chat</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Emotes Bar */}
          <div className="p-2 px-3 bg-slate-900/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
            {QUICK_EMOTES.map((em) => (
              <button
                key={em}
                onClick={() => {
                  sound.playClick();
                  onSendEmote(em);
                }}
                className="p-1.5 rounded-xl hover:bg-amber-500/20 text-lg hover:scale-125 transition-transform cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-56 text-xs">
            {messages.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No chat messages yet. Send an emote or cheer!
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2 rounded-xl text-xs space-y-0.5 ${
                    m.isSystem
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold">{m.avatar} {m.playerName}</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {m.emote ? (
                    <div className="text-2xl pt-1 animate-bounce">{m.emote}</div>
                  ) : (
                    <p className="break-words">{m.text}</p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Quick Phrases */}
          <div className="p-2 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto bg-slate-900/30">
            {QUICK_PHRASES.map((phrase) => (
              <button
                key={phrase}
                onClick={() => {
                  sound.playClick();
                  onSendMessage(phrase);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] font-semibold text-slate-300 whitespace-nowrap cursor-pointer hover:text-amber-300"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send message..."
              maxLength={100}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
