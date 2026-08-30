import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Smile, ShieldAlert, Sparkles, ChevronDown, ChevronUp, Lock, Eye } from 'lucide-react';
import { ChatMessage, EmoteEvent, UserProfile, CommunicationMode } from '../types/game';
import { sound } from '../utils/sound';

interface ChatOverlayProps {
  messages: ChatMessage[];
  emotes: EmoteEvent[];
  onSendMessage: (text: string) => void;
  onSendEmote: (emote: string) => void;
  user: UserProfile;
  disabled?: boolean;
  communicationMode?: CommunicationMode;
}

const QUICK_CHATS = [
  '👀 Suspicious!',
  '😂 LOL',
  '🤔 Hmm...',
  '👑 Trust Raja!',
  '🥷 It\'s not me!',
  '🚨 I know the Thief!',
  '😱 WHAT?!',
  '🔥 Let\'s go!'
];

const EMOTE_OPTIONS = ['😂', '😱', '👀', '🤔', '🔥', '👑', '😈', '🥷', '❤️', '💀', '🤯', '🤫', '🕵️'];

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  messages,
  emotes,
  onSendMessage,
  onSendEmote,
  user,
  disabled,
  communicationMode = 'debate'
}) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFaceToFace = communicationMode === 'face_to_face';

  // Auto-scroll chat
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || disabled || isFaceToFace) return;

    sound.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickChat = (text: string) => {
    if (disabled || isFaceToFace) return;
    sound.playClick();
    onSendMessage(text);
  };

  const handleEmote = (emote: string) => {
    sound.playPop();
    onSendEmote(emote);
  };

  return (
    <>
      {/* Floating Emotes Layer */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {emotes.map((em) => (
          <div
            key={em.id}
            className="absolute animate-floatUp flex flex-col items-center pointer-events-none"
            style={{
              left: `${15 + (Math.sin(em.timestamp) * 35 + 35)}%`,
              bottom: '120px'
            }}
          >
            <div className="text-4xl sm:text-5xl filter drop-shadow-lg scale-110">
              {em.emote}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/30 shadow mt-1">
              {em.playerName}
            </span>
          </div>
        ))}
      </div>

      {/* Chat & Emote Controls Bar (Docked at bottom) */}
      <div className="w-full bg-slate-950/95 border-t border-amber-500/20 backdrop-blur-lg p-2 sm:p-3 relative z-35">
        <div className="max-w-4xl mx-auto space-y-2">
          
          {/* Quick Chat and Emotes Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {/* Emotes Trigger / Pills */}
            <div className="flex items-center gap-1.5 shrink-0 bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-amber-400/80 uppercase px-1">Reactions:</span>
              {EMOTE_OPTIONS.slice(0, 7).map((em) => (
                <button
                  key={em}
                  onClick={() => handleEmote(em)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                >
                  {em}
                </button>
              ))}
              <button
                onClick={() => setShowEmotePicker(!showEmotePicker)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs text-amber-400 font-bold"
                title="More Emotes"
              >
                +6
              </button>
            </div>

            {/* Quick Chat Pills (Only in Debate Mode) */}
            {!isFaceToFace && (
              <div className="flex items-center gap-1.5 shrink-0">
                {QUICK_CHATS.map((qc) => (
                  <button
                    key={qc}
                    onClick={() => handleQuickChat(qc)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors whitespace-nowrap shadow-sm"
                  >
                    {qc}
                  </button>
                ))}
              </div>
            )}

            {isFaceToFace && (
              <div className="flex items-center gap-1.5 text-xs text-purple-300 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-xl whitespace-nowrap">
                <Eye className="w-3.5 h-3.5" />
                <span>Face-to-Face Mode (Look at friends live!)</span>
              </div>
            )}
          </div>

          {/* Full Emote Picker Tray */}
          {showEmotePicker && (
            <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-amber-500/30 overflow-x-auto">
              {EMOTE_OPTIONS.map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    handleEmote(em);
                    setShowEmotePicker(false);
                  }}
                  className="w-9 h-9 rounded-lg hover:bg-slate-800 flex items-center justify-center text-2xl hover:scale-125 transition-transform shrink-0"
                >
                  {em}
                </button>
              ))}
            </div>
          )}

          {/* Expanded Chat Log Drawer */}
          {isExpanded && (
            <div className="h-48 sm:h-56 bg-slate-900/95 border border-slate-800 rounded-xl p-3 overflow-y-auto space-y-2 text-xs">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  {isFaceToFace ? 'In-Person Mode Active — Verbal chat is muted for eye-contact bluffing!' : 'No messages yet. Send a whisper or quick chat!'}
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      msg.isSystem
                        ? 'p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-center justify-center font-medium'
                        : msg.playerId === user.id
                        ? 'flex-row-reverse'
                        : ''
                    }`}
                  >
                    {!msg.isSystem && (
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs shrink-0">
                        {msg.avatar}
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-xl px-3 py-1.5 ${
                        msg.isSystem
                          ? ''
                          : msg.playerId === user.id
                          ? 'bg-amber-500 text-slate-950 font-medium'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {!msg.isSystem && msg.playerId !== user.id && (
                        <div className="text-[10px] font-bold text-amber-400 mb-0.5">
                          {msg.playerName}
                        </div>
                      )}
                      <div>{msg.text}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Chat Input Field / Face to Face Indicator */}
          {isFaceToFace ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">
                  👁️ Option 2 Active: No text clues allowed! Stare at suspects in person to spot the thief.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-[11px] font-bold border border-purple-500/30 transition-colors"
              >
                {isExpanded ? 'Hide History' : 'System Logs'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Court Chat</span>
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type clues or confuse the Police..."
                maxLength={140}
                disabled={disabled}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 font-medium"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || disabled}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
};
