import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, Room, Problem, Submission, Comment, Notification, Difficulty } from '../types';

// Read Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =====================================================
// AUTH FUNCTIONS
// =====================================================

export async function signUpUser(
  email: string,
  password: string,
  userData: { username: string; name: string; avatar?: string }
): Promise<{ user: SupabaseUser | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: userData.username,
        name: userData.name,
        avatar: userData.avatar,
      },
    },
  });

  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signInUser(
  email: string,
  password: string
): Promise<{ user: SupabaseUser | null; error: string | null }> {
  if (!supabase) return { user: null, error: 'Supabase not configured' };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error: error.message };
  return { user: data.user, error: null };
}

export async function signOutUser(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// =====================================================
// USER PROFILE FUNCTIONS
// =====================================================

export async function createUserProfile(user: {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  leetcode_total_solved?: number;
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.from('lt_users').upsert({
    id: user.id,
    username: user.username,
    name: user.name,
    avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`,
    leetcode_total_solved: user.leetcode_total_solved || 0,
    system_role: 'User',
    points: 0,
    streak: 0,
    solved_count: 0,
  });

  return { error: error?.message || null };
}

export async function getUserProfile(userId: string): Promise<User | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('lt_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return dbUserToAppUser(data);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('lt_users')
    .select('*')
    .ilike('username', username)
    .single();

  if (error || !data) return null;

  return dbUserToAppUser(data);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string;
    avatar: string;
    points: number;
    streak: number;
    solved_count: number;
    leetcode_total_solved: number;
    last_solved_date: string;
  }>
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('lt_users')
    .update(updates)
    .eq('id', userId);

  return { error: error?.message || null };
}

// =====================================================
// ROOM FUNCTIONS
// =====================================================

export async function createRoom(room: {
  name: string;
  description: string;
  creator_id: string;
  target_daily_goal?: number;
}): Promise<{ room: Room | null; error: string | null }> {
  if (!supabase) return { room: null, error: 'Supabase not configured' };

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from('lt_rooms')
    .insert({
      name: room.name,
      code,
      description: room.description,
      creator_id: room.creator_id,
      target_daily_goal: room.target_daily_goal || 1,
    })
    .select()
    .single();

  if (error || !data) return { room: null, error: error?.message || 'Failed to create room' };

  // Add creator as admin member
  await supabase.from('lt_room_members').insert({
    room_id: data.id,
    user_id: room.creator_id,
    role: 'Admin',
  });

  const createdRoom = await getRoomById(data.id);
  return { room: createdRoom, error: null };
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  if (!supabase) return null;

  const { data: roomData, error } = await supabase
    .from('lt_rooms')
    .select(`
      *,
      creator:lt_users!lt_rooms_creator_id_fkey(id, username, name, avatar)
    `)
    .eq('id', roomId)
    .single();

  if (error || !roomData) return null;

  // Get members
  const { data: membersData } = await supabase
    .from('lt_room_members')
    .select(`
      role,
      user:lt_users(*)
    `)
    .eq('room_id', roomId);

  // Get problems
  const { data: problemsData } = await supabase
    .from('lt_problems')
    .select(`
      *,
      poster:lt_users!lt_problems_posted_by_fkey(id, name, avatar)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: false });

  const members: User[] = (membersData || []).map((m: any) => ({
    ...dbUserToAppUser(m.user),
    role: m.role,
  }));

  const problems: Problem[] = await Promise.all(
    (problemsData || []).map(async (p: any) => {
      const submissions = await getSubmissionsForProblem(p.id);
      const comments = await getCommentsForProblem(p.id);
      return dbProblemToAppProblem(p, submissions, comments);
    })
  );

  return {
    id: roomData.id,
    name: roomData.name,
    code: roomData.code,
    description: roomData.description || '',
    creatorId: roomData.creator_id,
    creatorUsername: roomData.creator?.username || '',
    creatorName: roomData.creator?.name || '',
    createdAt: roomData.created_at?.split('T')[0] || '',
    targetDailyGoal: roomData.target_daily_goal || 1,
    members,
    dailyProblems: problems,
    activeProblemId: problems[0]?.id,
  };
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('lt_rooms')
    .select('id')
    .ilike('code', code)
    .single();

  if (error || !data) return null;

  return getRoomById(data.id);
}

export async function getUserRooms(userId: string): Promise<Room[]> {
  if (!supabase) return [];

  const { data: membershipData } = await supabase
    .from('lt_room_members')
    .select('room_id')
    .eq('user_id', userId);

  if (!membershipData || membershipData.length === 0) return [];

  const roomIds = membershipData.map((m) => m.room_id);
  const rooms: Room[] = [];

  for (const roomId of roomIds) {
    const room = await getRoomById(roomId);
    if (room) rooms.push(room);
  }

  return rooms;
}

export async function getAllRooms(): Promise<Room[]> {
  if (!supabase) return [];

  const { data: roomsData, error } = await supabase
    .from('lt_rooms')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !roomsData) return [];

  const rooms: Room[] = [];
  for (const r of roomsData) {
    const room = await getRoomById(r.id);
    if (room) rooms.push(room);
  }
  return rooms;
}

export async function joinRoom(
  roomId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.from('lt_room_members').upsert({
    room_id: roomId,
    user_id: userId,
    role: 'Member',
  });

  return { error: error?.message || null };
}

export async function leaveRoom(
  roomId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase
    .from('lt_room_members')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);

  return { error: error?.message || null };
}

export async function deleteRoom(roomId: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.from('lt_rooms').delete().eq('id', roomId);

  return { error: error?.message || null };
}

// =====================================================
// PROBLEM FUNCTIONS
// =====================================================

export async function createProblem(problem: {
  room_id: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  tags: string[];
  target_time_minutes?: number;
  posted_by: string;
  date?: string;
}): Promise<{ problem: Problem | null; error: string | null }> {
  if (!supabase) return { problem: null, error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('lt_problems')
    .insert({
      room_id: problem.room_id,
      title: problem.title,
      url: problem.url,
      difficulty: problem.difficulty,
      tags: problem.tags,
      target_time_minutes: problem.target_time_minutes,
      posted_by: problem.posted_by,
      date: problem.date || new Date().toISOString().split('T')[0],
    })
    .select(`
      *,
      poster:lt_users!lt_problems_posted_by_fkey(id, name, avatar)
    `)
    .single();

  if (error || !data) return { problem: null, error: error?.message || 'Failed to create problem' };

  return {
    problem: dbProblemToAppProblem(data, [], []),
    error: null,
  };
}

export async function deleteProblem(problemId: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.from('lt_problems').delete().eq('id', problemId);

  return { error: error?.message || null };
}

// =====================================================
// SUBMISSION FUNCTIONS
// =====================================================

export async function createSubmission(submission: {
  problem_id: string;
  user_id: string;
  status?: 'Accepted' | 'Wrong Answer' | 'Pending';
  language?: string;
  code_snippet?: string;
  time_spent_minutes?: number;
  runtime_ms?: string;
  memory_mb?: string;
  notes?: string;
  verified_leetcode?: boolean;
}): Promise<{ submission: Submission | null; error: string | null }> {
  if (!supabase) return { submission: null, error: 'Supabase not configured' };

  // Check if user already has a submission for this problem
  const { data: existing } = await supabase
    .from('lt_submissions')
    .select('id')
    .eq('problem_id', submission.problem_id)
    .eq('user_id', submission.user_id)
    .single();

  let data, error;

  if (existing) {
    // Update existing submission
    const result = await supabase
      .from('lt_submissions')
      .update({
        status: submission.status || 'Accepted',
        language: submission.language,
        code_snippet: submission.code_snippet,
        time_spent_minutes: submission.time_spent_minutes,
        runtime_ms: submission.runtime_ms,
        memory_mb: submission.memory_mb,
        notes: submission.notes,
        verified_leetcode: submission.verified_leetcode || false,
      })
      .eq('id', existing.id)
      .select(`
        *,
        user:lt_users(id, name, avatar)
      `)
      .single();
    data = result.data;
    error = result.error;
  } else {
    // Create new submission
    const result = await supabase
      .from('lt_submissions')
      .insert({
        problem_id: submission.problem_id,
        user_id: submission.user_id,
        status: submission.status || 'Accepted',
        language: submission.language,
        code_snippet: submission.code_snippet,
        time_spent_minutes: submission.time_spent_minutes,
        runtime_ms: submission.runtime_ms,
        memory_mb: submission.memory_mb,
        notes: submission.notes,
        verified_leetcode: submission.verified_leetcode || false,
      })
      .select(`
        *,
        user:lt_users(id, name, avatar)
      `)
      .single();
    data = result.data;
    error = result.error;
  }

  if (error || !data) return { submission: null, error: error?.message || 'Failed to create submission' };

  return {
    submission: dbSubmissionToAppSubmission(data),
    error: null,
  };
}

export async function getSubmissionsForProblem(problemId: string): Promise<Submission[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from('lt_submissions')
    .select(`
      *,
      user:lt_users(id, name, avatar)
    `)
    .eq('problem_id', problemId)
    .order('submitted_at', { ascending: false });

  return (data || []).map(dbSubmissionToAppSubmission);
}

// =====================================================
// COMMENT FUNCTIONS
// =====================================================

export async function createComment(comment: {
  problem_id: string;
  user_id: string;
  content: string;
  code_snippet?: string;
}): Promise<{ comment: Comment | null; error: string | null }> {
  if (!supabase) return { comment: null, error: 'Supabase not configured' };

  const { data, error } = await supabase
    .from('lt_comments')
    .insert({
      problem_id: comment.problem_id,
      user_id: comment.user_id,
      content: comment.content,
      code_snippet: comment.code_snippet,
    })
    .select(`
      *,
      user:lt_users(id, name, avatar)
    `)
    .single();

  if (error || !data) return { comment: null, error: error?.message || 'Failed to create comment' };

  return {
    comment: dbCommentToAppComment(data),
    error: null,
  };
}

export async function deleteComment(commentId: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.from('lt_comments').delete().eq('id', commentId);

  return { error: error?.message || null };
}

export async function getCommentsForProblem(problemId: string): Promise<Comment[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from('lt_comments')
    .select(`
      *,
      user:lt_users(id, name, avatar)
    `)
    .eq('problem_id', problemId)
    .order('created_at', { ascending: false });

  return (data || []).map(dbCommentToAppComment);
}

// =====================================================
// NOTIFICATION FUNCTIONS
// =====================================================

export async function createNotification(notification: {
  room_id: string;
  user_id: string;
  type: 'NEW_PROBLEM' | 'PROBLEM_SOLVED' | 'STREAK_MILESTONE' | 'COMMENT' | 'SYSTEM';
  title: string;
  message: string;
  author_name?: string;
  author_avatar?: string;
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase not configured' };

  const { error } = await supabase.from('lt_notifications').insert(notification);

  return { error: error?.message || null };
}

export async function getUserNotifications(userId: string, roomId?: string): Promise<Notification[]> {
  if (!supabase) return [];

  let query = supabase
    .from('lt_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (roomId) {
    query = query.eq('room_id', roomId);
  }

  const { data } = await query;

  return (data || []).map(dbNotificationToAppNotification);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (!supabase) return;

  await supabase
    .from('lt_notifications')
    .update({ read: true })
    .eq('id', notificationId);
}

export async function markAllNotificationsRead(userId: string, roomId?: string): Promise<void> {
  if (!supabase) return;

  let query = supabase
    .from('lt_notifications')
    .update({ read: true })
    .eq('user_id', userId);

  if (roomId) {
    query = query.eq('room_id', roomId);
  }

  await query;
}

// =====================================================
// REALTIME SUBSCRIPTIONS
// =====================================================

export function subscribeToRoom(
  roomId: string,
  callbacks: {
    onProblemChange?: () => void;
    onSubmissionChange?: () => void;
    onMemberChange?: () => void;
  }
) {
  if (!supabase) return null;

  const channel = supabase
    .channel(`room_${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lt_problems', filter: `room_id=eq.${roomId}` },
      () => callbacks.onProblemChange?.()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lt_submissions' },
      () => callbacks.onSubmissionChange?.()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lt_room_members', filter: `room_id=eq.${roomId}` },
      () => callbacks.onMemberChange?.()
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromChannel(channel: any) {
  if (supabase && channel) {
    supabase.removeChannel(channel);
  }
}

// =====================================================
// DATA TRANSFORMATION HELPERS
// =====================================================

function dbUserToAppUser(dbUser: any): User {
  const todayStr = new Date().toISOString().split('T')[0];
  const isSolvedToday = Boolean(dbUser.last_solved_date && dbUser.last_solved_date === todayStr);

  return {
    id: dbUser.id,
    name: dbUser.name,
    username: dbUser.username,
    avatar: dbUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${dbUser.username}`,
    role: dbUser.role || 'Member',
    systemRole: dbUser.system_role || 'User',
    points: dbUser.points || 0,
    streak: dbUser.streak || 0,
    solvedCount: dbUser.solved_count || 0,
    roomSolvedCount: dbUser.solved_count || 0,
    leetcodeTotalSolved: dbUser.leetcode_total_solved || 0,
    lastSolvedDate: dbUser.last_solved_date,
    solvedToday: isSolvedToday,
    joinedAt: dbUser.created_at?.split('T')[0] || todayStr,
    isLoggedIn: true,
  };
}

function dbProblemToAppProblem(dbProblem: any, submissions: Submission[], comments: Comment[]): Problem {
  return {
    id: dbProblem.id,
    title: dbProblem.title,
    url: dbProblem.url,
    difficulty: dbProblem.difficulty as Difficulty,
    tags: dbProblem.tags || [],
    targetTimeMinutes: dbProblem.target_time_minutes,
    postedBy: {
      id: dbProblem.poster?.id || dbProblem.posted_by,
      name: dbProblem.poster?.name || 'Unknown',
      avatar: dbProblem.poster?.avatar || '',
    },
    date: dbProblem.date || dbProblem.created_at?.split('T')[0],
    submissions,
    comments,
  };
}

function dbSubmissionToAppSubmission(dbSubmission: any): Submission {
  return {
    id: dbSubmission.id,
    problemId: dbSubmission.problem_id,
    userId: dbSubmission.user_id,
    userName: dbSubmission.user?.name || 'Unknown',
    userAvatar: dbSubmission.user?.avatar || '',
    status: dbSubmission.status || 'Pending',
    language: dbSubmission.language,
    codeSnippet: dbSubmission.code_snippet,
    timeSpentMinutes: dbSubmission.time_spent_minutes,
    runtimeMs: dbSubmission.runtime_ms,
    memoryMb: dbSubmission.memory_mb,
    notes: dbSubmission.notes,
    submittedAt: dbSubmission.submitted_at,
    verifiedLeetCode: dbSubmission.verified_leetcode || false,
  };
}

function dbCommentToAppComment(dbComment: any): Comment {
  return {
    id: dbComment.id,
    userId: dbComment.user_id,
    userName: dbComment.user?.name || 'Unknown',
    userAvatar: dbComment.user?.avatar || '',
    content: dbComment.content,
    codeSnippet: dbComment.code_snippet,
    createdAt: dbComment.created_at,
  };
}

function dbNotificationToAppNotification(dbNotification: any): Notification {
  return {
    id: dbNotification.id,
    roomId: dbNotification.room_id,
    type: dbNotification.type,
    title: dbNotification.title,
    message: dbNotification.message,
    timestamp: dbNotification.created_at,
    read: dbNotification.read || false,
    authorName: dbNotification.author_name,
    authorAvatar: dbNotification.author_avatar,
  };
}
