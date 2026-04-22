import type { Challenge, ChallengeType, ChallengeOptions, ClassifyResult, VerifyResult } from '../types.js';
import { getProvider } from './registry.js';

/** Pending challenges awaiting classification (in-memory, TTL-based) */
const pending = new Map<string, { challenge: Challenge; issuedAt: number }>();

/** Create a new challenge of the given type */
export function createChallenge(type: ChallengeType, options: ChallengeOptions = {}): Challenge {
  const provider = getProvider(type);
  const challenge = provider.generate(options);

  const ttl = challenge.timeLimitMs * 2;
  pending.set(challenge.id, { challenge, issuedAt: Date.now() });

  setTimeout(() => pending.delete(challenge.id), ttl);

  // Strip internal fields from returned challenge (don't leak answers)
  const { id, type: t, payload, timeLimitMs, createdAt } = challenge;
  const safePayload = Object.fromEntries(
    Object.entries(payload as Record<string, unknown>).filter(([k]) => !k.startsWith('_'))
  );
  return { id, type: t, payload: safePayload, timeLimitMs, createdAt };
}

/** Three-tier classify — the core CAPTAICHA operation */
export function classify(challengeId: string, response: unknown): ClassifyResult {
  const entry = pending.get(challengeId);
  if (!entry) {
    return { entity: 'unclassified', confidence: 0, signals: { reasoning: false, speed: Infinity, creativity: 0 }, reason: 'Challenge not found or expired' };
  }

  const { challenge, issuedAt } = entry;
  const elapsed = Date.now() - issuedAt;

  const provider = getProvider(challenge.type);
  const result = provider.classify(challenge, response, elapsed);
  result.ms = elapsed;

  pending.delete(challengeId);
  return result;
}

/** Legacy binary verify (delegates to classify) */
export function verify(challengeId: string, response: unknown): VerifyResult {
  const result = classify(challengeId, response);
  return {
    passed: result.entity === 'ai',
    ms: result.ms,
    reason: result.entity === 'ai' ? undefined : `Classified as ${result.entity} (confidence: ${result.confidence})`,
  };
}
