export const ADMIN_EMAIL = 'sakthivelk1129@gmail.com';

export interface AdminCustomSettings {
  broadcastAnnouncement: string;
  broadcastType: 'info' | 'gold' | 'warning' | 'success';
  broadcastActive: boolean;
  rajaRaniTurnDuration: number;
  boostTurnDuration: number;
  bullsCowsAttempts: number;
  pointsMultiplier: number;
  botDifficulty: 'EASY' | 'NORMAL' | 'HARD' | 'CHAMPION';
  instantRoleRevealCheat: boolean;
  unlockedAllCricketCards: boolean;
  customRajaBasePoints: number;
  customPoliceBonus: number;
}

export const DEFAULT_ADMIN_SETTINGS: AdminCustomSettings = {
  broadcastAnnouncement: '👑 Welcome to Desi Party Arcade! Real-time multiplayer rooms are active.',
  broadcastType: 'gold',
  broadcastActive: true,
  rajaRaniTurnDuration: 45,
  boostTurnDuration: 15,
  bullsCowsAttempts: 8,
  pointsMultiplier: 1,
  botDifficulty: 'NORMAL',
  instantRoleRevealCheat: false,
  unlockedAllCricketCards: false,
  customRajaBasePoints: 1000,
  customPoliceBonus: 500
};

const STORAGE_KEY = 'desi_arcade_admin_config_v1';
const ADMIN_AUTH_KEY = 'desi_arcade_admin_token_v1';
const GOOGLE_ACCOUNTS_KEY = 'desi_arcade_saved_google_accounts_v1';

export interface SavedGoogleAccount {
  email: string;
  name: string;
  avatar: string;
  pictureUrl?: string;
  lastUsed: number;
}

export function getSavedGoogleAccounts(): SavedGoogleAccount[] {
  try {
    const raw = localStorage.getItem(GOOGLE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any legacy dummy sample accounts
        const cleaned = parsed.filter(
          (a: SavedGoogleAccount) => 
            a.email && 
            a.email.toLowerCase() !== 'player.pro@gmail.com' && 
            a.email.toLowerCase() !== 'cricket.star@gmail.com'
        );
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Error loading saved google accounts', e);
  }
  return [];
}

export function saveGoogleAccount(account: Omit<SavedGoogleAccount, 'lastUsed'>): SavedGoogleAccount[] {
  try {
    const current = getSavedGoogleAccounts();
    const filtered = current.filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    const updated: SavedGoogleAccount[] = [
      { ...account, lastUsed: Date.now() },
      ...filtered
    ];
    localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving google account', e);
    return [];
  }
}

export function removeSavedGoogleAccount(email: string): SavedGoogleAccount[] {
  try {
    const current = getSavedGoogleAccounts();
    const updated = current.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function getAdminSettings(): AdminCustomSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading admin settings', e);
  }
  return DEFAULT_ADMIN_SETTINGS;
}

export function saveAdminSettings(settings: AdminCustomSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('admin_settings_updated', { detail: settings }));
  } catch (e) {
    console.error('Error saving admin settings', e);
  }
}

export interface AdminAuthResult {
  success: boolean;
  message?: string;
  name?: string;
  email?: string;
  token?: string;
}

/**
 * Authenticates admin credentials securely against the backend server endpoint /api/admin/login
 */
export async function loginAdmin(email?: string, password?: string): Promise<AdminAuthResult> {
  if (!email || !password) {
    return { success: false, message: 'Please provide both Admin Email and Master Password.' };
  }

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.trim(),
        password: password.trim()
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const authData = {
        email: data.email || email.trim().toLowerCase(),
        token: data.token,
        name: data.name || 'Sakthivel K',
        verifiedAt: Date.now()
      };
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(authData));
      window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { isAuthenticated: true, user: authData } }));
      return {
        success: true,
        email: data.email,
        name: data.name,
        token: data.token
      };
    } else {
      return {
        success: false,
        message: data.message || 'Authentication failed: Invalid credentials.'
      };
    }
  } catch (err: any) {
    console.error('Admin backend login error:', err);
    return {
      success: false,
      message: 'Network error connecting to backend authentication service.'
    };
  }
}

/**
 * Validates the cached admin token with the backend server
 */
export async function verifyAdminTokenOnBackend(): Promise<boolean> {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed.token) return false;

    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${parsed.token}`
      },
      body: JSON.stringify({ token: parsed.token })
    });

    const data = await res.json();
    if (res.ok && data.success && data.isAdmin) {
      return true;
    } else {
      logoutAdmin();
      return false;
    }
  } catch (e) {
    console.error('Error verifying admin token with backend:', e);
    return false;
  }
}

export function getAdminToken(): string | null {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.token || null;
  } catch {
    return null;
  }
}

export async function verifyAdminCredentials(email?: string, password?: string): Promise<boolean> {
  const result = await loginAdmin(email, password);
  return result.success;
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_AUTH_KEY);
  window.dispatchEvent(new CustomEvent('admin_auth_changed', { detail: { isAuthenticated: false } }));
}

export function isAdminAuthenticated(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  if (userEmail.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return false;
  
  try {
    const tokenRaw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!tokenRaw) return false;
    const token = JSON.parse(tokenRaw);
    return !!(token.email && token.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && token.token);
  } catch (e) {
    return false;
  }
}

export function isAdminUser(email?: string | null): boolean {
  return isAdminAuthenticated(email);
}
