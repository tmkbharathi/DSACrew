import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import confetti from 'canvas-confetti';
import type { Room, User, Notification, Difficulty, Comment, FileAttachment } from '../types';
import { INITIAL_CURRENT_USER } from '../data/mockData';
import {
  supabase,
  isSupabaseConfigured,
  signUpUser,
  signInUser,
  signOutUser,
  createUserProfile,
  getUserProfile,
  getUserByUsername,
  updateUserProfile,
  createRoom as dbCreateRoom,
  getRoomByCode,
  getUserRooms,
  getAllRooms,
  joinRoom as dbJoinRoom,
  leaveRoom as dbLeaveRoom,
  deleteRoom as dbDeleteRoom,
  createProblem as dbCreateProblem,
  deleteProblem as dbDeleteProblem,
  createSubmission as dbCreateSubmission,
  createComment as dbCreateComment,
  deleteComment as dbDeleteComment,
  getUserNotifications,
  markNotificationRead as dbMarkNotificationRead,
  markAllNotificationsRead as dbMarkAllNotificationsRead,
  subscribeToRoom,
  unsubscribeFromChannel,
} from '../services/supabase';
import { fetchLeetCodeProfile, fetchLeetCodeProfileWithStatus } from '../services/leetcodeApi';

interface AppContextType {
  currentUser: User;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
  syncUserProfileFromLeetCode: (username?: string) => Promise<boolean>;
  rooms: Room[];
  communityRooms: Room[];
  activeRoomId: string;
  activeRoom: Room | undefined;
  isLandingView: boolean;
  setIsLandingView: (val: boolean) => void;
  notifications: Notification[];
  unreadCount: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toast: { title: string; message: string; type?: string } | null;
  setToast: (toast: { title: string; message: string; type?: string } | null) => void;
  isCloudConnected: boolean;
  isAdmin: boolean;
  isHost: boolean;
  isLoading: boolean;
  login: (usernameOrHandle: string, password?: string) => Promise<{ success: boolean; message: string }>;
  registerAccount: (name: string, username: string, password?: string) => Promise<{ success: boolean; message: string }>;

  // Actions
  switchActiveRoom: (roomId: string) => void;
  createRoom: (name: string, description: string, targetDailyGoal?: number) => Promise<Room | null>;
  deleteRoom: (roomId: string) => Promise<{ success: boolean; message: string }>;
  joinRoomByCode: (code: string) => Promise<{ success: boolean; message: string }>;
  postDailyProblem: (problem: {
    title: string;
    url: string;
    difficulty: Difficulty;
    tags: string[];
    targetTimeMinutes?: number;
    date?: string;
  }) => Promise<void>;
  setActiveProblemId: (problemId: string) => void;
  deleteProblem: (problemId: string) => Promise<void>;
  submitSolution: (
    problemId: string,
    data?: {
      language?: string;
      codeSnippet?: string;
      timeSpentMinutes?: number;
      runtimeMs?: string;
      memoryMb?: string;
      notes?: string;
      verifiedLeetCode?: boolean;
    }
  ) => Promise<void>;
  addComment: (problemId: string, content: string, codeSnippet?: string, attachments?: FileAttachment[]) => Promise<void>;
  deleteComment: (problemId: string, commentId: string) => Promise<void>;
  removeMember: (roomId: string, memberId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshRooms: () => Promise<void>;
  theme: 'dark' | 'illustrative';
  setTheme: (theme: 'dark' | 'illustrative') => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const normalizeHandle = (value?: string) => value?.trim().toLowerCase() || '';

export const isUserHostOfRoom = (room?: Room, user?: User): boolean => {
  if (!room || !user || !user.username) return false;
  if (user.systemRole === 'SuperAdmin') return true;
  return room.creatorId === user.id;
};

export const isUserInRoom = (room?: Room, user?: User): boolean => {
  if (!room || !user || !user.isLoggedIn || !user.username) return false;
  if (user.systemRole === 'SuperAdmin') return true;
  if (room.creatorId === user.id) return true;
  return (room.members || []).some((m) => m.id === user.id);
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_CURRENT_USER);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [communityRooms, setCommunityRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [isLandingView, setIsLandingView] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [theme, setThemeState] = useState<'dark' | 'illustrative'>(() => {
    try {
      const saved = localStorage.getItem('leettracker_theme') as 'dark' | 'illustrative' | null;
      if (saved === 'dark' || saved === 'illustrative') {
        return saved;
      }
      return 'illustrative'; // Default to illustrative on this branch
    } catch {
      return 'illustrative';
    }
  });

  const setTheme = useCallback((newTheme: 'dark' | 'illustrative') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('leettracker_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  }, [theme]);

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('leettracker_sound_enabled');
      if (saved !== null) {
        return saved === 'true';
      }
      return true;
    } catch {
      return true;
    }
  });

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem('leettracker_sound_enabled', String(enabled));
    } catch {}
  }, []);

  const [toast, setToast] = useState<{ title: string; message: string; type?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep track of current loading user to prevent race conditions
  const loadingUserIdRef = useRef<string | null>(null);

  const isLoggedIn = Boolean(currentUser.isLoggedIn && currentUser.username?.trim());
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const unreadCount = notifications.filter((n) => !n.read && n.roomId === activeRoomId).length;
  const isHost = isUserHostOfRoom(activeRoom, currentUser);
  const isAdmin = isHost;

  // Centralized user data loader
  const loadUserData = useCallback(async (userId: string, isRegistration = false) => {
    loadingUserIdRef.current = userId;
    try {
      let profile = await getUserProfile(userId);
      
      // If during registration, retry briefly if profile row was just written
      if (!profile && isRegistration) {
        await new Promise((res) => setTimeout(res, 400));
        profile = await getUserProfile(userId);
      }

      if (profile) {
        setCurrentUser({ ...profile, isLoggedIn: true });
      }

      const [userRooms, allCommunity, userNotifs] = await Promise.all([
        getUserRooms(userId),
        getAllRooms(),
        getUserNotifications(userId),
      ]);

      // Verify we haven't switched users during async fetches
      if (loadingUserIdRef.current === userId) {
        setRooms(userRooms);
        setCommunityRooms(allCommunity);
        setNotifications(userNotifs);

        if (userRooms.length > 0) {
          setActiveRoomId((prev) => {
            if (prev && userRooms.some((r) => r.id === prev)) return prev;
            return userRooms[0].id;
          });
        } else {
          setActiveRoomId('');
        }
      }

      return profile;
    } catch (err) {
      console.error('Error loading user data:', err);
      return null;
    }
  }, []);

  // Initialize auth state from Supabase session
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          const allCommunity = await getAllRooms();
          setCommunityRooms(allCommunity);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Only load if not already loaded for this user
        if (currentUser.id !== session.user.id || !currentUser.isLoggedIn) {
          await loadUserData(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        loadingUserIdRef.current = null;
        setCurrentUser(INITIAL_CURRENT_USER);
        setRooms([]);
        setActiveRoomId('');
        setNotifications([]);
        setIsLandingView(true);
        const allCommunity = await getAllRooms();
        setCommunityRooms(allCommunity);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // Synchronize activeRoomId when rooms change to prevent broken room actions
  useEffect(() => {
    if (rooms.length > 0) {
      if (!activeRoomId || !rooms.some((r) => r.id === activeRoomId)) {
        setActiveRoomId(rooms[0].id);
      }
    } else {
      if (activeRoomId !== '') {
        setActiveRoomId('');
      }
    }
  }, [rooms, activeRoomId]);

  // Subscribe to realtime updates for active room
  useEffect(() => {
    if (!isSupabaseConfigured || !activeRoomId) return;

    const channel = subscribeToRoom(activeRoomId, {
      onProblemChange: () => refreshRooms(),
      onSubmissionChange: () => refreshRooms(),
      onMemberChange: () => refreshRooms(),
    });

    return () => {
      if (channel) unsubscribeFromChannel(channel);
    };
  }, [activeRoomId]);

  const refreshRooms = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    
    try {
      const allCommunity = await getAllRooms();
      setCommunityRooms(allCommunity);

      if (currentUser.id && currentUser.id !== 'usr_main') {
        const userRooms = await getUserRooms(currentUser.id);
        setRooms(userRooms);
        if (userRooms.length > 0) {
          setActiveRoomId((prev) => {
            if (prev && userRooms.some((r) => r.id === prev)) return prev;
            return userRooms[0].id;
          });
        }
      }
    } catch (err) {
      console.error('Error refreshing rooms:', err);
    }
  }, [currentUser.id]);

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

  const logout = async () => {
    loadingUserIdRef.current = null;
    if (isSupabaseConfigured) {
      await signOutUser();
    }
    setCurrentUser({ ...INITIAL_CURRENT_USER, isLoggedIn: false, username: '' });
    setRooms([]);
    setActiveRoomId('');
    setNotifications([]);
    setIsLandingView(true);
    const allCommunity = await getAllRooms();
    setCommunityRooms(allCommunity);
    setToast({ title: 'Signed Out', message: 'You have been signed out.', type: 'info' });
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    
    if (isSupabaseConfigured && currentUser.id && currentUser.id !== 'usr_main') {
      await updateUserProfile(currentUser.id, {
        name: updates.name,
        avatar: updates.avatar,
        points: updates.points,
        streak: updates.streak,
        solved_count: updates.solvedCount || updates.roomSolvedCount,
        leetcode_total_solved: updates.leetcodeTotalSolved,
        last_solved_date: updates.lastSolvedDate,
      });
    }
  };

  const syncUserProfileFromLeetCode = async (usernameToSync?: string): Promise<boolean> => {
    const handle = usernameToSync || currentUser.username;
    if (!handle.trim()) return false;

    const stats = await fetchLeetCodeProfile(handle.trim());
    if (stats) {
      await updateCurrentUser({
        username: stats.username,
        name: stats.realName || currentUser.name || stats.username,
        avatar: stats.avatar || currentUser.avatar,
        leetcodeTotalSolved: stats.totalSolved,
      });
      return true;
    }
    return false;
  };

  const login = async (usernameOrHandle: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const clean = usernameOrHandle.trim().toLowerCase();
    if (!clean) return { success: false, message: 'Please enter your LeetCode username.' };
    if (!password?.trim()) return { success: false, message: 'Password is required.' };

    if (!isSupabaseConfigured) {
      return { success: false, message: 'Database not configured. Please set up Supabase.' };
    }

    const email = `${clean}+leetcode@gmail.com`;
    const { user, error } = await signInUser(email, password.trim());

    if (error || !user) {
      return { success: false, message: error || 'Invalid credentials.' };
    }

    const profile = await loadUserData(user.id);
    if (!profile) {
      return { success: false, message: 'User profile not found in database.' };
    }

    // Sync LeetCode stats asynchronously in background
    fetchLeetCodeProfile(profile.username).then((stats) => {
      if (stats) {
        updateCurrentUser({
          leetcodeTotalSolved: stats.totalSolved,
          avatar: stats.avatar || profile.avatar,
        });
      }
    });

    setToast({ title: `Welcome back, ${profile.name}!`, message: `Signed in as @${profile.username}`, type: 'success' });
    return { success: true, message: 'Login successful.' };
  };

  const registerAccount = async (name: string, username: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPassword = password?.trim();

    if (!cleanUsername) return { success: false, message: 'LeetCode username is required.' };
    if (!cleanName) return { success: false, message: 'Display name is required.' };
    if (!cleanPassword || cleanPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    if (!isSupabaseConfigured) {
      return { success: false, message: 'Database not configured. Please set up Supabase.' };
    }

    // Check if username already exists in lt_users
    const existingUser = await getUserByUsername(cleanUsername);
    if (existingUser) {
      return { success: false, message: `Username "@${cleanUsername}" is already registered.` };
    }

    // Verify LeetCode username exists
    const lcResult = await fetchLeetCodeProfileWithStatus(cleanUsername);
    
    if (lcResult.status === 'network_error') {
      return { 
        success: false, 
        message: `Unable to verify LeetCode profile. ${lcResult.message} Please check your internet connection and try again.` 
      };
    }
    
    if (lcResult.status === 'not_found' || !lcResult.data) {
      return { success: false, message: `LeetCode handle "@${cleanUsername}" not found. Please verify your public profile.` };
    }
    
    const lcStats = lcResult.data;

    const email = `${cleanUsername}+leetcode@gmail.com`;
    const { user, error } = await signUpUser(email, cleanPassword, {
      username: lcStats.username,
      name: cleanName || lcStats.realName || lcStats.username,
      avatar: lcStats.avatar,
    });

    if (error || !user) {
      return { success: false, message: error || 'Registration failed.' };
    }

    // Create user profile in lt_users table
    const { error: profileError } = await createUserProfile({
      id: user.id,
      username: lcStats.username,
      name: cleanName || lcStats.realName || lcStats.username,
      avatar: lcStats.avatar,
      leetcode_total_solved: lcStats.totalSolved,
    });

    if (profileError) {
      return { success: false, message: profileError };
    }

    const newUser: User = {
      id: user.id,
      name: cleanName || lcStats.realName || lcStats.username,
      username: lcStats.username,
      avatar: lcStats.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${lcStats.username}`,
      role: 'Admin',
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

    setCurrentUser(newUser);
    await loadUserData(user.id, true);

    setToast({
      title: 'Account Created!',
      message: `Welcome ${newUser.name}! Verified @${lcStats.username} (${lcStats.totalSolved} solved).`,
      type: 'success',
    });

    return { success: true, message: 'Account registered successfully.' };
  };

  const switchActiveRoom = (roomId: string) => {
    if (rooms.some((r) => r.id === roomId)) {
      setActiveRoomId(roomId);
    }
  };

  const createRoom = async (name: string, description: string, targetDailyGoal = 1): Promise<Room | null> => {
    if (!isSupabaseConfigured || !currentUser.id || currentUser.id === 'usr_main') {
      setToast({ title: 'Error', message: 'Please sign in to create a room.', type: 'error' });
      return null;
    }

    const { room, error } = await dbCreateRoom({
      name: name.trim(),
      description: description.trim(),
      creator_id: currentUser.id,
      target_daily_goal: targetDailyGoal,
    });

    if (error || !room) {
      setToast({ title: 'Error', message: error || 'Failed to create room.', type: 'error' });
      return null;
    }

    setRooms((prev) => [room, ...prev.filter((r) => r.id !== room.id)]);
    setCommunityRooms((prev) => [room, ...prev.filter((r) => r.id !== room.id)]);
    setActiveRoomId(room.id);
    setIsLandingView(false);

    setToast({ title: 'Room Created!', message: `Invite code: ${room.code}`, type: 'success' });
    playAudioNotification();

    return room;
  };

  const deleteRoom = async (roomId: string): Promise<{ success: boolean; message: string }> => {
    const roomToDelete = rooms.find((r) => r.id === roomId);
    if (!roomToDelete) return { success: false, message: 'Room not found.' };

    if (roomToDelete.creatorId !== currentUser.id && currentUser.systemRole !== 'SuperAdmin') {
      return { success: false, message: 'Permission denied.' };
    }

    const { error } = await dbDeleteRoom(roomId);
    if (error) return { success: false, message: error };

    const remaining = rooms.filter((r) => r.id !== roomId);
    setRooms(remaining);
    setCommunityRooms((prev) => prev.filter((r) => r.id !== roomId));
    if (activeRoomId === roomId) {
      setActiveRoomId(remaining[0]?.id || '');
      if (remaining.length === 0) {
        setIsLandingView(true);
      }
    }

    setToast({ title: 'Room Deleted', message: `"${roomToDelete.name}" has been deleted.`, type: 'warning' });
    return { success: true, message: 'Room deleted.' };
  };

  const joinRoomByCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured || !currentUser.id || currentUser.id === 'usr_main') {
      return { success: false, message: 'Please sign in to join a room.' };
    }

    const targetRoom = await getRoomByCode(code.trim().toUpperCase());
    if (!targetRoom) {
      return { success: false, message: 'Invalid room code.' };
    }

    const isMember = targetRoom.members.some((m) => m.id === currentUser.id);
    if (!isMember) {
      const { error } = await dbJoinRoom(targetRoom.id, currentUser.id);
      if (error) return { success: false, message: error };
    }

    await refreshRooms();
    setActiveRoomId(targetRoom.id);
    setIsLandingView(false);

    setToast({ title: 'Room Joined!', message: `Welcome to ${targetRoom.name}!`, type: 'success' });
    playAudioNotification();

    return { success: true, message: `Joined ${targetRoom.name}` };
  };

  const postDailyProblem = async (problemData: {
    title: string;
    url: string;
    difficulty: Difficulty;
    tags: string[];
    targetTimeMinutes?: number;
    date?: string;
  }) => {
    const targetRoomId = activeRoomId || activeRoom?.id;
    if (!isSupabaseConfigured || !targetRoomId || !currentUser.id || currentUser.id === 'usr_main') return;

    const { problem, error } = await dbCreateProblem({
      room_id: targetRoomId,
      title: problemData.title,
      url: problemData.url,
      difficulty: problemData.difficulty,
      tags: problemData.tags,
      target_time_minutes: problemData.targetTimeMinutes,
      posted_by: currentUser.id,
      date: problemData.date,
    });

    if (error || !problem) {
      setToast({ title: 'Error', message: error || 'Failed to post problem.', type: 'error' });
      return;
    }

    await refreshRooms();
    setToast({ title: 'Problem Added!', message: `"${problem.title}" scheduled.`, type: 'success' });
    playAudioNotification();
  };

  const setActiveProblemId = (problemId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === activeRoomId ? { ...r, activeProblemId: problemId } : r))
    );
  };

  const deleteProblem = async (problemId: string) => {
    const targetProblem = activeRoom?.dailyProblems.find((p) => p.id === problemId);
    if (!isHost && targetProblem?.postedBy.id !== currentUser.id) {
      setToast({ title: 'Permission Denied', message: 'Only host or author can delete.', type: 'warning' });
      return;
    }

    const { error } = await dbDeleteProblem(problemId);
    if (error) {
      setToast({ title: 'Error', message: error, type: 'error' });
      return;
    }

    await refreshRooms();
    setToast({ title: 'Problem Removed', message: 'Challenge removed.', type: 'info' });
  };

  const submitSolution = async (
    problemId: string,
    data?: {
      language?: string;
      codeSnippet?: string;
      timeSpentMinutes?: number;
      runtimeMs?: string;
      memoryMb?: string;
      notes?: string;
      verifiedLeetCode?: boolean;
    }
  ) => {
    if (!isSupabaseConfigured || !currentUser.id || currentUser.id === 'usr_main') return;

    const targetProblem = activeRoom?.dailyProblems.find((p) => p.id === problemId);
    const existingSubmission = targetProblem?.submissions.find((s) => s.userId === currentUser.id);
    const isFirstSubmission = !existingSubmission;

    let earnedPoints = 50;
    if (targetProblem) {
      if (targetProblem.difficulty === 'Hard') earnedPoints = 100;
      else if (targetProblem.difficulty === 'Medium') earnedPoints = 60;
      else earnedPoints = 30;
    }

    const { error } = await dbCreateSubmission({
      problem_id: problemId,
      user_id: currentUser.id,
      status: 'Accepted',
      language: data?.language,
      code_snippet: data?.codeSnippet,
      time_spent_minutes: data?.timeSpentMinutes,
      runtime_ms: data?.runtimeMs,
      memory_mb: data?.memoryMb,
      notes: data?.notes,
      verified_leetcode: data?.verifiedLeetCode,
    });

    if (error) {
      setToast({ title: 'Error', message: error, type: 'error' });
      return;
    }

    if (isFirstSubmission) {
      const todayStr = new Date().toISOString().split('T')[0];
      const newStreak = currentUser.solvedToday ? currentUser.streak : currentUser.streak + 1;
      
      await updateCurrentUser({
        points: currentUser.points + earnedPoints,
        streak: newStreak,
        roomSolvedCount: (currentUser.roomSolvedCount || 0) + 1,
        solvedCount: (currentUser.solvedCount || 0) + 1,
        lastSolvedDate: todayStr,
        solvedToday: true,
      });

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}

      setToast({ title: 'Challenge Solved!', message: `+${earnedPoints} Points!`, type: 'success' });
    } else {
      setToast({ title: 'Solution Updated!', message: 'Submission saved.', type: 'info' });
    }

    await refreshRooms();
    playAudioNotification();
  };

  const addComment = async (problemId: string, content: string, codeSnippet?: string, attachments?: FileAttachment[]) => {
    const newComment: Comment = {
      id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id || 'usr_main',
      userName: currentUser.name || 'Anonymous Coder',
      userAvatar: currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      content,
      codeSnippet,
      attachments,
      createdAt: 'Just now',
    };

    if (isSupabaseConfigured && currentUser.id && currentUser.id !== 'usr_main') {
      const { error } = await dbCreateComment({
        problem_id: problemId,
        user_id: currentUser.id,
        content,
        code_snippet: codeSnippet,
        attachments,
      });

      if (error) {
        setToast({ title: 'Error', message: error, type: 'error' });
        return;
      }

      await refreshRooms();
    } else {
      setRooms((prev) =>
        prev.map((r) => ({
          ...r,
          dailyProblems: r.dailyProblems.map((p) =>
            p.id === problemId
              ? { ...p, comments: [newComment, ...(p.comments || [])] }
              : p
          ),
        }))
      );
    }
  };

  const deleteComment = async (_problemId: string, commentId: string) => {
    if (!activeRoom) return;

    const targetComment = activeRoom.dailyProblems
      .flatMap((p) => p.comments)
      .find((c) => c.id === commentId);
    
    if (!isHost && targetComment?.userId !== currentUser.id) {
      setToast({ title: 'Permission Denied', message: 'Cannot delete this comment.', type: 'warning' });
      return;
    }

    const { error } = await dbDeleteComment(commentId);
    if (error) {
      setToast({ title: 'Error', message: error, type: 'error' });
      return;
    }

    await refreshRooms();
    setToast({ title: 'Comment Removed', message: 'Comment deleted.', type: 'info' });
  };

  const removeMember = async (roomId: string, memberId: string) => {
    const targetRoom = rooms.find((r) => r.id === roomId);
    if (!targetRoom) return;

    if (targetRoom.creatorId !== currentUser.id && currentUser.systemRole !== 'SuperAdmin') {
      setToast({ title: 'Permission Denied', message: 'Only host can remove members.', type: 'warning' });
      return;
    }

    if (memberId === currentUser.id) {
      setToast({ title: 'Notice', message: 'Cannot remove yourself.', type: 'info' });
      return;
    }

    const { error } = await dbLeaveRoom(roomId, memberId);
    if (error) {
      setToast({ title: 'Error', message: error, type: 'error' });
      return;
    }

    await refreshRooms();
    setToast({ title: 'Member Removed', message: 'Member removed from room.', type: 'warning' });
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (isSupabaseConfigured) {
      await dbMarkNotificationRead(id);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => (n.roomId === activeRoomId ? { ...n, read: true } : n))
    );
    if (isSupabaseConfigured && currentUser.id && currentUser.id !== 'usr_main') {
      await dbMarkAllNotificationsRead(currentUser.id, activeRoomId);
    }
  };

  const resetDemoData = async () => {
    await logout();
    setToast({ title: 'Workspace Reset', message: 'Signed out and cleared local data.', type: 'info' });
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
        communityRooms,
        activeRoomId,
        activeRoom,
        isLandingView,
        setIsLandingView,
        notifications,
        unreadCount,
        soundEnabled,
        setSoundEnabled,
        toast,
        setToast,
        isCloudConnected: isSupabaseConfigured,
        isAdmin,
        isHost,
        isLoading,
        login,
        registerAccount,
        switchActiveRoom,
        createRoom,
        deleteRoom,
        joinRoomByCode,
        postDailyProblem,
        setActiveProblemId,
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
        refreshRooms,
        theme,
        setTheme,
        selectedDate,
        setSelectedDate,
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
