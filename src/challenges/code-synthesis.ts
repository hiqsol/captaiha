import { randomBytes } from 'node:crypto';
import type { Challenge, ChallengeOptions, ChallengeProvider, VerifyResult } from '../types.js';

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

  verify(challenge: Challenge, response: unknown): VerifyResult {
    const { _expected } = challenge.payload as { _expected: Array<{ input: unknown[]; expected: unknown }> };

    if (typeof response !== 'string') {
      return { passed: false, reason: 'Response must be a function string' };
    }

    try {
      // Sandbox: create function from response string
      const fn = new Function('return ' + response)();
      if (typeof fn !== 'function') {
        return { passed: false, reason: 'Response did not evaluate to a function' };
      }

      // Run test cases
      for (const tc of _expected) {
        const actual = fn(...tc.input);
        if (JSON.stringify(actual) !== JSON.stringify(tc.expected)) {
          return {
            passed: false,
            reason: `Test failed: input=${JSON.stringify(tc.input)} expected=${JSON.stringify(tc.expected)} got=${JSON.stringify(actual)}`,
          };
        }
      }

      return { passed: true };
    } catch (err) {
      return { passed: false, reason: `Execution error: ${(err as Error).message}` };
    }
  },
};
