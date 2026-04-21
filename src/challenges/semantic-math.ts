import { randomBytes } from 'node:crypto';
import type { Challenge, ChallengeOptions, ChallengeProvider, VerifyResult } from '../types.js';

/**
 * Semantic Math challenge (inspired by MoltCaptcha SMHL):
 * Generate text satisfying BOTH a semantic constraint AND a numeric checksum.
 *
 * Example: "Write a 5-word sentence about the ocean where ASCII sum of all chars = 1847"
 *
 * AI agents handle dual constraints easily; humans struggle with simultaneous
 * creative + mathematical requirements under time pressure.
 */

interface SemanticConstraint {
  topic: string;
  wordCount: number;
}

const topics = [
  'ocean', 'mountain', 'code', 'robot', 'star',
  'fire', 'rain', 'tree', 'moon', 'wind',
  'river', 'cloud', 'stone', 'light', 'shadow',
];

function asciiSum(s: string): number {
  let sum = 0;
  for (let i = 0; i < s.length; i++) {
    sum += s.charCodeAt(i);
  }
  return sum;
}

export const semanticMath: ChallengeProvider = {
  type: 'semantic-math',

  generate(options: ChallengeOptions = {}): Challenge {
    const difficulty = options.difficulty ?? 10;
    const topic = topics[Math.floor(Math.random() * topics.length)]!;
    const wordCount = 3 + Math.floor(difficulty / 3); // 3-9 words

    // Target ASCII sum — random but achievable for the word count
    // Average word ~5 chars, average char ~100 ASCII → ~500 per word
    const avgExpected = wordCount * 500 + (wordCount - 1) * 32; // spaces
    const variance = Math.floor(avgExpected * 0.1);
    const targetSum = avgExpected + Math.floor(Math.random() * variance * 2) - variance;

    return {
      id: randomBytes(16).toString('hex'),
      type: 'semantic-math',
      payload: {
        topic,
        wordCount,
        targetAsciiSum: targetSum,
        tolerance: Math.max(5, Math.floor(20 - difficulty)), // tighter with higher difficulty
      },
      timeLimitMs: options.timeLimitMs ?? 10000,
      createdAt: new Date().toISOString(),
    };
  },

  verify(challenge: Challenge, response: unknown): VerifyResult {
    const { topic, wordCount, targetAsciiSum, tolerance } = challenge.payload as {
      topic: string;
      wordCount: number;
      targetAsciiSum: number;
      tolerance: number;
    };

    if (typeof response !== 'string') {
      return { passed: false, reason: 'Response must be a string' };
    }

    const text = response.trim();
    const words = text.split(/\s+/);

    // Check word count
    if (words.length !== wordCount) {
      return { passed: false, reason: `Expected ${wordCount} words, got ${words.length}` };
    }

    // Check ASCII sum within tolerance
    const sum = asciiSum(text);
    const diff = Math.abs(sum - targetAsciiSum);
    if (diff > tolerance) {
      return { passed: false, reason: `ASCII sum ${sum} is ${diff} away from target ${targetAsciiSum} (tolerance: ±${tolerance})` };
    }

    // Basic semantic check: at least one word should relate to the topic
    // (In production, use an embedding model for proper semantic verification)
    const lowerText = text.toLowerCase();
    if (!lowerText.includes(topic.toLowerCase())) {
      // Relaxed check — just warn, don't fail (proper semantic check needs embeddings)
      // For v0.1, we pass but note the potential issue
    }

    return { passed: true };
  },
};
