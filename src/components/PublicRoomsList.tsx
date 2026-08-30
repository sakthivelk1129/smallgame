import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Users, Globe, RefreshCw, ArrowRight, Zap, Crown, Flame, Shield } from 'lucide-react';
import { sound } from '../utils/sound';

export interface PublicRoomItem {
  roomId?: string;
  roomCode?: string;
  hostName: string;
  hostAvatar: string;
  playerCount: number;
  maxPlayers: number;
  mode?: string;
  gameMode?: string;
  maxRounds?: number;
  totalRounds?: number;
  cardsPerPlayer?: number;
}

interface PublicRoomsListProps {
  socket: Socket | null;
  gameType: 'raja_rani' | 'boost' | 'cricket';
  onJoinRoom: (code: string) => void;
  onQuickMatch: () => void;
  accentColor?: 'amber' | 'rose' | 'yellow' | 'blue';
}

export const PublicRoomsList: React.FC<PublicRoomsListProps> = ({
  socket,
  gameType,
  onJoinRoom,
  onQuickMatch,
  accentColor = 'amber'
}) => {
  const [rooms, setRooms] = useState<PublicRoomItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchRooms = () => {
    if (!socket) return;
    setLoading(true);

    if (gameType === 'raja_rani') {
      socket.emit('room:listPublic');
    } else if (gameType === 'boost') {
      socket.emit('boost:listPublicRooms');
    } else if (gameType === 'cricket') {
      socket.emit('cricket:listPublicRooms');
    }

    setTimeout(() => setLoading(false), 500);
  };

  useEffect(() => {
    if (!socket) return;

    const handleRajaList = (list: PublicRoomItem[]) => {
      if (gameType === 'raja_rani') {
        setRooms(list || []);
        setLastRefreshed(new Date());
        setLoading(false);
      }
    };

    const handleBoostList = (list: PublicRoomItem[]) => {
      if (gameType === 'boost') {
        setRooms(list || []);
        setLastRefreshed(new Date());
        setLoading(false);
      }
    };

    const handleCricketList = (list: PublicRoomItem[]) => {
      if (gameType === 'cricket') {
        setRooms(list || []);
        setLastRefreshed(new Date());
        setLoading(false);
      }
    };

    const handleUpdated = () => {
      fetchRooms();
    };

    socket.on('room:publicList', handleRajaList);
    socket.on('boost:publicRoomsList', handleBoostList);
    socket.on('cricket:publicRoomsList', handleCricketList);

    socket.on('room:publicListUpdated', handleUpdated);
    socket.on('boost:publicRoomsListUpdated', handleUpdated);
    socket.on('cricket:publicRoomsListUpdated', handleUpdated);

    // Initial fetch
    fetchRooms();

    const interval = setInterval(fetchRooms, 4000);

    return () => {
      clearInterval(interval);
      socket.off('room:publicList', handleRajaList);
      socket.off('boost:publicRoomsList', handleBoostList);
      socket.off('cricket:publicRoomsList', handleCricketList);
      socket.off('room:publicListUpdated', handleUpdated);
      socket.off('boost:publicRoomsListUpdated', handleUpdated);
      socket.off('cricket:publicRoomsListUpdated', handleUpdated);
    };
  }, [socket, gameType]);

  const colorStyles = {
    amber: {
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      btn: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
      quickBtn: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950',
      highlight: 'text-amber-400'
    },
    rose: {
      border: 'border-rose-500/30',
      badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      btn: 'bg-rose-500 hover:bg-rose-400 text-white',
      quickBtn: 'bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 text-white',
      highlight: 'text-rose-400'
    },
    yellow: {
      border: 'border-yellow-500/30',
      badge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
      btn: 'bg-yellow-500 hover:bg-yellow-400 text-slate-950',
      quickBtn: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 text-slate-950',
      highlight: 'text-yellow-400'
    },
    blue: {
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white',
      quickBtn: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
      highlight: 'text-blue-400'
    }
  }[accentColor];

  return (
    <div className="space-y-4">
      {/* Quick Match Action Header */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span>Instant Auto-Matchmaking</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              No friend with you? Auto-joins an open room or waits for online players to join yours.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onQuickMatch();
          }}
          className={`w-full sm:w-auto px-5 py-2.5 ${colorStyles.quickBtn} font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap`}
        >
          <Zap className="w-4 h-4" />
          <span>FIND PLAYERS / QUICK MATCH</span>
        </button>
      </div>

      {/* Public Rooms Header with Refresh */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Globe className={`w-4 h-4 ${colorStyles.highlight}`} />
          <span className="text-xs font-bold text-slate-200">
            Available Public Lobbies ({rooms.length})
          </span>
        </div>

        <button
          onClick={() => {
            sound.playPop();
            fetchRooms();
          }}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Public Rooms List */}
      {rooms.length === 0 ? (
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-800/60 mx-auto flex items-center justify-center text-slate-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-300">No active public rooms waiting right now</div>
            <div className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Be the first to create one! Click "Host Public Room" or "Quick Match" and other players looking for friends will join you automatically.
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {rooms.map((room) => {
            const code = room.roomId || room.roomCode || '';
            return (
              <div
                key={code}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 transition-all hover:bg-slate-900/60"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{room.hostAvatar || '👑'}</div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-200">{room.hostName}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        #{code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>
                        {room.mode || room.gameMode || 'Standard'} • {room.maxRounds || room.totalRounds || 5} Rounds
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-300">
                      {room.playerCount}/{room.maxPlayers}
                    </div>
                    <div className="text-[10px] text-slate-500">Waiting</div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      onJoinRoom(code);
                    }}
                    className={`px-3 py-1.5 ${colorStyles.btn} font-bold text-xs rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1`}
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
