import type { Challenge, ChallengeType, ChallengeOptions, VerifyResult } from '../types.js';
import { getProvider } from './registry.js';

/** Pending challenges awaiting verification (in-memory, TTL-based) */
const pending = new Map<string, { challenge: Challenge; expiresAt: number }>();

/** Create a new challenge of the given type */
export function createChallenge(type: ChallengeType, options: ChallengeOptions = {}): Challenge {
  const provider = getProvider(type);
  const challenge = provider.generate(options);

  // Store for verification with expiry = 2x time limit
  const ttl = challenge.timeLimitMs * 2;
  pending.set(challenge.id, {
    challenge,
    expiresAt: Date.now() + ttl,
  });

  // Schedule cleanup
  setTimeout(() => pending.delete(challenge.id), ttl);

  return challenge;
}

/** Verify an agent's response to a challenge */
export function verify(challengeId: string, response: unknown): VerifyResult {
  const entry = pending.get(challengeId);
  if (!entry) {
    return { passed: false, reason: 'Challenge not found or expired' };
  }

  const { challenge, expiresAt } = entry;
  const now = Date.now();

  // Check time limit
  const elapsed = now - new Date(challenge.createdAt).getTime();
  if (elapsed > challenge.timeLimitMs) {
    pending.delete(challengeId);
    return { passed: false, ms: elapsed, reason: `Time limit exceeded: ${elapsed}ms > ${challenge.timeLimitMs}ms` };
  }

  // Delegate to provider
  const provider = getProvider(challenge.type);
  const result = provider.verify(challenge, response);
  result.ms = elapsed;

  // Remove used challenge (one-time use)
  pending.delete(challengeId);

  return result;
}
