import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Smile, Sparkles } from 'lucide-react';
import { StopwatchChatMessage } from '../../types/stopwatch';
import { sound } from '../../utils/sound';

interface StopwatchChatDrawerProps {
  messages: StopwatchChatMessage[];
  onSendMessage: (text: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  unreadCount: number;
}

const QUICK_EMOTES = ['⏱️', '🎯', '🔥', '👏', '😱', '⚡', '🤖', '👑'];

export const StopwatchChatDrawer: React.FC<StopwatchChatDrawerProps> = ({
  messages,
  onSendMessage,
  isOpen,
  onToggle,
  unreadCount
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sound.playPop();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSendEmote = (emote: string) => {
    sound.playPop();
    onSendMessage(emote);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          sound.playClick();
          onToggle();
        }}
        className="fixed bottom-4 right-4 z-40 p-3.5 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 rounded-2xl shadow-xl shadow-cyan-500/30 flex items-center justify-center transition-all cursor-pointer group"
      >
        <MessageSquare className="w-5 h-5 fill-current" />
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40 w-80 sm:w-96 bg-slate-900 border-2 border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[480px] animate-fadeIn">
          {/* Header */}
          <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <MessageSquare className="w-4 h-4" />
              <span>Court Chat & Reaction</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Emote Bar */}
          <div className="px-3 py-2 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto">
            {QUICK_EMOTES.map((em) => (
              <button
                key={em}
                onClick={() => handleSendEmote(em)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-base hover:scale-125 transition-all cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="p-3 flex-1 overflow-y-auto space-y-2 text-xs min-h-[200px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl ${
                  m.isSystem
                    ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-center font-bold text-[11px]'
                    : 'bg-slate-800/80 border border-slate-700 text-slate-200'
                }`}
              >
                {!m.isSystem && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 font-bold">
                    <span>{m.avatar}</span>
                    <span>{m.playerName}</span>
                  </div>
                )}
                <div className="break-words">{m.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send quick reaction..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
