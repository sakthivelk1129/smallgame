import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Megaphone, 
  Sliders, 
  Sparkles, 
  Trophy, 
  Layers, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Lock, 
  Zap, 
  Users, 
  Flame, 
  Search,
  Volume2,
  Activity,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { 
  ADMIN_EMAIL, 
  isAdminUser, 
  getAdminSettings, 
  saveAdminSettings, 
  AdminCustomSettings,
  DEFAULT_ADMIN_SETTINGS,
  logoutAdmin,
  getAdminToken
} from '../utils/admin';
import { UserProfile } from '../types/game';
import { getCricketDatabase } from '../data/cricketDatabase';
import { sound } from '../utils/sound';

interface AdminControlModalProps {
  user: UserProfile | null;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

interface LiveServerStats {
  onlineUsers: number;
  activeRooms: number;
  courtPlayers: number;
  rooms: Array<{ id: string; players: number; mode: string; phase: string }>;
  uptimeSeconds: number;
  timestamp: number;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  onShowToast
}) => {
  const isAuthorized = user ? isAdminUser(user.email) : false;

  const [activeTab, setActiveTab] = useState<'users' | 'broadcast' | 'gameplay' | 'cricket' | 'profile' | 'diagnostics'>('users');
  const [settings, setSettings] = useState<AdminCustomSettings>(getAdminSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Live user statistics
  const [serverStats, setServerStats] = useState<LiveServerStats>({
    onlineUsers: 1,
    activeRooms: 0,
    courtPlayers: 0,
    rooms: [],
    uptimeSeconds: 0,
    timestamp: Date.now()
  });
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  // Cricket search
  const [cricketSearch, setCricketSearch] = useState('');
  const [filteredCount, setFilteredCount] = useState(1000);

  const fetchLiveStats = async () => {
    setIsRefreshingStats(true);
    try {
      const token = getAdminToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/stats', { headers });
      if (res.ok) {
        const data = await res.json();
        setServerStats({
          onlineUsers: data.onlineUsers || 1,
          activeRooms: data.activeRooms || 0,
          courtPlayers: data.courtPlayers || 0,
          rooms: data.rooms || [],
          uptimeSeconds: data.uptimeSeconds || 0,
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.warn('Stats fetch offline fallback', e);
    } finally {
      setIsRefreshingStats(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchLiveStats();
      const interval = setInterval(fetchLiveStats, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthorized]);

  useEffect(() => {
    const allPlayers = getCricketDatabase();
    if (cricketSearch.trim()) {
      const q = cricketSearch.toLowerCase();
      const count = allPlayers.filter(p => 
        p.playerName.toLowerCase().includes(q) || 
        p.country.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
      ).length;
      setFilteredCount(count);
    } else {
      setFilteredCount(allPlayers.length);
    }
  }, [cricketSearch]);

  const handleSave = () => {
    saveAdminSettings(settings);
    setSavedSuccess(true);
    sound.playSuccess();
    onShowToast('✅ Admin Custom Settings Applied Globally!');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_ADMIN_SETTINGS);
    saveAdminSettings(DEFAULT_ADMIN_SETTINGS);
    sound.playClick();
    onShowToast('🔄 Settings reset to factory defaults.');
  };

  // Quick Level Booster
  const handleBoostLevel = (targetLevel: number, xpAmount: number) => {
    if (!user) return;
    onUpdateUser({
      level: targetLevel,
      xp: xpAmount,
      gamesPlayed: Math.max(user.gamesPlayed, 50),
      gamesWon: Math.max(user.gamesWon, 42)
    });
    sound.playTrophy();
    onShowToast(`👑 Profile Boosted to Level ${targetLevel} Sovereign!`);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    sound.playPop();
    onUpdateUser({ email: undefined });
    onShowToast('Logged out of Master Admin.');
    onClose();
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn select-none">
        <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-rose-500/20">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center text-3xl">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-serif font-black text-rose-300">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Master Admin Control Center is strictly password-protected.
            </p>
            <p className="text-[11px] text-slate-400">
              Please click Master Admin Login and authenticate with your master password to access system analytics and controls.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Admin Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-100">
                  MASTER ADMIN CONTROL
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider border border-amber-500/40 flex items-center gap-1">
                  👑 SOVEREIGN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>Authenticated Admin: <strong className="text-amber-300">{user?.email}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : 'Save & Apply'}</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto">
          
          <button
            onClick={() => { sound.playClick(); setActiveTab('users'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'users'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Live Online Users ({serverStats.onlineUsers})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('broadcast'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'broadcast'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Live Broadcast</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('gameplay'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'gameplay'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rules & Balance</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('cricket'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'cricket'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cricket 1,000 Cards</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('profile'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Admin Boost</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('diagnostics'); }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'diagnostics'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Diagnostics</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 0: LIVE ONLINE USERS & REAL-TIME MONITOR */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              
              {/* Top Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/40 space-y-1">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Users Currently Online</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-3xl font-black text-emerald-300 font-mono">
                    {serverStats.onlineUsers}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Active socket connections in real time
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/40 space-y-1">
                  <div className="flex items-center justify-between text-amber-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Court Rooms</span>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black text-amber-300 font-mono">
                    {serverStats.activeRooms}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Live multiplayer rooms hosted
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-950 border border-cyan-500/40 space-y-1">
                  <div className="flex items-center justify-between text-cyan-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Players in Game</span>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-3xl font-black text-cyan-300 font-mono">
                    {serverStats.courtPlayers}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Currently playing match rounds
                  </div>
                </div>

              </div>

              {/* Active Rooms Monitor */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Live Room Telemetry
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time activity across multiplayer rooms. Auto-refreshes every 4 seconds.
                    </p>
                  </div>

                  <button
                    onClick={fetchLiveStats}
                    disabled={isRefreshingStats}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStats ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {serverStats.rooms.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-400">No public multiplayer rooms active right now.</p>
                    <p className="text-[11px] text-slate-500">Users are currently browsing the Arcade lobby or playing solo modules.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {serverStats.rooms.map((rm) => (
                      <div
                        key={rm.id}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30">
                            CODE: {rm.id}
                          </span>
                          <span className="text-slate-300 font-semibold">
                            Mode: <span className="uppercase text-amber-300 font-bold">{rm.mode}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-slate-400">
                            Phase: <strong className="text-cyan-300">{rm.phase}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                            👥 {rm.players} players
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Server Uptime & Health */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Arcade Server Process: Healthy & Responsive</span>
                </div>
                <div className="font-mono text-[11px]">
                  Server Uptime: {Math.floor(serverStats.uptimeSeconds / 60)}m {serverStats.uptimeSeconds % 60}s
                </div>
              </div>

            </div>
          )}

          {/* TAB 1: LIVE BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-400" />
                      Global Banner Broadcast
                    </h3>
                    <p className="text-xs text-slate-400">
                      Display a live announcement banner across all game screens for all players.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.broadcastActive}
                      onChange={(e) => setSettings({ ...settings, broadcastActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Announcement Message:
                  </label>
                  <textarea
                    rows={2}
                    value={settings.broadcastAnnouncement}
                    onChange={(e) => setSettings({ ...settings, broadcastAnnouncement: e.target.value })}
                    placeholder="Enter custom broadcast message..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Banner Theme:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'gold', label: '👑 Royal Gold', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                      { id: 'success', label: '🌿 Emerald Event', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                      { id: 'warning', label: '🔥 Ruby Special', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
                      { id: 'info', label: '⚡ Neon Blue', bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, broadcastType: theme.id as any })}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          settings.broadcastType === theme.id 
                            ? `${theme.bg} ring-2 ring-amber-400 scale-[1.02]` 
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Live Broadcast Preview:
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                    settings.broadcastType === 'gold' ? 'bg-amber-500/20 text-amber-200 border-amber-500/40' :
                    settings.broadcastType === 'success' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40' :
                    settings.broadcastType === 'warning' ? 'bg-rose-500/20 text-rose-200 border-rose-500/40' :
                    'bg-cyan-500/20 text-cyan-200 border-cyan-500/40'
                  }`}>
                    <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
                    <span>{settings.broadcastAnnouncement || 'Your announcement will appear here'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GAMEPLAY RULES & BALANCE */}
          {activeTab === 'gameplay' && (
            <div className="space-y-6">
              
              {/* Raja Rani Court Settings */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <span>👑</span>
                  <h3>Raja Rani Chor Police Settings</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium text-slate-300">
                      <span>Discussion / Turn Duration:</span>
                      <span className="font-bold text-amber-400">{settings.rajaRaniTurnDuration}s</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={120}
                      step={5}
                      value={settings.rajaRaniTurnDuration}
                      onChange={(e) => setSettings({ ...settings, rajaRaniTurnDuration: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-medium text-slate-300">
                      <span>Raja Base Victory Points:</span>
                      <span className="font-bold text-amber-400">{settings.customRajaBasePoints} pts</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={2500}
                      step={100}
                      value={settings.customRajaBasePoints}
                      onChange={(e) => setSettings({ ...settings, customRajaBasePoints: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Boost & Bulls & Cows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <span>🚀</span>
                    <h3>BOOST Word Game</h3>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium text-slate-300">
                      <span>Pick Turn Duration:</span>
                      <span className="font-bold text-rose-400">{settings.boostTurnDuration}s</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={30}
                      step={1}
                      value={settings.boostTurnDuration}
                      onChange={(e) => setSettings({ ...settings, boostTurnDuration: Number(e.target.value) })}
                      className="w-full accent-rose-500"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span>🐂</span>
                    <h3>Bulls & Cows Secret Duel</h3>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium text-slate-300">
                      <span>Max Guess Attempts:</span>
                      <span className="font-bold text-amber-400">{settings.bullsCowsAttempts} tries</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={12}
                      step={1}
                      value={settings.bullsCowsAttempts}
                      onChange={(e) => setSettings({ ...settings, bullsCowsAttempts: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bot Difficulty */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">AI Bot Intelligence Mode:</h4>
                  <span className="text-xs font-mono text-amber-400 font-bold">{settings.botDifficulty}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['EASY', 'NORMAL', 'HARD', 'CHAMPION'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSettings({ ...settings, botDifficulty: lvl })}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        settings.botDifficulty === lvl
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CRICKET 1,000 CARDS MASTER */}
          {activeTab === 'cricket' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> 1,000 Real Cricketer Deck Master
                  </h3>
                  <p className="text-xs text-slate-400">
                    Search and inspect the verified database of modern & all-time cricket legends.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.unlockedAllCricketCards}
                      onChange={(e) => setSettings({ ...settings, unlockedAllCricketCards: e.target.checked })}
                      className="accent-amber-500"
                    />
                    <span className="text-amber-300">Unlock All 1,000 Cards (Admin Mode)</span>
                  </label>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cricketSearch}
                  onChange={(e) => setCricketSearch(e.target.value)}
                  placeholder="Search player by name, country (e.g. India, Australia), role..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-amber-400">
                  {filteredCount} / 1000 players
                </span>
              </div>

              {/* Player Mini Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {getCricketDatabase()
                  .filter(p => !cricketSearch || 
                    p.playerName.toLowerCase().includes(cricketSearch.toLowerCase()) ||
                    p.country.toLowerCase().includes(cricketSearch.toLowerCase()) ||
                    p.role.toLowerCase().includes(cricketSearch.toLowerCase())
                  )
                  .slice(0, 30)
                  .map(player => (
                    <div
                      key={player.cardId}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                          #{player.rank}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{player.playerName}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {player.country} {player.flagEmoji}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {player.role} • Bat: <span className="text-amber-400 font-bold">{player.batting}</span> Bowl: <span className="text-emerald-400 font-bold">{player.bowling}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        player.rarity === 'LEGENDARY' ? 'bg-amber-500/20 text-amber-300' :
                        player.rarity === 'EPIC' ? 'bg-purple-500/20 text-purple-300' :
                        player.rarity === 'RARE' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {player.rarity}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & XP LEVEL BOOSTER */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Admin Account Booster
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instantly level up your profile, unlock badges, and test high-level sovereign ranks.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => handleBoostLevel(10, 2000)}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-center transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="text-lg">🕵️</div>
                    <div className="text-xs font-bold text-slate-200 mt-1">Level 10</div>
                    <div className="text-[10px] text-amber-400 font-mono">+2,000 XP</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBoostLevel(25, 5000)}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-center transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="text-lg">🛡️</div>
                    <div className="text-xs font-bold text-slate-200 mt-1">Level 25</div>
                    <div className="text-[10px] text-amber-400 font-mono">+5,000 XP</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBoostLevel(50, 10000)}
                    className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-center transition-all hover:scale-105 cursor-pointer"
                  >
                    <div className="text-lg">⚜️</div>
                    <div className="text-xs font-bold text-slate-200 mt-1">Level 50</div>
                    <div className="text-[10px] text-amber-400 font-mono">+10,000 XP</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBoostLevel(999, 99999)}
                    className="p-3 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-yellow-500/20 hover:from-amber-600/40 border border-amber-400 text-center transition-all hover:scale-105 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <div className="text-lg">👑</div>
                    <div className="text-xs font-black text-amber-300 mt-1">Level 999</div>
                    <div className="text-[10px] text-amber-300 font-mono">MAX SOVEREIGN</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIO & DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400" /> Sound Effects Verification
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => sound.playClick()}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-300 cursor-pointer"
                  >
                    🔊 Button Click
                  </button>
                  <button
                    type="button"
                    onClick={() => sound.playPop()}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-slate-300 cursor-pointer"
                  >
                    🎈 Bubble Pop
                  </button>
                  <button
                    type="button"
                    onClick={() => sound.playTrumpFanfare()}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-amber-300 cursor-pointer"
                  >
                    🎺 Royal Trumpet
                  </button>
                  <button
                    type="button"
                    onClick={() => sound.playVictoryFanfare()}
                    className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 font-semibold text-emerald-300 cursor-pointer"
                  >
                    🏆 Grand Victory
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Reset All Admin Configurations</h4>
                  <p className="text-[11px] text-slate-400">Restore standard factory values for all games.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Master Admin Engine Active • {serverStats.onlineUsers} online now</span>
          </div>
          <span>Desi Arcade OS v2.0</span>
        </div>

      </div>
    </div>
  );
};
