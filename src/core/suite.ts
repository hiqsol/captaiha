import type { ChallengeType, ChallengeOptions, Challenge, ClassifyResult, SuiteResult, EntityType } from '../types.js';
import { createChallenge, classify } from './challenge.js';

/** Suite definition — array of challenge configs */
export interface SuiteConfig {
  type: ChallengeType;
  difficulty?: number;
  timeLimitMs?: number;
}

/** A created suite with challenges ready to solve */
export interface Suite {
  id: string;
  challenges: Challenge[];
  createdAt: string;
}

/** Create a multi-challenge suite for higher classification confidence */
export function createSuite(configs: SuiteConfig[]): Suite {
  if (configs.length === 0) {
    throw new Error('Suite must contain at least one challenge');
  }

  const challenges = configs.map((cfg) =>
    createChallenge(cfg.type, {
      difficulty: cfg.difficulty,
      timeLimitMs: cfg.timeLimitMs,
    } as ChallengeOptions),
  );

  return {
    id: `suite-${crypto.randomUUID()}`,
    challenges,
    createdAt: new Date().toISOString(),
  };
}

/** Classify a suite of responses — majority vote with weighted confidence */
export function classifySuite(
  suite: Suite,
  responses: Map<string, unknown> | Record<string, unknown>,
): SuiteResult {
  const responseMap = responses instanceof Map ? responses : new Map(Object.entries(responses));

  const breakdown: ClassifyResult[] = suite.challenges.map((ch) => {
    const response = responseMap.get(ch.id);
    if (response === undefined) {
      return {
        entity: 'unclassified' as EntityType,
        confidence: 0,
        signals: { reasoning: false, speed: Infinity, creativity: 0 },
        reason: 'No response provided',
      };
    }
    return classify(ch.id, response);
  });

  // Weighted vote: each result contributes its confidence to its entity type
  const votes: Record<EntityType, number> = { ai: 0, computer: 0, human: 0, unclassified: 0 };
  for (const r of breakdown) {
    votes[r.entity] += r.confidence;
  }

  // Winner = highest weighted vote
  const sorted = Object.entries(votes)
    .filter(([k]) => k !== 'unclassified')
    .sort(([, a], [, b]) => b - a);

  const totalClassified = breakdown.filter((r) => r.entity !== 'unclassified').length;

  if (totalClassified === 0) {
    return { entity: 'unclassified', confidence: 0, breakdown };
  }

  const [winner, winnerScore] = sorted[0];
  const totalScore = sorted.reduce((sum, [, v]) => sum + v, 0);
  const confidence = totalScore > 0 ? winnerScore / totalScore : 0;

  return {
    entity: winner as EntityType,
    confidence: Math.round(confidence * 100) / 100,
    breakdown,
  };
}
