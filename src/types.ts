/**
 * CAPTAIHA challenge types.
 *
 * Design principle: every challenge must require REASONING (LLM-level intelligence).
 * Three-tier filtering:
 *   ❌ Human — too fast / too complex for working memory
 *   ❌ Dumb bot — no reasoning capability, can't understand the task
 *   ✅ AI agent — fast AND intelligent
 */

/** Supported challenge type identifiers */
export type ChallengeType = 'code-synthesis' | 'semantic-math' | 'reasoning-hash';

/** Challenge issued to an agent */
export interface Challenge {
  id: string;
  type: ChallengeType;
  /** Challenge payload — type-specific */
  payload: unknown;
  /** Time limit in milliseconds */
  timeLimitMs: number;
  /** ISO timestamp when challenge was created */
  createdAt: string;
}

/** Verification result */
export interface VerifyResult {
  passed: boolean;
  /** Time taken by agent in ms (if available) */
  ms?: number;
  /** Reason for failure (if any) */
  reason?: string;
}

/** Options passed to challenge generator */
export interface ChallengeOptions {
  /** Difficulty level (1-20, default 10) */
  difficulty?: number;
  /** Custom time limit override in ms */
  timeLimitMs?: number;
}

/** Interface that each challenge type must implement */
export interface ChallengeProvider {
  type: ChallengeType;
  /** Generate a new challenge */
  generate(options: ChallengeOptions): Challenge;
  /** Verify an agent's response */
  verify(challenge: Challenge, response: unknown): VerifyResult;
}
