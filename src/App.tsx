/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  GameState, 
  GameMode, 
  CommunicationMode,
  UserProfile, 
  RoleType, 
  RoleDefinition, 
  ChatMessage, 
  EmoteEvent, 
  AlibiClaim,
  RoomSettings 
} from './types/game';
import { ROLE_DEFINITIONS } from './data/roles';
import { sound } from './utils/sound';

import { Navbar } from './components/Navbar';
import { PortalGateway } from './components/PortalGateway';
import { DesktopAdBanner } from './components/DesktopAdBanner';
import { StopwatchApp } from './components/stopwatch/StopwatchApp';
import { BullsCowsApp } from './components/bulls_cows/BullsCowsApp';
import { CricketCardBattleApp } from './components/cricket/CricketCardBattleApp';
import { HomeHub } from './components/HomeHub';
import { LobbyView } from './components/LobbyView';
import { RoleRevealView } from './components/RoleRevealView';
import { RajaRevealView } from './components/RajaRevealView';
import { GameplayView } from './components/GameplayView';
import { RevealResultView } from './components/RevealResultView';
import { FinalResultsView } from './components/FinalResultsView';
import { ChatOverlay } from './components/ChatOverlay';
import { LiveVoiceOverlay } from './components/LiveVoiceOverlay';
import { ProfileModal } from './components/ProfileModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AdminControlModal } from './components/AdminControlModal';
import { AboutUsModal } from './components/legal/AboutUsModal';
import { PrivacyPolicyModal } from './components/legal/PrivacyPolicyModal';
import { TermsOfServiceModal } from './components/legal/TermsOfServiceModal';
import { ContactUsModal } from './components/legal/ContactUsModal';
import { CookieConsentBanner } from './components/legal/CookieConsentBanner';
import { isAdminUser, verifyAdminTokenOnBackend } from './utils/admin';
import { voiceManager } from './utils/voiceManager';

const DEFAULT_USER: UserProfile = {
  id: 'guest-' + Math.random().toString(36).substring(2, 8),
  name: 'Sakthi Raja',
  avatar: '👑',
  level: 1,
  xp: 40,
  gamesPlayed: 0,
  gamesWon: 0,
  isGuest: true
};

export default function App() {
  // Check URL for direct room invite (?room=A7K92P)
  const [initialRoomCode, setInitialRoomCode] = useState<string>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('room')?.toUpperCase() || '';
    } catch {
      return '';
    }
  });

  // User Profile
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('rajarani_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Active Game Mode / Screen
  const [activeGameScreen, setActiveGameScreen] = useState<'portal' | 'raja_rani' | 'stopwatch' | 'bulls_cows' | 'cricket'>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('cricketRoom')) return 'cricket';
      if (urlParams.get('bcRoom')) return 'bulls_cows';
      if (urlParams.get('stopwatchRoom')) return 'stopwatch';
      if (urlParams.get('room')) return 'raja_rani';
    } catch {}
    return 'portal';
  });
  const [activeRajaScreen, setActiveRajaScreen] = useState<'hub' | 'game'>('hub');
  
  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Modals & UI State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAboutUsModal, setShowAboutUsModal] = useState(false);
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Game & Socket State
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [mySecretRole, setMySecretRole] = useState<RoleType | undefined>(undefined);
  const [myRoleDefinition, setMyRoleDefinition] = useState<RoleDefinition | undefined>(undefined);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingEmotes, setFloatingEmotes] = useState<EmoteEvent[]>([]);
  const [alibiClaims, setAlibiClaims] = useState<AlibiClaim[]>([]);
  const [inspectedSuspectId, setInspectedSuspectId] = useState<string | null>(null);
  const [abilityResult, setAbilityResult] = useState<{ title: string; message: string } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const userRef = useRef<UserProfile | null>(user);
  const initialRoomCodeRef = useRef<string>(initialRoomCode);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    initialRoomCodeRef.current = initialRoomCode;
  }, [initialRoomCode]);

  // Validate admin token on startup if present
  useEffect(() => {
    verifyAdminTokenOnBackend().catch(() => {});
  }, []);

  // Save User to LocalStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('rajarani_user', JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
  }, [user]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Initialize Socket.io (Only once on mount)
  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to Game Server, socket id:', socketInstance.id);
      const code = initialRoomCodeRef.current;
      const currentUser = userRef.current;
      if (code && code.length >= 4 && currentUser) {
        socketInstance.emit('room:join', {
          roomId: code.trim().toUpperCase(),
          playerName: currentUser.name,
          avatar: currentUser.avatar
        });
      }
    });

    socketInstance.on('room:created', ({ roomId, gameState }: { roomId: string; gameState: GameState }) => {
      setGameState(gameState);
      setActiveRajaScreen('game');
      setChatMessages([]);
    });

    socketInstance.on('room:joined', ({ roomId, gameState }: { roomId: string; gameState: GameState }) => {
      setGameState(gameState);
      setActiveRajaScreen('game');
      setChatMessages([]);
    });

    socketInstance.on('game:stateUpdate', (updatedState: GameState) => {
      setGameState(updatedState);
    });

    socketInstance.on('game:secretRole', ({ role, definition }: { role: RoleType; definition: RoleDefinition }) => {
      setMySecretRole(role);
      setMyRoleDefinition(definition);
    });

    socketInstance.on('chat:message', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socketInstance.on('chat:emote', (emoteEvt: EmoteEvent) => {
      setFloatingEmotes(prev => [...prev, emoteEvt]);
      setTimeout(() => {
        setFloatingEmotes(prev => prev.filter(e => e.id !== emoteEvt.id));
      }, 3500);
    });

    socketInstance.on('court:alibiBroadcast', (alibiEvt: AlibiClaim) => {
      setAlibiClaims(prev => [...prev.slice(-8), alibiEvt]);
    });

    socketInstance.on('police:suspectInspected', ({ targetPlayerId }: { targetPlayerId: string }) => {
      setInspectedSuspectId(targetPlayerId);
      sound.playHeartbeat();
      setTimeout(() => {
        setInspectedSuspectId(null);
      }, 3000);
    });

    socketInstance.on('ability:result', (res: { success: boolean; title?: string; message: string }) => {
      if (res.title) {
        setAbilityResult({ title: res.title, message: res.message });
      } else {
        showToast(res.message);
      }
    });

    socketInstance.on('room:error', ({ message }: { message: string }) => {
      showToast(`⚠️ ${message}`);
      sound.playDefeat();
    });

    socketInstance.on('room:kicked', () => {
      showToast('🚪 You were removed from the room by the host.');
      setGameState(null);
      setActiveRajaScreen('hub');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Universal Join Room by Code from Portal or Invite Links
  const handleUniversalJoinRoom = (gameId: 'raja_rani' | 'stopwatch' | 'bulls_cows' | 'cricket', code: string) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return;

    let currentUser = userRef.current;
    if (!currentUser) {
      currentUser = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `Player ${Math.floor(100 + Math.random() * 900)}`,
        avatar: '👑',
        level: 1,
        xp: 40,
        gamesPlayed: 0,
        gamesWon: 0,
        isGuest: true
      };
      setUser(currentUser);
      userRef.current = currentUser;
    }

    setInitialRoomCode(cleanCode);
    setActiveGameScreen(gameId);

    const activeSocket = socketRef.current;
    if (activeSocket && activeSocket.connected) {
      if (gameId === 'raja_rani') {
        setActiveRajaScreen('game');
        activeSocket.emit('room:join', {
          roomId: cleanCode,
          playerName: currentUser.name,
          avatar: currentUser.avatar
        });
      } else if (gameId === 'stopwatch') {
        activeSocket.emit('stopwatch:joinRoom', {
          roomId: cleanCode,
          playerName: currentUser.name,
          avatar: currentUser.avatar
        });
      } else if (gameId === 'bulls_cows') {
        activeSocket.emit('bullsCows:joinRoom', {
          roomId: cleanCode,
          playerName: currentUser.name,
          avatar: currentUser.avatar
        });
      } else if (gameId === 'cricket') {
        activeSocket.emit('cricket:joinRoom', {
          roomId: cleanCode,
          playerName: currentUser.name,
          avatar: currentUser.avatar
        });
      }
    }
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth Handlers
  const handleLoginAsGuest = (name: string, avatar: string) => {
    const newUser: UserProfile = {
      id: 'guest-' + Math.random().toString(36).substring(2, 8),
      name: name.trim() || 'Player 1',
      avatar: avatar || '👑',
      level: 1,
      xp: 40,
      gamesPlayed: 0,
      gamesWon: 0,
      isGuest: true
    };
    setUser(newUser);
  };

  const handleLoginWithGoogle = (email: string, name: string, avatar: string) => {
    const newUser: UserProfile = {
      id: 'google-' + Math.random().toString(36).substring(2, 8),
      name: name.trim() || 'Google Player',
      avatar: avatar || '⚡',
      email: email,
      level: 1,
      xp: 80,
      gamesPlayed: 0,
      gamesWon: 0,
      isGuest: false
    };
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('rajarani_user');
    setUser(null);
    setActiveGameScreen('portal');
  };

  // User Profile Updater
  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const nextXp = updated.xp !== undefined ? updated.xp : prev.xp;
      const nextLevel = Math.max(1, Math.floor(nextXp / 200) + 1);
      return {
        ...prev,
        ...updated,
        level: nextLevel,
        isGuest: updated.isGuest !== undefined ? updated.isGuest : prev.isGuest
      };
    });
  };

  // Raja Rani Socket Action Handlers
  const handleCreateRoom = (roomSettings: Partial<RoomSettings>) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit('room:create', {
      playerName: user.name,
      avatar: user.avatar,
      settings: roomSettings
    });
  };

  const handleJoinRoom = (roomCode: string) => {
    if (!socketRef.current || !user) return;
    socketRef.current.emit('room:join', {
      roomId: roomCode,
      playerName: user.name,
      avatar: user.avatar
    });
  };

  const handleLeaveRoom = () => {
    voiceManager.cleanup();
    if (!socketRef.current) return;
    socketRef.current.emit('room:leave');
    setGameState(null);
    setActiveRajaScreen('hub');
  };

  // Real-time voice and live speech room lifecycle
  useEffect(() => {
    if (gameState && socketRef.current && user) {
      voiceManager.initRoom(socketRef.current, gameState.roomId, {
        id: socketRef.current.id || user.id,
        name: user.name,
        avatar: user.avatar
      });
    }
    return () => {
      if (!gameState) {
        voiceManager.cleanup();
      }
    };
  }, [gameState?.roomId, user?.id]);

  const handleToggleReady = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:toggleReady');
  };

  const handleUpdateSettings = (settings: Partial<RoomSettings>) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:updateSettings', settings);
  };

  const handleAddBot = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:addBot');
  };

  const handleRemoveBot = (botId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:removeBot', { botId });
  };

  const handleKickPlayer = (targetPlayerId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:kickPlayer', { targetPlayerId });
  };

  const handleStartGame = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('room:startGame');
    socketRef.current.emit('game:start');
  };

  const handleAcknowledgeRole = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('game:acknowledgeRole');
  };

  const handleAccuse = (accusedPlayerId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('police:accuse', { 
      accusedPlayerId,
      targetPlayerId: accusedPlayerId 
    });
  };

  const handleUseAbility = (params: { abilityType?: string; targetPlayerId?: string; secondTargetPlayerId?: string } | string) => {
    if (!socketRef.current) return;
    if (typeof params === 'string') {
      socketRef.current.emit('ability:use', { abilityType: params, targetPlayerId: params });
    } else {
      socketRef.current.emit('ability:use', params);
    }
  };

  const handleClaimAlibi = (claimText: string, claimedRole?: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('court:claimAlibi', { 
      claimText, 
      claimedRole,
      customText: claimText,
      claimType: claimedRole || 'innocent' 
    });
  };

  const handleInspectSuspect = (targetPlayerId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('police:inspectSuspect', { targetPlayerId });
  };

  const handleRestartGame = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('game:restart');
  };

  const handleSendMessage = (text: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('chat:send', { text });
  };

  const handleSendEmote = (emote: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('chat:sendEmote', { emote });
  };

  const currentSocketId = socketRef.current?.id || '';

  // 1. Gateway / Landing Screen
  if (activeGameScreen === 'portal' || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        <PortalGateway
          currentUser={user}
          onLoginAsGuest={handleLoginAsGuest}
          onLoginWithGoogle={handleLoginWithGoogle}
          onSelectGame={(gameId) => {
            if (!user) {
              const defaultGuest: UserProfile = {
                id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: `Player ${Math.floor(100 + Math.random() * 900)}`,
                avatar: '⏱️',
                level: 1,
                xp: 0,
                gamesPlayed: 0,
                gamesWon: 0,
                isGuest: true
              };
              setUser(defaultGuest);
            }
            if (gameId === 'raja_rani') {
              setActiveGameScreen('raja_rani');
              setActiveRajaScreen('hub');
            } else if (gameId === 'stopwatch') {
              setActiveGameScreen('stopwatch');
            } else if (gameId === 'bulls_cows') {
              setActiveGameScreen('bulls_cows');
            } else if (gameId === 'cricket') {
              setActiveGameScreen('cricket');
            }
          }}
          onJoinWithCode={handleUniversalJoinRoom}
          onLogout={handleLogout}
          onOpenAdmin={() => setShowAdminModal(true)}
          onOpenAboutUs={() => setShowAboutUsModal(true)}
          onOpenPrivacyPolicy={() => setShowPrivacyPolicyModal(true)}
          onOpenTerms={() => setShowTermsModal(true)}
          onOpenContact={() => setShowContactModal(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {/* Legal and Compliance Modals */}
        {showAboutUsModal && (
          <AboutUsModal
            onClose={() => setShowAboutUsModal(false)}
            onOpenContact={() => {
              setShowAboutUsModal(false);
              setShowContactModal(true);
            }}
          />
        )}

        {showPrivacyPolicyModal && (
          <PrivacyPolicyModal
            onClose={() => setShowPrivacyPolicyModal(false)}
          />
        )}

        {showTermsModal && (
          <TermsOfServiceModal
            onClose={() => setShowTermsModal(false)}
          />
        )}

        {showContactModal && (
          <ContactUsModal
            onClose={() => setShowContactModal(false)}
          />
        )}

        {/* EU & Global Cookie Transparency Banner */}
        <CookieConsentBanner
          onOpenPrivacyPolicy={() => setShowPrivacyPolicyModal(true)}
        />
      </div>
    );
  }

  // 2. STOPWATCH PRECISION DUEL Game Screen
  if (activeGameScreen === 'stopwatch') {
    const swRoomCode = new URLSearchParams(window.location.search).get('stopwatchRoom') || initialRoomCode;
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between select-none">
        <StopwatchApp
          user={user}
          socket={socket || socketRef.current}
          onExitToPortal={() => setActiveGameScreen('portal')}
          initialRoomCode={swRoomCode}
        />
      </div>
    );
  }

  // 3. BULLS & COWS Game Screen
  if (activeGameScreen === 'bulls_cows') {
    const bcRoomCode = new URLSearchParams(window.location.search).get('bcRoom') || initialRoomCode;
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between select-none">
        <Navbar
          user={user}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenRules={() => setShowRulesModal(true)}
          onOpenAdmin={() => setShowAdminModal(true)}
          onExitToPortal={() => setActiveGameScreen('portal')}
          activeScreen="bulls_cows"
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        <main className="flex-1 flex flex-col">
          <BullsCowsApp
            user={user}
            socket={socket || socketRef.current}
            onExit={() => setActiveGameScreen('portal')}
            initialRoomCode={bcRoomCode}
          />
        </main>
      </div>
    );
  }

  // 4. CRICKET CARD BATTLE Game Screen
  if (activeGameScreen === 'cricket') {
    const cricketRoomCode = new URLSearchParams(window.location.search).get('cricketRoom') || initialRoomCode;
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between select-none">
        <CricketCardBattleApp
          user={user}
          socket={socket || socketRef.current}
          onExitToPortal={() => setActiveGameScreen('portal')}
          initialRoomCode={cricketRoomCode}
        />
      </div>
    );
  }

  // 5. Raja Rani Game Screen
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none relative font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-4 py-2 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm animate-bounce flex items-center gap-2 border border-amber-300">
          <span>👑</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onGoHome={() => {
          if (activeRajaScreen === 'game' && gameState) {
            handleLeaveRoom();
          }
          setActiveRajaScreen('hub');
        }}
        onExitToPortal={() => {
          if (activeRajaScreen === 'game' && gameState) {
            handleLeaveRoom();
          }
          setActiveGameScreen('portal');
        }}
        gameState={gameState}
        activeScreen="raja_rani"
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeRajaScreen === 'hub' || !gameState ? (
          <div className="flex-1 flex flex-col">
            <HomeHub
              user={user}
              socket={socketRef.current}
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onOpenRules={() => setShowRulesModal(true)}
              initialRoomCode={initialRoomCode}
            />
          </div>
        ) : (
          <>
            {/* LOBBY PHASE */}
            {gameState.phase === 'LOBBY' && (
              <LobbyView
                gameState={gameState}
                currentUserId={currentSocketId}
                onToggleReady={handleToggleReady}
                onUpdateSettings={handleUpdateSettings}
                onAddBot={handleAddBot}
                onRemoveBot={handleRemoveBot}
                onKickPlayer={handleKickPlayer}
                onStartGame={handleStartGame}
                onLeaveRoom={handleLeaveRoom}
              />
            )}

            {/* ROLE REVEAL PHASE (Secret Card Open) */}
            {gameState.phase === 'ROLE_REVEAL' && (
              <RoleRevealView
                round={gameState.currentRound}
                maxRounds={gameState.maxRounds}
                role={mySecretRole || 'FARMER'}
                definition={myRoleDefinition || ROLE_DEFINITIONS[mySecretRole || 'FARMER']}
                mode={gameState.mode}
                timer={gameState.timer}
                onAcknowledge={handleAcknowledgeRole}
              />
            )}

            {/* RAJA REVEAL PHASE */}
            {gameState.phase === 'RAJA_REVEAL' && (
              <RajaRevealView
                rajaPlayer={gameState.players.find(p => p.id === gameState.rajaPlayerId)}
                round={gameState.currentRound}
                maxRounds={gameState.maxRounds}
                timer={gameState.timer}
              />
            )}

            {/* INTERROGATION / BLUFFING GAMEPLAY PHASE */}
            {(gameState.phase === 'POLICE_TURN' || gameState.phase === 'POLICE_INTERROGATION' || gameState.phase === 'DISCUSSION') && (
              <GameplayView
                gameState={gameState}
                currentUserId={currentSocketId}
                myRole={mySecretRole}
                myRoleDefinition={myRoleDefinition || (mySecretRole ? ROLE_DEFINITIONS[mySecretRole] : undefined)}
                alibiClaims={alibiClaims}
                inspectedSuspectId={inspectedSuspectId}
                onAccuse={handleAccuse}
                onUseAbility={handleUseAbility}
                onClaimAlibi={handleClaimAlibi}
                onInspectSuspect={handleInspectSuspect}
                abilityResultModal={abilityResult}
                onCloseAbilityResult={() => setAbilityResult(null)}
              />
            )}

            {/* ACCUSATION REVEAL OR ROUND SCORING PHASE */}
            {(gameState.phase === 'ACCUSATION_REVEAL' || gameState.phase === 'ROUND_SCORING') && (
              <RevealResultView
                gameState={gameState}
                accusation={gameState.lastAccusation}
                timer={gameState.timer}
              />
            )}

            {/* FINAL RESULTS & PODIUM PHASE */}
            {gameState.phase === 'FINAL_RESULTS' && (
              <FinalResultsView
                gameState={gameState}
                currentUserId={currentSocketId}
                user={user}
                onRestartGame={handleRestartGame}
                onCreateNewRoom={() => {
                  handleLeaveRoom();
                  setActiveRajaScreen('hub');
                }}
                onReturnToHub={() => {
                  handleLeaveRoom();
                  setActiveRajaScreen('hub');
                }}
              />
            )}

            {/* Universal Chat & Floating Emotes Overlay in Game */}
            <ChatOverlay
              messages={chatMessages}
              emotes={floatingEmotes}
              onSendMessage={handleSendMessage}
              onSendEmote={handleSendEmote}
              user={user}
              disabled={gameState.phase === 'STARTING' || gameState.phase === 'ROLE_REVEAL'}
              communicationMode={gameState.settings.communicationMode}
            />

            {/* Real-time Voice & Live Speech-to-Text Overlay */}
            <LiveVoiceOverlay
              roomId={gameState.roomId}
              currentUserId={currentSocketId}
              currentUser={{
                id: currentSocketId,
                name: user?.name || 'Player',
                avatar: user?.avatar || '👑'
              }}
              disabled={gameState.phase === 'STARTING' || gameState.phase === 'ROLE_REVEAL'}
              onVoiceClaimSubmitted={(spokenText) => {
                handleClaimAlibi(spokenText, mySecretRole ? myRoleDefinition?.name : undefined);
              }}
            />
          </>
        )}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          onUpdateUser={handleUpdateUser}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <HowToPlayModal
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {/* Master Admin Modal */}
      {showAdminModal && user && (
        <AdminControlModal
          user={user}
          onUpdateUser={handleUpdateUser}
          onClose={() => setShowAdminModal(false)}
          onShowToast={showToast}
        />
      )}

      {/* Legal & Compliance Modals */}
      {showAboutUsModal && (
        <AboutUsModal
          onClose={() => setShowAboutUsModal(false)}
          onOpenContact={() => {
            setShowAboutUsModal(false);
            setShowContactModal(true);
          }}
        />
      )}

      {showPrivacyPolicyModal && (
        <PrivacyPolicyModal
          onClose={() => setShowPrivacyPolicyModal(false)}
        />
      )}

      {showTermsModal && (
        <TermsOfServiceModal
          onClose={() => setShowTermsModal(false)}
        />
      )}

      {showContactModal && (
        <ContactUsModal
          onClose={() => setShowContactModal(false)}
        />
      )}

    </div>
  );
}
