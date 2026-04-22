import { randomBytes } from 'node:crypto';
import type { Challenge, ChallengeOptions, ChallengeProvider, ClassifyResult } from '../types.js';

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

  classify(challenge: Challenge, response: unknown, elapsedMs: number): ClassifyResult {
    const { topic, wordCount, targetAsciiSum, tolerance } = challenge.payload as {
      topic: string; wordCount: number; targetAsciiSum: number; tolerance: number;
    };

    if (typeof response !== 'string') {
      return { entity: 'unclassified', confidence: 0, signals: { reasoning: false, speed: elapsedMs, creativity: 0 }, reason: 'Response must be a string' };
    }

    const text = response.trim();
    const words = text.split(/\s+/);
    const sum = asciiSum(text);
    const diff = Math.abs(sum - targetAsciiSum);

    const wordCountOk = words.length === wordCount;
    const checksumOk = diff <= tolerance;
    const topicRelevant = text.toLowerCase().includes(topic.toLowerCase());
    const fast = elapsedMs < challenge.timeLimitMs;

    // Creativity signal: topic relevance + not just repeating the topic word
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const creativityScore = topicRelevant ? Math.min(1, uniqueWords.size / words.length) : 0;

    // Three-tier:
    //   AI: creative text ✅ + correct checksum ✅ + fast ✅
    //   Computer: correct checksum but no creativity (gibberish to hit target)
    //   Human: creative text but can't hit checksum under time pressure
    if (wordCountOk && checksumOk && creativityScore > 0.5 && fast) {
      return { entity: 'ai', confidence: 0.93, signals: { reasoning: true, speed: elapsedMs, creativity: creativityScore } };
    }
    if (checksumOk && fast && creativityScore <= 0.3) {
      return { entity: 'computer', confidence: 0.82, signals: { reasoning: false, speed: elapsedMs, creativity: creativityScore } };
    }
    if (topicRelevant && creativityScore > 0.5 && (!checksumOk || !fast)) {
      return { entity: 'human', confidence: 0.78, signals: { reasoning: true, speed: elapsedMs, creativity: creativityScore } };
    }
    return { entity: 'unclassified', confidence: 0.3, signals: { reasoning: topicRelevant, speed: elapsedMs, creativity: creativityScore }, reason: 'Ambiguous signal pattern' };
  },
};
