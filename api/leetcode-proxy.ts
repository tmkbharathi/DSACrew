import type { VercelRequest, VercelResponse } from "@vercel/node";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ error: "Request body is required" });
    }

    // Forward the GraphQL request to LeetCode
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Referer": "https://leetcode.com",
        "Origin": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("LeetCode proxy error:", error);
    return res.status(500).json({
      error: "Failed to fetch from LeetCode API",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
