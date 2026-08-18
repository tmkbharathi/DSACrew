import type { Room, User, Notification } from '../types';

export const INITIAL_CURRENT_USER: User = {
  id: 'usr_main',
  name: 'You',
  username: '', // Unset until user signs in / registers
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  role: 'Admin',
  systemRole: 'User',
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

export const MOCK_ROOMS: Room[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];
