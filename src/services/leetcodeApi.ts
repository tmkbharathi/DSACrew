import type { Difficulty, LeetCodeProfileStats } from '../types';

export interface LeetCodeDailyChallenge {
  title: string;
  titleSlug: string;
  url: string;
  difficulty: Difficulty;
  tags: string[];
  date: string;
}

const CORS_PROXIES = [
  // Local Vite development proxy
  typeof window !== 'undefined' ? '/leetcode-graphql' : '',
  // Direct endpoint
  'https://leetcode.com/graphql',
  // Public CORS gateways for production deployments
  'https://corsproxy.io/?https://leetcode.com/graphql',
  'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://leetcode.com/graphql'),
].filter(Boolean);

async function executeLeetCodeGraphQL(query: string, variables: Record<string, any> = {}): Promise<any> {
  for (const endpoint of CORS_PROXIES) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && (json.data || json.errors)) {
          return json;
        }
      }
    } catch {
      // Continue to next endpoint strategy
    }
  }

  return null;
}

/**
 * Fetches today's official LeetCode Daily Challenge directly from LeetCode GraphQL
 */
export async function fetchLeetCodeDaily(): Promise<LeetCodeDailyChallenge> {
  const query = `
    query getDailyChallenge {
      activeDailyCodingChallengeQuestion {
        date
        link
        question {
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
        }
      }
    }
  `;

  try {
    const data = await executeLeetCodeGraphQL(query);
    const daily = data?.data?.activeDailyCodingChallengeQuestion;

    if (daily && daily.question) {
      const q = daily.question;
      const slug = q.titleSlug || q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const difficulty = (q.difficulty as Difficulty) || 'Medium';
      const tags = Array.isArray(q.topicTags) && q.topicTags.length > 0
        ? q.topicTags.map((t: { name: string }) => t.name)
        : ['Algorithms'];

      return {
        title: q.title,
        titleSlug: slug,
        url: daily.link ? `https://leetcode.com${daily.link}` : `https://leetcode.com/problems/${slug}/`,
        difficulty,
        tags,
        date: daily.date || new Date().toISOString().split('T')[0],
      };
    }
  } catch (err) {
    console.warn('Could not fetch daily LeetCode challenge:', err);
  }

  // Deterministic fallback with today's real date
  const fallbackList: Array<Omit<LeetCodeDailyChallenge, 'date'>> = [
    { title: 'Stone Game V', titleSlug: 'stone-game-v', url: 'https://leetcode.com/problems/stone-game-v/', difficulty: 'Hard', tags: ['Array', 'Math', 'Dynamic Programming', 'Game Theory'] },
    { title: 'Two Sum', titleSlug: 'two-sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'Easy', tags: ['Array', 'Hash Table'] },
    { title: '3Sum', titleSlug: '3sum', url: 'https://leetcode.com/problems/3sum/', difficulty: 'Medium', tags: ['Array', 'Two Pointers', 'Sorting'] },
    { title: 'Number of Islands', titleSlug: 'number-of-islands', url: 'https://leetcode.com/problems/number-of-islands/', difficulty: 'Medium', tags: ['DFS', 'BFS', 'Union Find'] },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const dayIndex = Math.abs(todayStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0)) % fallbackList.length;
  const picked = fallbackList[dayIndex];

  return {
    ...picked,
    date: todayStr,
  };
}

/**
 * Extracts a problem slug from a LeetCode problem or submission URL or raw slug string
 */
export function extractSlugFromLeetCodeUrl(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern: https://leetcode.com/problems/two-sum/...
  const matchProblem = trimmed.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  if (matchProblem && matchProblem[1]) {
    return matchProblem[1].toLowerCase();
  }

  // Pattern: problems/two-sum/...
  const matchShort = trimmed.match(/^problems\/([^/?#]+)/i);
  if (matchShort && matchShort[1]) {
    return matchShort[1].toLowerCase();
  }

  // If already a valid slug format (e.g. "two-sum", "3sum")
  if (/^[a-z0-9]+(-[a-z0-9]+)*$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return null;
}

/**
 * Automatically fetches LeetCode problem details (title, difficulty, tags, canonical URL) by URL or slug
 */
export async function fetchLeetCodeProblemDetails(slugOrUrl: string): Promise<{
  title: string;
  titleSlug: string;
  difficulty: Difficulty;
  tags: string[];
  url: string;
} | null> {
  const extractedSlug = extractSlugFromLeetCodeUrl(slugOrUrl);
  const slug = extractedSlug || slugOrUrl.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) return null;

  const query = `
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        topicTags {
          name
        }
      }
    }
  `;

  try {
    const data = await executeLeetCodeGraphQL(query, { titleSlug: slug });
    const q = data?.data?.question;
    if (q && q.title) {
      const difficulty = (q.difficulty as Difficulty) || 'Medium';
      const tags = Array.isArray(q.topicTags) && q.topicTags.length > 0
        ? q.topicTags.map((t: { name: string }) => t.name)
        : ['Algorithms'];

      return {
        title: q.title,
        titleSlug: q.titleSlug || slug,
        difficulty,
        tags,
        url: `https://leetcode.com/problems/${q.titleSlug || slug}/`,
      };
    }
  } catch (err) {
    console.warn('GraphQL error fetching question details:', err);
  }

  // Fallback heuristic: format title from slug
  const formattedTitle = slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!formattedTitle) return null;

  return {
    title: formattedTitle,
    titleSlug: slug,
    difficulty: 'Medium',
    tags: ['Algorithms'],
    url: `https://leetcode.com/problems/${slug}/`,
  };
}

/**
 * Automatically detects language from code snippet text
 */
export function detectLanguageFromCode(code: string): string {
  const trimmed = code.trim();
  if (/def\s+\w+\s*\(|import\s+sys|class\s+Solution:\s*\n\s*def/i.test(trimmed)) return 'python';
  if (/#include\s+<iostream>|#include\s+<vector>|std::/i.test(trimmed)) return 'cpp';
  if (/public\s+class\s+Solution|public\s+static\s+void\s+main|System\.out\.println/i.test(trimmed)) return 'java';
  if (/interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean)\[\]/i.test(trimmed)) return 'typescript';
  if (/const\s+\w+\s*=\s*function|console\.log|var\s+\w+/i.test(trimmed)) return 'javascript';
  if (/package\s+main|func\s+\w+\s*\(/i.test(trimmed)) return 'go';
  if (/fn\s+main|impl\s+Solution|pub\s+fn/i.test(trimmed)) return 'rust';
  return 'python';
}

/**
 * Result type for LeetCode profile fetch - distinguishes between network errors and user not found
 */
export type LeetCodeProfileResult = 
  | { status: 'success'; data: LeetCodeProfileStats }
  | { status: 'not_found'; data: null }
  | { status: 'network_error'; data: null; message: string };

/**
 * Fetches real user profile stats directly from LeetCode GraphQL
 * Returns a result object that distinguishes between network errors and user not found
 */
export async function fetchLeetCodeProfileWithStatus(username: string): Promise<LeetCodeProfileResult> {
  const cleanUsername = username.trim();
  if (!cleanUsername) return { status: 'not_found', data: null };

  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          realName
          userAvatar
          ranking
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const data = await executeLeetCodeGraphQL(query, { username: cleanUsername });
    
    // If we got a response but no data at all, it's likely a network/CORS issue
    if (!data) {
      return { 
        status: 'network_error', 
        data: null, 
        message: 'Could not connect to LeetCode API. This may be due to network restrictions or CORS policies.' 
      };
    }

    const user = data?.data?.matchedUser;

    // matchedUser is null when the user genuinely doesn't exist on LeetCode
    if (!user) {
      return { status: 'not_found', data: null };
    }

    const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
    const getCount = (diff: string) => {
      const item = acStats.find((s: { difficulty: string; count: number }) => s.difficulty.toLowerCase() === diff.toLowerCase());
      return item ? item.count : 0;
    };

    const totalSolved = getCount('All');
    const easySolved = getCount('Easy');
    const mediumSolved = getCount('Medium');
    const hardSolved = getCount('Hard');

    return {
      status: 'success',
      data: {
        username: user.username,
        realName: user.profile?.realName || user.username,
        avatar: user.profile?.userAvatar || undefined,
        ranking: user.profile?.ranking || 0,
        totalSolved,
        easySolved,
        mediumSolved,
        hardSolved,
      }
    };
  } catch (e) {
    console.warn('Could not fetch real LeetCode user profile stats:', e);
    return { 
      status: 'network_error', 
      data: null, 
      message: 'Network error while connecting to LeetCode API.' 
    };
  }
}

/**
 * Fetches real user profile stats directly from LeetCode GraphQL
 * Legacy wrapper that returns null for both network errors and user not found
 */
export async function fetchLeetCodeProfile(username: string): Promise<LeetCodeProfileStats | null> {
  const result = await fetchLeetCodeProfileWithStatus(username);
  return result.data;
}

/**
 * Verifies submission against user's actual recent LeetCode accepted submissions
 */
export async function verifyUserSubmission(
  username: string,
  problemTitle: string
): Promise<{ verified: boolean; message: string }> {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { verified: false, message: 'No LeetCode handle linked to user profile.' };
  }

  const query = `
    query getRecentSubmissions($username: String!) {
      recentAcSubmissionList(username: $username, limit: 20) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  try {
    const data = await executeLeetCodeGraphQL(query, { username: cleanUsername });
    const list: Array<{ id: string; title: string; titleSlug: string; timestamp: string }> =
      data?.data?.recentAcSubmissionList || [];

    const normTarget = problemTitle.toLowerCase().replace(/[^a-z0-9]/g, '');

    const foundMatch = list.find((sub) => {
      const normTitle = sub.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normSlug = sub.titleSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normTitle === normTarget || normSlug === normTarget || normTitle.includes(normTarget) || normTarget.includes(normTitle);
    });

    if (foundMatch) {
      return {
        verified: true,
        message: `Verified! Found Accepted submission for "${foundMatch.title}" on @${cleanUsername}'s LeetCode account.`,
      };
    } else {
      return {
        verified: false,
        message: `No recent Accepted submission for "${problemTitle}" found in the last 20 submissions of @${cleanUsername}. You can still submit your solution manually below.`,
      };
    }
  } catch {
    return {
      verified: false,
      message: `Could not connect to LeetCode API to verify submission. You can still submit manually.`,
    };
  }
}
