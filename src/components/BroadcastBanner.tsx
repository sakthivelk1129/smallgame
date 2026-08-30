import React, { useState, useEffect } from 'react';
import { Megaphone, X, Sparkles, ShieldCheck } from 'lucide-react';
import { getAdminSettings, AdminCustomSettings, isAdminUser } from '../utils/admin';
import { UserProfile } from '../types/game';

interface BroadcastBannerProps {
  user: UserProfile | null;
  onOpenAdmin?: () => void;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({
  user,
  onOpenAdmin
}) => {
  const [settings, setSettings] = useState<AdminCustomSettings>(getAdminSettings());
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getAdminSettings());
      setIsDismissed(false);
    };

    window.addEventListener('admin_settings_updated', handleUpdate);
    return () => window.removeEventListener('admin_settings_updated', handleUpdate);
  }, []);

  if (!settings.broadcastActive || !settings.broadcastAnnouncement || isDismissed) {
    return null;
  }

  const isUserAdmin = user ? isAdminUser(user.email) : false;

  const getThemeStyles = () => {
    switch (settings.broadcastType) {
      case 'gold':
        return 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-500/40 text-amber-200';
      case 'success':
        return 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-emerald-500/40 text-emerald-200';
      case 'warning':
        return 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-rose-500/40 text-rose-200';
      case 'info':
      default:
        return 'bg-gradient-to-r from-cyan-950 via-cyan-900 to-cyan-950 border-cyan-500/40 text-cyan-200';
    }
  };

  return (
    <div className={`w-full py-1.5 px-3 border-b text-xs font-semibold flex items-center justify-between shadow-md transition-all select-none ${getThemeStyles()}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center flex-1 px-2">
        <Megaphone className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-400" />
        <span className="truncate max-w-[85vw] sm:max-w-none">
          {settings.broadcastAnnouncement}
        </span>
        {isUserAdmin && onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/30 hover:bg-amber-500/50 text-amber-300 text-[10px] font-black border border-amber-400/40 flex items-center gap-1 transition-all"
            title="Edit Broadcast as Admin"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Edit</span>
          </button>
        )}
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        className="p-1 rounded-md hover:bg-black/20 text-slate-400 hover:text-white transition-colors"
        title="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
