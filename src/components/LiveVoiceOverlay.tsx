import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  MessageSquareQuote,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { voiceManager } from '../utils/voiceManager';
import { LiveSpeechTranscript, VoiceUserState } from '../types/game';
import { sound } from '../utils/sound';

interface LiveVoiceOverlayProps {
  currentUserId: string;
  currentUserName: string;
  isPoliceTurn?: boolean;
  onVoiceClaimSubmitted?: (text: string) => void;
}

export const LiveVoiceOverlay: React.FC<LiveVoiceOverlayProps> = ({
  currentUserId,
  currentUserName,
  isPoliceTurn = false,
  onVoiceClaimSubmitted
}) => {
  const [isMicActive, setIsMicActive] = useState<boolean>(voiceManager.isMicrophoneActive);
  const [isMuted, setIsMuted] = useState<boolean>(voiceManager.isMuted);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(voiceManager.ttsEnabled);
  const [activeTranscript, setActiveTranscript] = useState<LiveSpeechTranscript | null>(null);
  const [transcriptHistory, setTranscriptHistory] = useState<LiveSpeechTranscript[]>([]);
  const [voiceUsers, setVoiceUsers] = useState<VoiceUserState[]>([]);
  const [localAudioLevel, setLocalAudioLevel] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState<boolean>(false);

  // Subscribe to voiceManager events
  useEffect(() => {
    const unsubTranscript = voiceManager.onTranscript((transcript) => {
      setActiveTranscript(transcript);
      if (transcript.isFinal && transcript.text.trim().length > 0) {
        setTranscriptHistory((prev) => [transcript, ...prev.slice(0, 5)]);
        if (transcript.playerId === currentUserId && onVoiceClaimSubmitted) {
          onVoiceClaimSubmitted(transcript.text);
        }
      }
    });

    const unsubSpeaking = voiceManager.onSpeaking((playerId, isSpeaking, audioLevel) => {
      if (playerId === currentUserId) {
        setLocalAudioLevel(isSpeaking ? audioLevel : 0);
      }
    });

    const unsubUsers = voiceManager.onVoiceUsers((users) => {
      setVoiceUsers(users);
    });

    return () => {
      unsubTranscript();
      unsubSpeaking();
      unsubUsers();
    };
  }, [currentUserId, onVoiceClaimSubmitted]);

  // Auto-hide floating transcript bubble after 5 seconds of inactivity
  useEffect(() => {
    if (activeTranscript && activeTranscript.isFinal) {
      const timer = setTimeout(() => {
        setActiveTranscript(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [activeTranscript]);

  const handleToggleMic = async () => {
    sound.playClick();
    if (!isMicActive) {
      const granted = await voiceManager.enableMicrophone();
      if (granted) {
        setIsMicActive(true);
        setIsMuted(false);
      }
    } else {
      const nowMuted = voiceManager.toggleMute();
      setIsMuted(nowMuted);
    }
  };

  const handleToggleTTS = () => {
    sound.playClick();
    const enabled = voiceManager.toggleTTS();
    setTtsEnabled(enabled);
  };

  // Push to talk handlers
  const handlePushToTalkStart = async () => {
    if (!isMicActive) {
      await voiceManager.enableMicrophone();
      setIsMicActive(true);
    }
    if (isMuted) {
      voiceManager.toggleMute();
      setIsMuted(false);
    }
    setIsPushToTalkActive(true);
    sound.playPop();
  };

  const handlePushToTalkEnd = () => {
    if (!isMuted) {
      voiceManager.toggleMute();
      setIsMuted(true);
    }
    setIsPushToTalkActive(false);
  };

  const activeSpeakers = voiceUsers.filter((u) => u.isSpeaking);

  return (
    <>
      {/* Live Active Speech Bubble Pop-up in Middle of Screen */}
      {activeTranscript && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-45 max-w-lg w-[92%] sm:w-auto animate-bounce-short pointer-events-none">
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/80 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-amber-500/20 backdrop-blur-xl flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl shrink-0 shadow-inner">
              {activeTranscript.avatar || '🗣️'}
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 truncate">
                  <span>{activeTranscript.playerName}</span>
                  {activeTranscript.isCourtHerald ? (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded uppercase">
                      ROYAL HERALD
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE SPEECH
                    </span>
                  )}
                </span>
                <span className="text-[9px] font-mono text-slate-400 shrink-0">
                  {activeTranscript.isFinal ? 'Done' : 'Speaking...'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 italic leading-relaxed break-words">
                "{activeTranscript.text}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Docked Voice Control Bar */}
      <div className="fixed bottom-24 right-3 sm:right-5 z-40 flex flex-col items-end gap-2 select-none">
        
        {/* Active Speaking Indicator Pills */}
        {activeSpeakers.length > 0 && (
          <div className="flex flex-col gap-1 items-end animate-fadeIn">
            {activeSpeakers.map((sp) => (
              <div
                key={sp.playerId}
                className="bg-slate-900/95 border border-emerald-500/60 text-emerald-300 px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-bold ring-2 ring-emerald-500/30"
              >
                <span>{sp.avatar}</span>
                <span className="truncate max-w-[120px]">{sp.playerName}</span>
                {/* 3-bar animated audio wave */}
                <div className="flex items-center gap-0.5 h-3.5">
                  <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="w-0.5 h-3.5 bg-emerald-300 rounded-full animate-bounce" />
                  <span className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact / Expanded Voice Toolbar */}
        <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl flex items-center gap-1.5 ring-1 ring-white/5">
          
          {/* Real-time Mic Toggle Button */}
          <button
            onClick={handleToggleMic}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all shadow-md cursor-pointer ${
              !isMicActive || isMuted
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 border border-emerald-400 ring-2 ring-emerald-400/50 scale-105'
            }`}
            title={!isMicActive ? 'Click to Enable Microphone Voice & Speech' : isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {!isMicActive || isMuted ? (
              <>
                <MicOff className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Mic Muted</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-slate-950 animate-pulse" />
                <span className="hidden sm:inline">Voice Live</span>
                {localAudioLevel > 14 && (
                  <div className="flex items-center gap-0.5 h-3 ml-0.5">
                    <span className="w-0.5 h-2 bg-slate-950 rounded-full animate-bounce" />
                    <span className="w-0.5 h-3 bg-slate-950 rounded-full animate-bounce delay-75" />
                  </div>
                )}
              </>
            )}
          </button>

          {/* Push to Talk Button */}
          <button
            onMouseDown={handlePushToTalkStart}
            onMouseUp={handlePushToTalkEnd}
            onTouchStart={handlePushToTalkStart}
            onTouchEnd={handlePushToTalkEnd}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 ${
              isPushToTalkActive
                ? 'bg-rose-500 border-rose-400 text-white ring-2 ring-rose-400 scale-105'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
            title="Hold to Speak (Push-to-Talk)"
          >
            <Radio className={`w-3.5 h-3.5 ${isPushToTalkActive ? 'animate-spin' : 'text-amber-400'}`} />
            <span className="hidden sm:inline">Hold PTT</span>
          </button>

          {/* Royal Herald Speech (TTS) Toggle */}
          <button
            onClick={handleToggleTTS}
            className={`p-2 rounded-xl transition-all border ${
              ttsEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={ttsEnabled ? 'Royal Herald Voice: ON (Click to Mute Voice Announcements)' : 'Royal Herald Voice: MUTED (Click to Enable)'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Expand Transcript Log Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200"
            title="Toggle Live Speech Transcript Log"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Transcript Log Popup */}
        {isExpanded && (
          <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-xl max-w-xs w-72 space-y-2 animate-fadeIn ring-1 ring-white/10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Speech Log
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {transcriptHistory.length} entries
              </span>
            </div>

            {transcriptHistory.length === 0 ? (
              <p className="text-[11px] text-slate-500 py-3 text-center italic">
                No speeches yet. Unmute your mic and speak to transcribe aloud!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {transcriptHistory.map((th) => (
                  <div key={th.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold">
                      <span>{th.avatar} {th.playerName}</span>
                      <span className="text-slate-500 font-mono">
                        {new Date(th.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-200 italic">"{th.text}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
