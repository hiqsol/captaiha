import { createHash, randomBytes } from 'node:crypto';
import type { Challenge, ChallengeOptions, ChallengeProvider, VerifyResult } from '../types.js';

/** SHA-256 chain: compute N iterations of hash chaining. Trivial for CPU, impossible manually. */
export const sha256Chain: ChallengeProvider = {
  type: 'sha256-chain',

  generate(options: ChallengeOptions = {}): Challenge {
    const difficulty = options.difficulty ?? 10;
    // iterations scale with difficulty: 1000 * 2^(difficulty-1)
    const iterations = Math.min(1000 * Math.pow(2, difficulty - 1), 10_000_000);
    const seed = randomBytes(32).toString('hex');

    // Pre-compute expected answer
    let hash = seed;
    for (let i = 0; i < iterations; i++) {
      hash = createHash('sha256').update(hash).digest('hex');
    }

    return {
      id: randomBytes(16).toString('hex'),
      type: 'sha256-chain',
      payload: { seed, iterations, expectedHash: hash },
      timeLimitMs: options.timeLimitMs ?? 2000,
      createdAt: new Date().toISOString(),
    };
  },

  verify(challenge: Challenge, response: unknown): VerifyResult {
    const { expectedHash } = challenge.payload as { expectedHash: string };
    const agentHash = typeof response === 'string' ? response : String(response);

    if (agentHash.toLowerCase() === expectedHash.toLowerCase()) {
      return { passed: true };
    }
    return { passed: false, reason: 'Hash mismatch' };
  },
};
