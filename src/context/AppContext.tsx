import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import confetti from 'canvas-confetti';
import type { Room, User, Problem, Submission, Notification, Difficulty, AuthCredential } from '../types';
import { INITIAL_CURRENT_USER, MOCK_ROOMS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { fetchLeetCodeDaily, fetchLeetCodeProfile } from '../services/leetcodeApi';

interface AppContextType {
  currentUser: User;
  isLoggedIn: boolean;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => void;
  syncUserProfileFromLeetCode: (username?: string) => Promise<boolean>;
  rooms: Room[];
  activeRoomId: string;
  activeRoom: Room | undefined;
  notifications: Notification[];
  unreadCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toast: { title: string; message: string; type?: string } | null;
  setToast: (toast: { title: string; message: string; type?: string } | null) => void;
  isCloudConnected: boolean;
  isAdmin: boolean;
  isHost: boolean;
  login: (usernameOrHandle: string, password?: string) => Promise<{ success: boolean; message: string }>;
  registerAccount: (name: string, username: string, password?: string) => Promise<{ success: boolean; message: string }>;
  
  // Actions
  switchActiveRoom: (roomId: string) => void;
  createRoom: (name: string, description: string, targetDailyGoal?: number) => Room;
  deleteRoom: (roomId: string) => { success: boolean; message: string };
  joinRoomByCode: (code: string) => { success: boolean; message: string };
  postDailyProblem: (problem: {
    title: string;
    url: string;
    difficulty: Difficulty;
    tags: string[];
    targetTimeMinutes?: number;
    date?: string;
  }) => void;
  deleteProblem: (problemId: string) => void;
  submitSolution: (
    problemId: string,
    data: {
      language: string;
      codeSnippet: string;
      timeSpentMinutes: number;
      runtimeMs?: string;
      memoryMb?: string;
      notes?: string;
      verifiedLeetCode?: boolean;
    }
  ) => void;
  addComment: (problemId: string, content: string, codeSnippet?: string) => void;
  deleteComment: (problemId: string, commentId: string) => void;
  removeMember: (roomId: string, memberId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  resetToDefault: () => void;
  signOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'leettracker_state_v2';
const LOCAL_STORAGE_KEY_AUTH = 'leettracker_auth_vault';
const BROADCAST_CHANNEL_NAME = 'leettracker_realtime_channel';

// Helper to safely parse LocalStorage JSON
function safeGetStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    console.warn(`Failed to parse LocalStorage key ${key}, using default fallback:`, e);
    return fallback;
  }
}

// Generate random salt for per-user cryptographic hashing
function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// WebCrypto SHA-256 password hashing with per-user salt
async function hashSecretWithSalt(password: string, salt: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${salt}:${password}:${salt}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }

  let hash = 0;
  const combo = `${salt}:${password}:${salt}`;
  for (let i = 0; i < combo.length; i++) {
    hash = ((hash << 5) - hash) + combo.charCodeAt(i);
    hash |= 0;
  }
  return `sha_fallback_${Math.abs(hash).toString(16)}`;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = safeGetStorage(`${LOCAL_STORAGE_KEY}_user`, INITIAL_CURRENT_USER);
    if (saved && (saved.name === 'LeetCode Engineer' || !saved.name)) {
      return { ...saved, name: 'You' };
    }
    return saved;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const loaded = safeGetStorage(`${LOCAL_STORAGE_KEY}_rooms`, MOCK_ROOMS);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : MOCK_ROOMS;
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() => {
    const loaded = safeGetStorage(`${LOCAL_STORAGE_KEY}_activeRoomId`, rooms[0]?.id || MOCK_ROOMS[0].id);
    return rooms.some((r) => r.id === loaded) ? loaded : (rooms[0]?.id || MOCK_ROOMS[0].id);
  });

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    safeGetStorage(`${LOCAL_STORAGE_KEY}_notifications`, INITIAL_NOTIFICATIONS)
  );

  const [authVault, setAuthVault] = useState<AuthCredential[]>(() =>
    safeGetStorage(LOCAL_STORAGE_KEY_AUTH, [])
  );

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toast, setToast] = useState<{ title: string; message: string; type?: string } | null>(null);

  const isLoggedIn = Boolean(
    currentUser.isLoggedIn && currentUser.username && currentUser.username.trim().length > 0
  );

  // Daily rollover evaluation for streak and solvedToday
  const checkDailyRollover = useCallback(() => {
    if (!currentUser || !currentUser.username) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastSolved = currentUser.lastSolvedDate;

    if (!lastSolved) {
      if (currentUser.solvedToday) {
        setCurrentUser((prev) => ({ ...prev, solvedToday: false, streak: 0 }));
      }
      return;
    }

    if (lastSolved === todayStr) {
      if (!currentUser.solvedToday) {
        setCurrentUser((prev) => ({ ...prev, solvedToday: true }));
      }
    } else {
      const todayDate = new Date(todayStr);
      const lastDate = new Date(lastSolved);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Solved yesterday, streak intact for today
        if (currentUser.solvedToday) {
          setCurrentUser((prev) => ({ ...prev, solvedToday: false }));
        }
      } else if (diffDays > 1) {
        // Streak broken
        if (currentUser.solvedToday || currentUser.streak > 0) {
          setCurrentUser((prev) => ({ ...prev, solvedToday: false, streak: 0 }));
        }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    checkDailyRollover();
    const onFocus = () => checkDailyRollover();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [checkDailyRollover]);

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(() => {});
    }

    const unlogged: User = {
      ...INITIAL_CURRENT_USER,
      isLoggedIn: false,
      username: '',
    };
    setCurrentUser(unlogged);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(unlogged));
    } catch (e) {}
    setToast({
      title: 'Signed Out',
      message: 'You have been signed out from the workspace.',
      type: 'info',
    });
  };

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const unreadCount = notifications.filter((n) => !n.read && n.roomId === activeRoomId).length;

  // Real room-scoped administrator / host detection
  const isHost = Boolean(
    activeRoom && (
      activeRoom.creatorId === currentUser.id ||
      activeRoom.members.find((m) => m.id === currentUser.id)?.role === 'Admin' ||
      currentUser.systemRole === 'SuperAdmin'
    )
  );
  const isAdmin = isHost;

  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_rooms`, JSON.stringify(rooms));
    } catch (e) {}
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_activeRoomId`, activeRoomId);
    } catch (e) {}
  }, [activeRoomId]);

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(authVault));
    } catch (e) {}
  }, [authVault]);

  // Synchronize profile updates strictly in rooms where currentUser is an existing member
  useEffect(() => {
    if (!currentUser.id || !isLoggedIn) return;

    setRooms((prevRooms) => {
      let changed = false;
      const updated = prevRooms.map((room) => {
        const cleanedMembers = (room.members || []).filter(
          (m) => m.id !== 'usr_alex' && m.id !== 'usr_sarah' && m.id !== 'usr_david'
        );

        const isMember = cleanedMembers.some((m) => m.id === currentUser.id);
        if (!isMember) {
          if (cleanedMembers.length !== (room.members || []).length) {
            changed = true;
            return { ...room, members: cleanedMembers };
          }
          return room;
        }

        const updatedMembers = cleanedMembers.map((m) => {
          if (m.id === currentUser.id) {
            const role = room.creatorId === currentUser.id ? 'Admin' : m.role;
            if (
              m.name !== currentUser.name ||
              m.avatar !== currentUser.avatar ||
              m.points !== currentUser.points ||
              m.streak !== currentUser.streak ||
              m.solvedToday !== currentUser.solvedToday ||
              m.roomSolvedCount !== currentUser.roomSolvedCount ||
              m.solvedCount !== currentUser.solvedCount ||
              m.role !== role
            ) {
              changed = true;
              return { ...m, ...currentUser, role };
            }
          }
          return m;
        });

        if (changed) {
          return { ...room, members: updatedMembers };
        }
        return room;
      });

      return changed ? updated : prevRooms;
    });
  }, [currentUser, isLoggedIn]);

  // Initial load: fetch official daily challenge if active room is empty
  useEffect(() => {
    const initDailyProblem = async () => {
      if (activeRoom && activeRoom.dailyProblems.length === 0) {
        try {
          const daily = await fetchLeetCodeDaily();
          if (daily && daily.title) {
            const todayStr = new Date().toISOString().split('T')[0];
            const autoProb: Problem = {
              id: `prob_daily_${Date.now()}`,
              title: daily.title,
              url: daily.url,
              difficulty: daily.difficulty,
              tags: daily.tags,
              date: daily.date || todayStr,
              postedBy: {
                id: 'system_leetcode',
                name: 'LeetCode Official Daily',
                avatar: 'https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png',
              },
              submissions: [],
              comments: [],
            };

            setRooms((prev) =>
              prev.map((r) =>
                r.id === activeRoom.id && r.dailyProblems.length === 0
                  ? {
                      ...r,
                      activeProblemId: autoProb.id,
                      dailyProblems: [autoProb],
                    }
                  : r
              )
            );
          }
        } catch (e) {
          console.warn('Could not auto-fetch official daily problem on init:', e);
        }
      }
    };

    initDailyProblem();
  }, [activeRoomId]);

  // Supabase Real-time Cloud Sync + Fallback to BroadcastChannel
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;

      // Load initial rooms from Supabase
      client.from('rooms').select('*').then(({ data: cloudRooms, error }) => {
        if (!error && cloudRooms && cloudRooms.length > 0) {
          const parsedRooms: Room[] = cloudRooms.map((row: any) => row.data || row);
          setRooms(parsedRooms);
        }
      });

      // Load initial notifications from Supabase
      client.from('notifications').select('*').limit(30).then(({ data: cloudNotifs, error }) => {
        if (!error && cloudNotifs && cloudNotifs.length > 0) {
          const parsedNotifs: Notification[] = cloudNotifs.map((row: any) => row.data || row);
          setNotifications(parsedNotifs);
        }
      });

      // Supabase Auth listener
      const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const email = session.user.email || '';
          const handle = session.user.user_metadata?.username || email.split('@')[0];
          const stats = await fetchLeetCodeProfile(handle);
          const cloudUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || stats?.realName || handle,
            username: handle,
            avatar: stats?.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
            role: 'Member',
            systemRole: 'User',
            points: 0,
            streak: 0,
            solvedCount: 0,
            roomSolvedCount: 0,
            leetcodeTotalSolved: stats?.totalSolved || 0,
            solvedToday: false,
            joinedAt: new Date().toISOString().split('T')[0],
            isLoggedIn: true,
          };
          setCurrentUser(cloudUser);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(INITIAL_CURRENT_USER);
        }
      });

      const roomChannel = client
        .channel('public:rooms')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
          if (payload.new && (payload.new as any).data) {
            const updatedRoom = (payload.new as any).data as Room;
            setRooms((prev) => {
              const exists = prev.some((r) => r.id === updatedRoom.id);
              return exists ? prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)) : [updatedRoom, ...prev];
            });
          }
        })
        .subscribe();

      const notifChannel = client
        .channel('public:notifications')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
          if (payload.new && (payload.new as any).data) {
            const updatedNotif = (payload.new as any).data as Notification;
            setNotifications((prev) => {
              const exists = prev.some((n) => n.id === updatedNotif.id);
              return exists ? prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n)) : [updatedNotif, ...prev];
            });
          }
        })
        .subscribe();

      return () => {
        authListener.subscription.unsubscribe();
        client.removeChannel(roomChannel);
        client.removeChannel(notifChannel);
      };
    } else {
      let bc: BroadcastChannel | null = null;
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          bc.onmessage = (event) => {
            const { type, payload } = event.data;
            if (type === 'STATE_SYNC') {
              if (payload.rooms && Array.isArray(payload.rooms)) setRooms(payload.rooms);
              if (payload.notifications && Array.isArray(payload.notifications)) setNotifications(payload.notifications);
              if (payload.toast) {
                setToast(payload.toast);
                playAudioNotification();
              }
            }
          };
        }
      } catch (e) {}
      return () => {
        if (bc) bc.close();
      };
    }
  }, []);

  const broadcastState = (newRooms: Room[], newNotifications: Notification[], toastPayload?: any) => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      try {
        newRooms.forEach(async (room) => {
          await client.from('rooms').upsert({
            id: room.id,
            name: room.name,
            code: room.code,
            description: room.description || '',
            creator_id: room.creatorId,
            target_daily_goal: room.targetDailyGoal || 1,
            data: room,
            updated_at: new Date().toISOString(),
          });
        });

        newNotifications.slice(0, 30).forEach(async (notif) => {
          await client.from('notifications').upsert({
            id: notif.id,
            room_id: notif.roomId,
            data: notif,
            created_at: new Date().toISOString(),
          });
        });
      } catch (e) {
        console.warn('Supabase cloud sync error:', e);
      }
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({
          type: 'STATE_SYNC',
          payload: {
            rooms: newRooms,
            notifications: newNotifications,
            toast: toastPayload,
          },
        });
        bc.close();
      }
    } catch (e) {}
  };

  const playAudioNotification = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  };

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      setRooms((prevRooms) =>
        prevRooms.map((room) => ({
          ...room,
          members: room.members.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
        }))
      );
      return updated;
    });
  };

  const syncUserProfileFromLeetCode = async (usernameToSync?: string): Promise<boolean> => {
    const handle = usernameToSync || currentUser.username;
    if (!handle.trim()) return false;

    const stats = await fetchLeetCodeProfile(handle.trim());
    if (stats) {
      updateCurrentUser({
        username: stats.username,
        name: stats.realName || currentUser.name || stats.username,
        avatar: stats.avatar || currentUser.avatar,
        leetcodeTotalSolved: stats.totalSolved,
      });
      return true;
    }
    return false;
  };

  const [registeredAccounts, setRegisteredAccounts] = useState<User[]>(() =>
    safeGetStorage(`${LOCAL_STORAGE_KEY}_registered_accounts`, [])
  );

  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_registered_accounts`, JSON.stringify(registeredAccounts));
    } catch (e) {}
  }, [registeredAccounts]);

  const login = async (usernameOrHandle: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const clean = usernameOrHandle.trim();
    if (!clean) return { success: false, message: 'Please enter your LeetCode username.' };
    const cleanPassword = password ? password.trim() : '';

    if (!cleanPassword) {
      return { success: false, message: 'Password is required to sign in.' };
    }

    const cleanLower = clean.toLowerCase();

    // If Supabase is configured, use Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${cleanLower}@leettracker.internal`,
        password: cleanPassword,
      });

      if (authError || !authData.user) {
        return { success: false, message: authError?.message || 'Invalid credentials in Supabase Auth.' };
      }
    }

    // Check local auth vault for registered credentials
    const credential = authVault.find((c) => c.username.toLowerCase() === cleanLower);

    if (!credential) {
      return {
        success: false,
        message: `Account "@${clean}" not found. Please click "New Account" to register with your LeetCode handle and password.`,
      };
    }

    // Verify SHA-256 password hash with per-user salt
    const inputHash = await hashSecretWithSalt(cleanPassword, credential.salt || 'leettracker_salt_2026');
    if (inputHash !== credential.passwordHash) {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }

    // Find user record in registered accounts
    const foundUser = registeredAccounts.find((u) => u.username.toLowerCase() === cleanLower);

    const loggedUser: User = foundUser
      ? { ...foundUser, isLoggedIn: true }
      : {
          id: credential.userId,
          name: credential.username,
          username: credential.username,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
          role: 'Member',
          systemRole: 'User',
          points: 0,
          streak: 0,
          solvedCount: 0,
          roomSolvedCount: 0,
          solvedToday: false,
          joinedAt: credential.createdAt.split('T')[0],
          isLoggedIn: true,
        };

    setCurrentUser(loggedUser);

    // Auto-update stats from LeetCode in background
    if (loggedUser.username) {
      fetchLeetCodeProfile(loggedUser.username).then((stats) => {
        if (stats) {
          updateCurrentUser({
            leetcodeTotalSolved: stats.totalSolved,
            avatar: stats.avatar || loggedUser.avatar,
            name: stats.realName || loggedUser.name,
          });
        }
      }).catch(() => {});
    }

    const userRoom = rooms.find((r) => r.members.some((m) => m.id === loggedUser.id) || r.creatorId === loggedUser.id);
    if (userRoom) {
      setActiveRoomId(userRoom.id);
    }

    setToast({
      title: `Signed In as ${loggedUser.name}`,
      message: `Welcome back @${loggedUser.username}!`,
      type: 'success',
    });

    return { success: true, message: `Welcome back, ${loggedUser.name}!` };
  };

  const registerAccount = async (name: string, username: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const cleanUsername = username.trim();
    const cleanName = name.trim();
    const cleanPassword = password ? password.trim() : '';

    if (!cleanUsername) return { success: false, message: 'LeetCode username is required.' };
    if (!cleanName) return { success: false, message: 'Display name is required.' };
    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    const cleanLower = cleanUsername.toLowerCase();
    if (authVault.some((c) => c.username.toLowerCase() === cleanLower)) {
      return { success: false, message: `Username "@${cleanUsername}" is already registered. Please sign in instead.` };
    }

    // STRICT LeetCode API Verification
    const lcStats = await fetchLeetCodeProfile(cleanUsername);
    if (!lcStats) {
      return {
        success: false,
        message: `LeetCode handle "@${cleanUsername}" does not exist on LeetCode. Please check spelling or verify your public profile on leetcode.com.`,
      };
    }

    // If Supabase is configured, sign up via Supabase Auth
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signUp({
        email: `${cleanLower}@leettracker.internal`,
        password: cleanPassword,
        options: {
          data: {
            name: cleanName,
            username: cleanUsername,
          },
        },
      });
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: cleanName || lcStats.realName || cleanUsername,
      username: lcStats.username,
      avatar: lcStats.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
      role: 'Member',
      systemRole: 'User',
      points: 0,
      streak: 0,
      solvedCount: 0,
      roomSolvedCount: 0,
      leetcodeTotalSolved: lcStats.totalSolved,
      solvedToday: false,
      joinedAt: new Date().toISOString().split('T')[0],
      isLoggedIn: true,
    };

    const userSalt = generateSalt();
    const passwordHash = await hashSecretWithSalt(cleanPassword, userSalt);
    const newCred: AuthCredential = {
      userId: newUser.id,
      username: newUser.username,
      passwordHash,
      salt: userSalt,
      createdAt: new Date().toISOString(),
    };

    setAuthVault((prev) => [...prev, newCred]);
    setRegisteredAccounts((prev) => [...prev.filter((u) => u.username.toLowerCase() !== cleanLower), newUser]);
    setCurrentUser(newUser);

    if (activeRoom) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoom.id
            ? {
                ...r,
                members: [...r.members.filter((m) => m.id !== newUser.id), { ...newUser, role: r.creatorId === newUser.id ? 'Admin' : 'Member' }],
              }
            : r
        )
      );
    }

    setToast({
      title: 'Account Registered! 🎉',
      message: `Welcome ${newUser.name}! Verified LeetCode @${lcStats.username} (${lcStats.totalSolved} solved).`,
      type: 'success',
    });

    return { success: true, message: 'Account registered successfully.' };
  };

  const switchActiveRoom = (roomId: string) => {
    if (rooms.some((r) => r.id === roomId)) {
      setActiveRoomId(roomId);
    }
  };

  const createRoom = (name: string, description: string, targetDailyGoal = 1): Room => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoom: Room = {
      id: `room_${Date.now()}`,
      name,
      code,
      description,
      creatorId: currentUser.id,
      createdAt: new Date().toISOString().split('T')[0],
      targetDailyGoal,
      members: [{ ...currentUser, role: 'Admin' }],
      dailyProblems: [],
    };

    const updatedRooms = [newRoom, ...rooms];
    setRooms(updatedRooms);
    setActiveRoomId(newRoom.id);

    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      roomId: newRoom.id,
      type: 'SYSTEM',
      title: 'Room Created! 🎉',
      message: `Welcome to "${name}". Share invite code ${code} with your teammates!`,
      timestamp: 'Just now',
      read: false,
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    broadcastState(updatedRooms, updatedNotifs);

    setToast({
      title: 'Room Created!',
      message: `Invite code: ${code}`,
      type: 'success',
    });

    return newRoom;
  };

  const deleteRoom = (roomId: string): { success: boolean; message: string } => {
    const roomToDelete = rooms.find((r) => r.id === roomId);
    if (!roomToDelete) {
      return { success: false, message: 'Room not found.' };
    }

    const isAuthorized = roomToDelete.creatorId === currentUser.id || currentUser.systemRole === 'SuperAdmin';
    if (!isAuthorized) {
      return { success: false, message: 'Permission denied. Only the room creator/host can delete this room.' };
    }

    let updatedRooms = rooms.filter((r) => r.id !== roomId);

    if (updatedRooms.length === 0) {
      const defaultRoom: Room = {
        ...MOCK_ROOMS[0],
        creatorId: currentUser.id,
        members: [{ ...currentUser, role: 'Admin' }],
      };
      updatedRooms = [defaultRoom];
      setActiveRoomId(defaultRoom.id);
      setRooms(updatedRooms);
      const toastMsg = {
        title: 'Room Reset',
        message: 'Default practice room restored so your workspace remains accessible.',
        type: 'info',
      };
      setToast(toastMsg);
      broadcastState(updatedRooms, notifications, toastMsg);
      return { success: true, message: `Deleted room ${roomToDelete.name} (Restored default room)` };
    }

    setRooms(updatedRooms);

    if (activeRoomId === roomId) {
      setActiveRoomId(updatedRooms[0].id);
    }

    const toastMsg = {
      title: 'Room Deleted',
      message: `"${roomToDelete.name}" has been permanently deleted.`,
      type: 'warning',
    };

    setToast(toastMsg);
    broadcastState(updatedRooms, notifications, toastMsg);

    return { success: true, message: `Deleted room ${roomToDelete.name}` };
  };

  const joinRoomByCode = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const targetRoom = rooms.find((r) => r.code.toUpperCase() === cleanCode);

    if (!targetRoom) {
      return { success: false, message: 'Invalid room code. Please check and try again.' };
    }

    const isMember = targetRoom.members.some((m) => m.id === currentUser.id);

    let updatedRooms = rooms;
    if (!isMember) {
      updatedRooms = rooms.map((r) => {
        if (r.id === targetRoom.id) {
          return {
            ...r,
            members: [...r.members, { ...currentUser, role: 'Member' as const }],
          };
        }
        return r;
      });
      setRooms(updatedRooms);
    }

    setActiveRoomId(targetRoom.id);

    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      roomId: targetRoom.id,
      type: 'SYSTEM',
      title: `${currentUser.name} joined the room! 👋`,
      message: `@${currentUser.username || currentUser.name} entered "${targetRoom.name}".`,
      timestamp: 'Just now',
      read: false,
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    broadcastState(updatedRooms, updatedNotifs);

    setToast({
      title: 'Room Joined! 🎉',
      message: `Welcome to ${targetRoom.name}!`,
      type: 'success',
    });

    return { success: true, message: `Joined ${targetRoom.name}` };
  };

  const postDailyProblem = (problemData: {
    title: string;
    url: string;
    difficulty: Difficulty;
    tags: string[];
    targetTimeMinutes?: number;
    date?: string;
  }) => {
    const newProblem: Problem = {
      id: `prob_${Date.now()}`,
      title: problemData.title,
      url: problemData.url,
      difficulty: problemData.difficulty,
      tags: problemData.tags,
      targetTimeMinutes: problemData.targetTimeMinutes,
      date: problemData.date || new Date().toISOString().split('T')[0],
      postedBy: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      submissions: [],
      comments: [],
    };

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoomId) {
        return {
          ...r,
          activeProblemId: newProblem.id,
          dailyProblems: [newProblem, ...r.dailyProblems.filter((p) => p.date !== newProblem.date)],
        };
      }
      return r;
    });

    setRooms(updatedRooms);

    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      roomId: activeRoomId,
      type: 'NEW_PROBLEM',
      title: `New Daily Challenge Posted: ${newProblem.title} 🚀`,
      message: `${currentUser.name} posted today's ${newProblem.difficulty} problem: "${newProblem.title}".`,
      timestamp: 'Just now',
      read: false,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    broadcastState(updatedRooms, updatedNotifs);

    setToast({
      title: 'Problem Added!',
      message: `"${newProblem.title}" scheduled for ${newProblem.date}.`,
      type: 'success',
    });
  };

  const deleteProblem = (problemId: string) => {
    const targetProblem = activeRoom?.dailyProblems.find((p) => p.id === problemId);
    const isAuthorized = isHost || targetProblem?.postedBy.id === currentUser.id;
    if (!isAuthorized) {
      setToast({ title: 'Permission Denied', message: 'Only the room host or problem author can delete this challenge.', type: 'warning' });
      return;
    }

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoomId) {
        const filtered = r.dailyProblems.filter((p) => p.id !== problemId);
        return {
          ...r,
          activeProblemId: r.activeProblemId === problemId ? filtered[0]?.id : r.activeProblemId,
          dailyProblems: filtered,
        };
      }
      return r;
    });

    setRooms(updatedRooms);
    setToast({ title: 'Problem Removed', message: 'Challenge removed from room history.', type: 'info' });
    broadcastState(updatedRooms, notifications);
  };

  const submitSolution = (
    problemId: string,
    data: {
      language: string;
      codeSnippet: string;
      timeSpentMinutes: number;
      runtimeMs?: string;
      memoryMb?: string;
      notes?: string;
      verifiedLeetCode?: boolean;
    }
  ) => {
    const targetProblem = activeRoom?.dailyProblems.find((p) => p.id === problemId);
    const existingSubmission = targetProblem?.submissions.find((s) => s.userId === currentUser.id);
    const isFirstSubmission = !existingSubmission;
    const todayStr = new Date().toISOString().split('T')[0];

    let earnedPoints = 50;
    if (targetProblem) {
      if (targetProblem.difficulty === 'Hard') earnedPoints = 100;
      else if (targetProblem.difficulty === 'Medium') earnedPoints = 60;
      else earnedPoints = 30;
    }

    const newSubmission: Submission = {
      id: existingSubmission ? existingSubmission.id : `sub_${Date.now()}`,
      problemId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      status: 'Accepted',
      language: data.language,
      codeSnippet: data.codeSnippet,
      timeSpentMinutes: data.timeSpentMinutes,
      runtimeMs: data.runtimeMs || undefined,
      memoryMb: data.memoryMb || undefined,
      notes: data.notes,
      submittedAt: existingSubmission ? existingSubmission.submittedAt : 'Just now',
      verifiedLeetCode: data.verifiedLeetCode === true,
    };

    // ANTI-FARMING: Only award points & increment room solved count on the FIRST submission!
    let updatedUser = currentUser;
    if (isFirstSubmission) {
      const newStreak = currentUser.solvedToday ? currentUser.streak : currentUser.streak + 1;
      const newPoints = currentUser.points + earnedPoints;
      const newRoomSolved = (currentUser.roomSolvedCount || 0) + 1;

      updatedUser = {
        ...currentUser,
        points: newPoints,
        streak: newStreak,
        roomSolvedCount: newRoomSolved,
        solvedCount: newRoomSolved,
        lastSolvedDate: todayStr,
        solvedToday: true,
      };
      setCurrentUser(updatedUser);
    }

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoomId) {
        return {
          ...r,
          members: r.members.map((m) => (m.id === currentUser.id ? updatedUser : m)),
          dailyProblems: r.dailyProblems.map((p) => {
            if (p.id === problemId) {
              return {
                ...p,
                submissions: [newSubmission, ...p.submissions.filter((s) => s.userId !== currentUser.id)],
              };
            }
            return p;
          }),
        };
      }
      return r;
    });

    setRooms(updatedRooms);

    if (isFirstSubmission) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#06B6D4', '#F59E0B', '#EC4899'],
        });
      } catch (e) {}

      const newNotif: Notification = {
        id: `notif_${Date.now()}`,
        roomId: activeRoomId,
        type: 'PROBLEM_SOLVED',
        title: `${currentUser.name} solved today's challenge! 🔥`,
        message: `Completed "${targetProblem?.title || 'Daily Problem'}" in ${data.timeSpentMinutes} mins (+${earnedPoints} pts).`,
        timestamp: 'Just now',
        read: false,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
      };

      const updatedNotifs = [newNotif, ...notifications];
      setNotifications(updatedNotifs);
      broadcastState(updatedRooms, updatedNotifs);

      setToast({
        title: 'Challenge Solved! 🎉',
        message: `+${earnedPoints} Points Earned! Streak updated.`,
        type: 'success',
      });
    } else {
      setToast({
        title: 'Solution Updated!',
        message: 'Your code snippet and runtime metrics have been saved.',
        type: 'info',
      });
    }
  };

  const addComment = (problemId: string, content: string, codeSnippet?: string) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      codeSnippet,
      createdAt: 'Just now',
    };

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoomId) {
        return {
          ...r,
          dailyProblems: r.dailyProblems.map((p) => {
            if (p.id === problemId) {
              return {
                ...p,
                comments: [newComment, ...p.comments],
              };
            }
            return p;
          }),
        };
      }
      return r;
    });

    setRooms(updatedRooms);

    const targetProblem = activeRoom?.dailyProblems.find((p) => p.id === problemId);
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      roomId: activeRoomId,
      type: 'COMMENT',
      title: `New Comment on ${targetProblem?.title || 'Problem'}`,
      message: `${currentUser.name}: "${content.length > 60 ? content.substring(0, 60) + '...' : content}"`,
      timestamp: 'Just now',
      read: false,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    broadcastState(updatedRooms, updatedNotifs);
  };

  const deleteComment = (problemId: string, commentId: string) => {
    if (!activeRoom) return;

    const targetComment = activeRoom.dailyProblems.flatMap((p) => p.comments).find((c) => c.id === commentId);
    if (!isHost && targetComment?.userId !== currentUser.id) return;

    const updatedRooms = rooms.map((r) => {
      if (r.id === activeRoomId) {
        return {
          ...r,
          dailyProblems: r.dailyProblems.map((p) => {
            if (p.id === problemId) {
              return {
                ...p,
                comments: p.comments.filter((c) => c.id !== commentId),
              };
            }
            return p;
          }),
        };
      }
      return r;
    });

    setRooms(updatedRooms);
    setToast({ title: 'Comment Removed', message: 'Comment deleted.', type: 'info' });
    broadcastState(updatedRooms, notifications);
  };

  const removeMember = (roomId: string, memberId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    const isRoomHost = targetRoom.creatorId === currentUser.id || currentUser.systemRole === 'SuperAdmin';
    if (!isRoomHost) {
      setToast({ title: 'Permission Denied', message: 'Only the room host can remove members.', type: 'warning' });
      return;
    }

    if (memberId === currentUser.id) {
      setToast({ title: 'Notice', message: 'You cannot remove yourself from your own room.', type: 'info' });
      return;
    }

    const updatedRooms = rooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          members: r.members.filter((m) => m.id !== memberId),
        };
      }
      return r;
    });

    setRooms(updatedRooms);
    setToast({ title: 'Member Removed', message: 'Member was removed from the room.', type: 'warning' });
    broadcastState(updatedRooms, notifications);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.roomId === activeRoomId ? { ...n, read: true } : n))
    );
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_user`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_rooms`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_activeRoomId`);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_notifications`);
      localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
      localStorage.removeItem(`${LOCAL_STORAGE_KEY}_registered_accounts`);
    } catch (e) {}

    setCurrentUser(INITIAL_CURRENT_USER);
    setRooms(MOCK_ROOMS);
    setActiveRoomId(MOCK_ROOMS[0].id);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuthVault([]);
    setRegisteredAccounts([]);
    setToast({
      title: 'Workspace Reset',
      message: 'Reset back to fresh workspace state.',
      type: 'info',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        logout,
        updateCurrentUser,
        syncUserProfileFromLeetCode,
        rooms,
        activeRoomId,
        activeRoom,
        notifications,
        unreadCount,
        soundEnabled,
        setSoundEnabled,
        toast,
        setToast,
        isCloudConnected: isSupabaseConfigured,
        isAdmin,
        isHost,
        login,
        registerAccount,
        switchActiveRoom,
        createRoom,
        deleteRoom,
        joinRoomByCode,
        postDailyProblem,
        deleteProblem,
        submitSolution,
        addComment,
        deleteComment,
        removeMember,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        resetToDefault: resetDemoData,
        signOut: logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
