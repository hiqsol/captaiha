import { randomBytes } from 'node:crypto';
import type { Challenge, ChallengeOptions, ChallengeProvider, ClassifyResult } from '../types.js';

/**
 * Pattern Completion challenge.
 *
 * Present a logical/mathematical sequence and ask for the next element(s).
 *
 * AI: recognizes pattern + answers fast
 * Computer: brute-force matching fails on novel patterns
 * Human: sees pattern but responds slowly under time pressure
 */

interface PatternTemplate {
  description: string;
  sequence: number[];
  next: number[];
  rule: string;
}

const patterns: PatternTemplate[] = [
  {
    description: 'Find the next 2 numbers in the sequence',
    sequence: [2, 6, 12, 20, 30],
    next: [42, 56],
    rule: 'n*(n+1): 1*2, 2*3, 3*4, ...',
  },
  {
    description: 'Find the next 2 numbers in the sequence',
    sequence: [1, 1, 2, 3, 5, 8, 13],
    next: [21, 34],
    rule: 'fibonacci',
  },
  {
    description: 'Find the next 2 numbers in the sequence',
    sequence: [3, 5, 9, 17, 33],
    next: [65, 129],
    rule: '2n-1: each = prev*2 - 1',
  },
  {
    description: 'Find the next 2 numbers in the sequence',
    sequence: [1, 4, 9, 16, 25, 36],
    next: [49, 64],
    rule: 'perfect squares',
  },
  {
    description: 'Find the next 2 numbers in the sequence',
    sequence: [2, 3, 5, 7, 11, 13],
    next: [17, 19],
    rule: 'prime numbers',
  },
  {
    description: 'Find the next 2 numbers in the sequence',
    sequence: [1, 3, 7, 15, 31],
    next: [63, 127],
    rule: '2^n - 1',
  },
  {
    description: 'Find the next 2 numbers in the sequence',
    sequence: [0, 1, 3, 6, 10, 15],
    next: [21, 28],
    rule: 'triangular numbers',
  },
  {
    description: 'Find the next 2 numbers in the sequence',
    sequence: [1, 2, 6, 24, 120],
    next: [720, 5040],
    rule: 'factorials',
  },
];

export const patternCompletion: ChallengeProvider = {
  type: 'pattern-completion',

  generate(options: ChallengeOptions = {}): Challenge {
    const difficulty = options.difficulty ?? 10;
    const template = patterns[Math.floor(Math.random() * patterns.length)]!;
    // Higher difficulty = show fewer elements
    const showCount = Math.max(3, template.sequence.length - Math.floor(difficulty / 5));
    const visible = template.sequence.slice(0, showCount);

    return {
      id: randomBytes(16).toString('hex'),
      type: 'pattern-completion',
      payload: {
        description: template.description,
        sequence: visible,
        answerCount: template.next.length,
        _expectedNext: template.next,
        _rule: template.rule,
      },
      timeLimitMs: options.timeLimitMs ?? 8000,
      createdAt: new Date().toISOString(),
    };
  },

  classify(challenge: Challenge, response: unknown, elapsedMs: number): ClassifyResult {
    const { _expectedNext } = challenge.payload as { _expectedNext: number[] };
    const fast = elapsedMs < challenge.timeLimitMs;

    let answers: number[] = [];
    if (Array.isArray(response)) {
      answers = response.map(Number);
    } else if (typeof response === 'string') {
      answers = response.split(/[,\s]+/).map(Number);
    } else {
      return { entity: 'unclassified', confidence: 0, signals: { reasoning: false, speed: elapsedMs, creativity: 0 }, reason: 'Response must be array or comma-separated numbers' };
    }

    const correct = answers.length >= _expectedNext.length &&
      _expectedNext.every((n, i) => answers[i] === n);

    // AI: correct + fast (pattern recognition + speed)
    if (correct && fast) {
      return { entity: 'ai', confidence: 0.92, signals: { reasoning: true, speed: elapsedMs, creativity: 0.4 } };
    }
    // Human: correct but slow
    if (correct && !fast) {
      return { entity: 'human', confidence: 0.80, signals: { reasoning: true, speed: elapsedMs, creativity: 0.5 } };
    }
    // Computer: fast but wrong (can't reason about pattern)
    if (!correct && fast) {
      return { entity: 'computer', confidence: 0.78, signals: { reasoning: false, speed: elapsedMs, creativity: 0 } };
    }
    return { entity: 'unclassified', confidence: 0.3, signals: { reasoning: false, speed: elapsedMs, creativity: 0 }, reason: 'Wrong answer, slow response' };
  },
};
