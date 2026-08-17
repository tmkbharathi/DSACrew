export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface User {
  id: string;
  name: string;
  username: string; // LeetCode handle
  avatar: string;
  role: 'Admin' | 'Member'; // Room role
  systemRole: 'SuperAdmin' | 'User'; // System role
  points: number;
  streak: number;
  solvedCount: number; // Solved in LeetTracker rooms
  roomSolvedCount?: number;
  leetcodeTotalSolved?: number; // Lifetime solves on LeetCode.com
  lastSolvedDate?: string; // YYYY-MM-DD
  solvedToday: boolean;
  joinedAt: string;
  joinedRoomIds?: string[];
  isLoggedIn?: boolean;
}

export interface AuthCredential {
  userId: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  codeSnippet?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  status: 'Accepted' | 'Wrong Answer' | 'Pending';
  language: string;
  codeSnippet: string;
  timeSpentMinutes: number;
  runtimeMs?: string;
  memoryMb?: string;
  notes?: string;
  submittedAt: string;
  verifiedLeetCode: boolean;
}

export interface Problem {
  id: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  tags: string[];
  targetTimeMinutes?: number;
  postedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  date: string; // YYYY-MM-DD
  submissions: Submission[];
  comments: Comment[];
}

export interface Room {
  id: string;
  name: string;
  code: string;
  description: string;
  creatorId: string;
  createdAt: string;
  targetDailyGoal: number;
  members: User[];
  dailyProblems: Problem[];
  activeProblemId?: string;
}

export interface Notification {
  id: string;
  roomId: string;
  type: 'NEW_PROBLEM' | 'PROBLEM_SOLVED' | 'STREAK_MILESTONE' | 'COMMENT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  authorName?: string;
  authorAvatar?: string;
}

export interface LeetCodeProfileStats {
  username: string;
  realName?: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate?: number;
  ranking: number;
  avatar?: string;
}
