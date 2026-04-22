import { randomBytes } from 'node:crypto';
import type { Challenge, ChallengeOptions, ChallengeProvider, ClassifyResult } from '../types.js';

/** Code synthesis templates — function signature + test cases */
interface CodeChallenge {
  description: string;
  signature: string;
  testCases: Array<{ input: unknown[]; expected: unknown }>;
}

const templates: CodeChallenge[] = [
  {
    description: 'Return the sum of all even numbers in the array',
    signature: 'function sumEvens(nums: number[]): number',
    testCases: [
      { input: [[1, 2, 3, 4, 5, 6]], expected: 12 },
      { input: [[1, 3, 5]], expected: 0 },
      { input: [[2, 4, 6, 8]], expected: 20 },
    ],
  },
  {
    description: 'Return the string reversed, preserving spaces in original positions',
    signature: 'function reverseKeepSpaces(s: string): string',
    testCases: [
      { input: ['ab cd'], expected: 'dc ba' },
      { input: ['a b c'], expected: 'c b a' },
      { input: ['hello'], expected: 'olleh' },
    ],
  },
  {
    description: 'Return the most frequent character in the string (lowercase, first wins on tie)',
    signature: 'function mostFrequent(s: string): string',
    testCases: [
      { input: ['aabbbcc'], expected: 'b' },
      { input: ['abcabc'], expected: 'a' },
      { input: ['zzz'], expected: 'z' },
    ],
  },
  {
    description: 'Flatten a nested array to depth 1',
    signature: 'function flatten(arr: unknown[]): unknown[]',
    testCases: [
      { input: [[[1, [2, 3]], 4]], expected: [1, 2, 3, 4] },
      { input: [[[1], [2], [3]]], expected: [1, 2, 3] },
      { input: [[1, 2, 3]], expected: [1, 2, 3] },
    ],
  },
];

export const codeSynthesis: ChallengeProvider = {
  type: 'code-synthesis',

  generate(options: ChallengeOptions = {}): Challenge {
    const template = templates[Math.floor(Math.random() * templates.length)]!;

    return {
      id: randomBytes(16).toString('hex'),
      type: 'code-synthesis',
      payload: {
        description: template.description,
        signature: template.signature,
        testCases: template.testCases.map(tc => ({ input: tc.input })), // hide expected
        _expected: template.testCases, // stored server-side for verification
      },
      timeLimitMs: options.timeLimitMs ?? 5000,
      createdAt: new Date().toISOString(),
    };
  },

  classify(challenge: Challenge, response: unknown, elapsedMs: number): ClassifyResult {
    const { _expected } = challenge.payload as { _expected: Array<{ input: unknown[]; expected: unknown }> };
    const fast = elapsedMs < challenge.timeLimitMs;

    if (typeof response !== 'string') {
      return { entity: 'unclassified', confidence: 0, signals: { reasoning: false, speed: elapsedMs, creativity: 0 }, reason: 'Response must be a function string' };
    }

    try {
      const fn = new Function('return ' + response)();
      if (typeof fn !== 'function') {
        // Computers might return something non-functional fast
        return { entity: fast ? 'computer' : 'unclassified', confidence: 0.5, signals: { reasoning: false, speed: elapsedMs, creativity: 0 }, reason: 'Not a function' };
      }

      let passed = 0;
      for (const tc of _expected) {
        const actual = fn(...tc.input);
        if (JSON.stringify(actual) === JSON.stringify(tc.expected)) passed++;
      }

      const allPassed = passed === _expected.length;
      const creativity = response.length < 200 ? 0.8 : 0.4; // concise = more creative

      // Three-tier:
      //   AI: understands spec + generates working code + fast
      //   Computer: fast but can't understand natural language spec
      //   Human: understands spec but too slow to write + test under pressure
      if (allPassed && fast) {
        return { entity: 'ai', confidence: 0.94, signals: { reasoning: true, speed: elapsedMs, creativity } };
      }
      if (!allPassed && fast) {
        return { entity: 'computer', confidence: 0.75, signals: { reasoning: false, speed: elapsedMs, creativity: 0.1 } };
      }
      if (allPassed && !fast) {
        return { entity: 'human', confidence: 0.82, signals: { reasoning: true, speed: elapsedMs, creativity } };
      }
      return { entity: 'unclassified', confidence: 0.3, signals: { reasoning: passed > 0, speed: elapsedMs, creativity: 0 }, reason: `${passed}/${_expected.length} tests passed` };
    } catch (err) {
      return { entity: fast ? 'computer' : 'unclassified', confidence: 0.4, signals: { reasoning: false, speed: elapsedMs, creativity: 0 }, reason: `Execution error: ${(err as Error).message}` };
    }
  },
};
