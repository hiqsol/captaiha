/**
 * CAPTAICHA — Three-tier CAPTCHA: AI vs Computer vs Human
 *
 * Every challenge is a prism that splits responses into three signals:
 *   🤖 AI agent  — reasoning ✅ speed ✅ creativity ✅
 *   💻 Computer  — reasoning ❌ speed ✅ creativity ❌
 *   🧑 Human     — reasoning ✅ speed ❌ creativity ✅
 */

/** Entity type classification result */
export type EntityType = 'ai' | 'computer' | 'human' | 'unclassified';

/** Supported challenge type identifiers */
export type ChallengeType =
  | 'code-synthesis'
  | 'semantic-math'
  | 'reasoning-hash'
  | 'pattern-completion'
  | 'adversarial-decode';

/** Challenge issued to an entity */
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

/** Three-dimensional signal extracted from a response */
export interface Signals {
  /** Did the entity demonstrate understanding? */
  reasoning: boolean;
  /** Response time in milliseconds */
  speed: number;
  /** Creativity/novelty score 0-1 (0 = template, 1 = fully novel) */
  creativity: number;
}

/** Classification result — the core output */
export interface ClassifyResult {
  /** Detected entity type */
  entity: EntityType;
  /** Classification confidence 0-1 */
  confidence: number;
  /** Raw signals from the challenge */
  signals: Signals;
  /** Time taken in ms */
  ms?: number;
  /** Explanation if unclassified */
  reason?: string;
}

/** Multi-challenge suite result */
export interface SuiteResult {
  entity: EntityType;
  confidence: number;
  /** Per-challenge breakdown */
  breakdown: ClassifyResult[];
}

/** Options passed to challenge generator */
export interface ChallengeOptions {
  /** Difficulty level (1-20, default 10) */
  difficulty?: number;
  /** Custom time limit override in ms */
  timeLimitMs?: number;
}

/** Legacy binary result (kept for backward compat) */
export interface VerifyResult {
  passed: boolean;
  ms?: number;
  reason?: string;
}

/** Interface that each challenge type must implement */
export interface ChallengeProvider {
  type: ChallengeType;
  /** Generate a new challenge */
  generate(options: ChallengeOptions): Challenge;
  /** Three-tier classification — returns signals + entity type */
  classify(challenge: Challenge, response: unknown, elapsedMs: number): ClassifyResult;
  /** Legacy binary verify (optional, derived from classify if absent) */
  verify?(challenge: Challenge, response: unknown): VerifyResult;
}
