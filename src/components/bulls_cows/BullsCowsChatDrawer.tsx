import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X, Flame, Sparkles } from 'lucide-react';
import { BullsCowsChatMessage } from '../../types/bullsCows';
import { sound } from '../../utils/sound';

interface BullsCowsChatDrawerProps {
  messages: BullsCowsChatMessage[];
  onSendMessage: (text: string) => void;
  onSendEmote: (emote: string) => void;
  currentUserId: string;
}

const QUICK_EMOTES = ['🔥', '😱', '😂', '👀', '🤯', '👏', 'GG', '🐂', '🐄', '🎯'];

export const BullsCowsChatDrawer: React.FC<BullsCowsChatDrawerProps> = ({
  messages,
  onSendMessage,
  onSendEmote,
  currentUserId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sound.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen)}
        }
        className="fixed bottom-4 right-4 z-40 p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 flex items-center gap-2 font-bold text-xs sm:text-sm active:scale-95 transition-all"
        title="Open Room Chat & Emotes"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline">Room Chat</span>
        {messages.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-slate-950 text-emerald-400 text-[10px] flex items-center justify-center font-black">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
      </button>

      {/* Chat Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-slideLeft">
          
          {/* Header */}
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100">Room Chat & Emotes</h3>
                <span className="text-[10px] text-emerald-400 font-mono">Live Player Feed</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Emote Tray */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_EMOTES.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSendEmote(emoji);
                }}
                className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm active:scale-90 transition-transform flex-shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-1">
                <span className="text-2xl">🐂</span>
                <p className="text-xs">No chat messages yet.<br/>Send a quick reaction or message!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.playerId === currentUserId;
                if (msg.isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono leading-tight text-center"
                    >
                      {msg.text}
                    </div>
                  );
                }

                if (msg.emote) {
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 font-medium">{msg.playerName}:</span>
                      <span className="text-2xl animate-bounce">{msg.emote}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-slate-400 px-1 mb-0.5 font-semibold flex items-center gap-1">
                      <span>{msg.avatar}</span>
                      <span>{msg.playerName}</span>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-2xl max-w-[85%] break-words ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send message..."
              maxLength={100}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
