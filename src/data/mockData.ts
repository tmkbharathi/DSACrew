import type { Room, User, Notification } from '../types';

export const INITIAL_CURRENT_USER: User = {
  id: 'usr_main',
  name: 'LeetCode Engineer',
  username: '', // Ready for user to link their real LeetCode handle
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  role: 'Admin',
  systemRole: 'SuperAdmin',
  points: 0,
  streak: 0,
  solvedCount: 0,
  solvedToday: false,
  joinedAt: new Date().toISOString().split('T')[0],
  isLoggedIn: false,
};

export const MOCK_USERS: User[] = [
  INITIAL_CURRENT_USER,
];

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room_daily_algorithms',
    name: 'Daily LeetCode Masters 🚀',
    code: '7X9K2P',
    description: 'Collaborative daily practice room. Auto-fetch the official daily challenge or post custom problems!',
    creatorId: 'usr_main',
    createdAt: new Date().toISOString().split('T')[0],
    targetDailyGoal: 1,
    members: [INITIAL_CURRENT_USER],
    activeProblemId: undefined,
    dailyProblems: [],
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_welcome',
    roomId: 'room_daily_algorithms',
    type: 'SYSTEM',
    title: 'Welcome to LeetTracker! 🎯',
    message: 'Link your LeetCode handle in Profile settings to auto-sync your real stats and track daily problem completions.',
    timestamp: 'Just now',
    read: false,
  },
];
