// Real-time Voice & Speech Manager for Kingdom Court (Raja Rani) Online
// Provides Live Audio Streaming, WebRTC Peer Audio Mesh, Real-time Speech Recognition (STT),
// Voice Activity Detection (VAD) audio visualizer waveforms, and Royal Court Herald Text-to-Speech (TTS).

import { Socket } from 'socket.io-client';
import { LiveSpeechTranscript, VoiceUserState } from '../types/game';

type TranscriptCallback = (transcript: LiveSpeechTranscript) => void;
type SpeakingCallback = (playerId: string, isSpeaking: boolean, audioLevel: number) => void;
type VoiceUsersCallback = (users: VoiceUserState[]) => void;

class VoiceManager {
  private socket: Socket | null = null;
  private roomId: string = '';
  private currentUserId: string = '';
  private currentUserName: string = '';
  private currentUserAvatar: string = '';

  // Web Speech API - SpeechRecognition (Speech-to-Text)
  private recognition: any = null;
  public isSpeechRecognitionSupported: boolean = false;
  private isListeningForSpeech: boolean = false;

  // Web Audio API & MediaStream (Microphone Voice Audio & Visualizer)
  private localAudioStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  public isMicrophoneActive: boolean = false;
  public isMuted: boolean = true;
  public isPushToTalk: boolean = false;
  public ttsEnabled: boolean = true;

  // WebRTC Peer Connections for live peer audio
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteAudioElements: Map<string, HTMLAudioElement> = new Map();

  // Callbacks
  private onTranscriptCallbacks: Set<TranscriptCallback> = new Set();
  private onSpeakingCallbacks: Set<SpeakingCallback> = new Set();
  private onVoiceUsersCallbacks: Set<VoiceUsersCallback> = new Set();

  // Local Voice Users State in Room
  private roomVoiceUsers: Map<string, VoiceUserState> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.isSpeechRecognitionSupported = true;
        this.initSpeechRecognition(SpeechRecognitionClass);
      }
    }
  }

  // Initialize Web Speech Recognition
  private initSpeechRecognition(SpeechRecognitionClass: any) {
    try {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN'; // Optimized for Indian English & bilingual accents

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        const activeText = (finalTranscript || interimTranscript).trim();
        if (activeText) {
          const payload: LiveSpeechTranscript = {
            id: `stt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            playerId: this.currentUserId,
            playerName: this.currentUserName,
            avatar: this.currentUserAvatar,
            text: activeText,
            isFinal: Boolean(finalTranscript),
            timestamp: Date.now()
          };

          // Notify local subscribers
          this.emitTranscript(payload);

          // Broadcast to online room via socket
          if (this.socket && this.roomId) {
            this.socket.emit('voice:transcript', {
              roomId: this.roomId,
              transcript: payload
            });
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        // Silently restart if needed or ignore non-critical errors
        if (event.error === 'no-speech' && this.isListeningForSpeech) {
          // Keep listening
        }
      };

      this.recognition.onend = () => {
        if (this.isListeningForSpeech) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started or busy
          }
        }
      };
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
    }
  }

  // Bind to socket instance and set room context
  public initRoom(
    socket: Socket,
    roomId: string,
    user: { id: string; name: string; avatar: string }
  ) {
    this.socket = socket;
    this.roomId = roomId;
    this.currentUserId = user.id;
    this.currentUserName = user.name;
    this.currentUserAvatar = user.avatar;

    // Register socket listeners for real-time speech & voice
    this.socket.off('voice:userList');
    this.socket.off('voice:userJoined');
    this.socket.off('voice:userLeft');
    this.socket.off('voice:userMuted');
    this.socket.off('voice:userSpeaking');
    this.socket.off('voice:transcript');
    this.socket.off('voice:courtHerald');
    this.socket.off('voice:signal');

    this.socket.on('voice:userList', (users: VoiceUserState[]) => {
      this.roomVoiceUsers.clear();
      users.forEach(u => this.roomVoiceUsers.set(u.playerId, u));
      this.notifyVoiceUsers();
    });

    this.socket.on('voice:userJoined', (user: VoiceUserState) => {
      this.roomVoiceUsers.set(user.playerId, user);
      this.notifyVoiceUsers();

      // If we have an active audio stream and this is a remote user, initiate WebRTC offer
      if (this.localAudioStream && user.playerId !== this.currentUserId) {
        this.createPeerConnection(user.playerId, true);
      }
    });

    this.socket.on('voice:userLeft', ({ playerId }: { playerId: string }) => {
      this.roomVoiceUsers.delete(playerId);
      this.closePeerConnection(playerId);
      this.notifyVoiceUsers();
    });

    this.socket.on('voice:userMuted', ({ playerId, isMuted }: { playerId: string; isMuted: boolean }) => {
      const u = this.roomVoiceUsers.get(playerId);
      if (u) {
        u.isMuted = isMuted;
        if (isMuted) u.isSpeaking = false;
        this.notifyVoiceUsers();
      }
    });

    this.socket.on('voice:userSpeaking', ({ playerId, isSpeaking, audioLevel }: { playerId: string; isSpeaking: boolean; audioLevel: number }) => {
      const u = this.roomVoiceUsers.get(playerId);
      if (u) {
        u.isSpeaking = isSpeaking;
        u.audioLevel = audioLevel;
        this.notifyVoiceUsers();
      }
      this.emitSpeaking(playerId, isSpeaking, audioLevel);
    });

    this.socket.on('voice:transcript', (transcript: LiveSpeechTranscript) => {
      this.emitTranscript(transcript);
    });

    this.socket.on('voice:courtHerald', ({ text }: { text: string }) => {
      this.speakCourtHerald(text);
      this.emitTranscript({
        id: `herald-${Date.now()}`,
        playerId: 'system',
        playerName: 'Royal Herald 📜',
        avatar: '👑',
        text,
        isFinal: true,
        timestamp: Date.now(),
        isCourtHerald: true
      });
    });

    // WebRTC Signaling
    this.socket.on('voice:signal', async ({ fromSocketId, fromPlayerId, signal }: { fromSocketId: string; fromPlayerId: string; signal: any }) => {
      try {
        let pc = this.peerConnections.get(fromPlayerId);
        if (!pc) {
          pc = this.createPeerConnection(fromPlayerId, false);
        }

        if (signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          if (signal.sdp.type === 'offer') {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.socket?.emit('voice:signal', {
              targetSocketId: fromSocketId,
              targetPlayerId: fromPlayerId,
              signal: { sdp: pc.localDescription }
            });
          }
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn('WebRTC signal error:', err);
      }
    });

    // Join room voice list on server
    this.socket.emit('voice:joinRoom', {
      roomId: this.roomId,
      playerId: this.currentUserId,
      playerName: this.currentUserName,
      avatar: this.currentUserAvatar,
      isMuted: this.isMuted
    });
  }

  // Request Microphone and Start Audio Engine
  public async enableMicrophone(): Promise<boolean> {
    try {
      if (!this.localAudioStream) {
        this.localAudioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: false
        });

        // Init AudioContext Analyser for speaking waveforms
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
        const source = this.audioCtx.createMediaStreamSource(this.localAudioStream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.5;
        source.connect(this.analyser);

        this.startVoiceActivityDetection();
      }

      this.isMicrophoneActive = true;
      this.isMuted = false;
      this.updateTrackState(true);

      // Start speech recognition if supported
      this.startSpeechRecognition();

      // Inform server
      if (this.socket && this.roomId) {
        this.socket.emit('voice:muteState', {
          roomId: this.roomId,
          playerId: this.currentUserId,
          isMuted: false
        });
      }

      // Reconnect peers with newly added audio tracks
      this.roomVoiceUsers.forEach((_, peerId) => {
        if (peerId !== this.currentUserId) {
          this.createPeerConnection(peerId, true);
        }
      });

      return true;
    } catch (err) {
      console.warn('Microphone permission / access denied:', err);
      return false;
    }
  }

  // Toggle Mute / Unmute
  public toggleMute(): boolean {
    if (!this.localAudioStream) {
      this.enableMicrophone();
      return false;
    }

    this.isMuted = !this.isMuted;
    this.updateTrackState(!this.isMuted);

    if (this.isMuted) {
      this.stopSpeechRecognition();
    } else {
      this.startSpeechRecognition();
    }

    if (this.socket && this.roomId) {
      this.socket.emit('voice:muteState', {
        roomId: this.roomId,
        playerId: this.currentUserId,
        isMuted: this.isMuted
      });
    }

    return this.isMuted;
  }

  // Enable/Disable tracks
  private updateTrackState(enabled: boolean) {
    if (this.localAudioStream) {
      this.localAudioStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  // Start Speech Recognition
  private startSpeechRecognition() {
    if (this.recognition && !this.isListeningForSpeech) {
      try {
        this.isListeningForSpeech = true;
        this.recognition.start();
      } catch (e) {
        // already started
      }
    }
  }

  // Stop Speech Recognition
  private stopSpeechRecognition() {
    if (this.recognition && this.isListeningForSpeech) {
      try {
        this.isListeningForSpeech = false;
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  // Voice Activity Detection (VAD) Loop
  private startVoiceActivityDetection() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    let lastSpeakingState = false;
    let throttleCounter = 0;

    const checkAudioLevel = () => {
      if (this.analyser && this.localAudioStream && !this.isMuted) {
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));

        // Threshold for speaking
        const isSpeaking = normalizedLevel > 14;

        if (isSpeaking !== lastSpeakingState || (isSpeaking && throttleCounter++ % 6 === 0)) {
          lastSpeakingState = isSpeaking;
          this.emitSpeaking(this.currentUserId, isSpeaking, normalizedLevel);

          if (this.socket && this.roomId) {
            this.socket.emit('voice:speaking', {
              roomId: this.roomId,
              playerId: this.currentUserId,
              isSpeaking,
              audioLevel: normalizedLevel
            });
          }
        }
      } else if (lastSpeakingState) {
        lastSpeakingState = false;
        this.emitSpeaking(this.currentUserId, false, 0);
        if (this.socket && this.roomId) {
          this.socket.emit('voice:speaking', {
            roomId: this.roomId,
            playerId: this.currentUserId,
            isSpeaking: false,
            audioLevel: 0
          });
        }
      }

      this.animFrameId = requestAnimationFrame(checkAudioLevel);
    };

    this.animFrameId = requestAnimationFrame(checkAudioLevel);
  }

  // WebRTC Peer Connection Helper
  private createPeerConnection(remotePlayerId: string, isInitiator: boolean): RTCPeerConnection {
    const existing = this.peerConnections.get(remotePlayerId);
    if (existing) {
      existing.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    // Add local tracks if available
    if (this.localAudioStream) {
      this.localAudioStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, this.localAudioStream!);
      });
    }

    // ICE Candidate
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('voice:signal', {
          targetPlayerId: remotePlayerId,
          signal: { candidate: event.candidate }
        });
      }
    };

    // Remote Track received
    pc.ontrack = (event) => {
      let audio = this.remoteAudioElements.get(remotePlayerId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        this.remoteAudioElements.set(remotePlayerId, audio);
      }
      audio.srcObject = event.streams[0];
      audio.play().catch(e => console.warn('Remote audio play failed:', e));
    };

    this.peerConnections.set(remotePlayerId, pc);

    // If initiator, create offer
    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true })
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          this.socket?.emit('voice:signal', {
            targetPlayerId: remotePlayerId,
            signal: { sdp: pc.localDescription }
          });
        })
        .catch(err => console.warn('WebRTC offer error:', err));
    }

    return pc;
  }

  private closePeerConnection(playerId: string) {
    const pc = this.peerConnections.get(playerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(playerId);
    }
    const audio = this.remoteAudioElements.get(playerId);
    if (audio) {
      audio.srcObject = null;
      audio.remove();
      this.remoteAudioElements.delete(playerId);
    }
  }

  // Text-To-Speech: Royal Court Herald Speech Synthesis
  public speakCourtHerald(text: string) {
    if (!this.ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      // Cancel previous speech to keep announcements immediate
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Regal pitch
      utterance.volume = 0.9;

      // Pick an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.name.includes('UK') || v.name.includes('India'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
    }
  }

  // Player speaks an alibi or custom claim aloud with TTS
  public speakPlayerClaim(playerName: string, text: string) {
    if (!this.ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      const utterance = new SpeechSynthesisUtterance(`${playerName} says: ${text}`);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.85;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS Claim error:', err);
    }
  }

  // Toggle TTS Announcer
  public toggleTTS(): boolean {
    this.ttsEnabled = !this.ttsEnabled;
    if (!this.ttsEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return this.ttsEnabled;
  }

  // Event Subscription Helpers
  public onTranscript(cb: TranscriptCallback) {
    this.onTranscriptCallbacks.add(cb);
    return () => this.onTranscriptCallbacks.delete(cb);
  }

  public onSpeaking(cb: SpeakingCallback) {
    this.onSpeakingCallbacks.add(cb);
    return () => this.onSpeakingCallbacks.delete(cb);
  }

  public onVoiceUsers(cb: VoiceUsersCallback) {
    this.onVoiceUsersCallbacks.add(cb);
    return () => this.onVoiceUsersCallbacks.delete(cb);
  }

  private emitTranscript(t: LiveSpeechTranscript) {
    this.onTranscriptCallbacks.forEach(cb => cb(t));
  }

  private emitSpeaking(playerId: string, isSpeaking: boolean, audioLevel: number) {
    this.onSpeakingCallbacks.forEach(cb => cb(playerId, isSpeaking, audioLevel));
  }

  private notifyVoiceUsers() {
    const list = Array.from(this.roomVoiceUsers.values());
    this.onVoiceUsersCallbacks.forEach(cb => cb(list));
  }

  // Cleanup on leaving room
  public cleanup() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.stopSpeechRecognition();

    if (this.localAudioStream) {
      this.localAudioStream.getTracks().forEach(t => t.stop());
      this.localAudioStream = null;
    }

    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }

    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    this.remoteAudioElements.forEach(a => {
      a.srcObject = null;
      a.remove();
    });
    this.remoteAudioElements.clear();

    this.roomVoiceUsers.clear();
    this.onTranscriptCallbacks.clear();
    this.onSpeakingCallbacks.clear();
    this.onVoiceUsersCallbacks.clear();

    if (this.socket && this.roomId) {
      this.socket.emit('voice:leaveRoom', {
        roomId: this.roomId,
        playerId: this.currentUserId
      });
    }
  }
}

export const voiceManager = new VoiceManager();
