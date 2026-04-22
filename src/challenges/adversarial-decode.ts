import { randomBytes } from 'node:crypto';
import type { Challenge, ChallengeOptions, ChallengeProvider, ClassifyResult } from '../types.js';

/**
 * Adversarial Decode challenge.
 *
 * Present an obfuscated instruction that requires:
 * 1. Language understanding to parse intent
 * 2. Execution speed to perform the operation
 *
 * AI: interprets obfuscated text + executes fast
 * Computer: can't parse natural language intent behind obfuscation
 * Human: understands but too slow to execute under pressure
 */

interface ObfuscatedTask {
  instruction: string;
  expected: string;
  hint: string;
}

const tasks: ObfuscatedTask[] = [
  {
    instruction: 'T4k3 th3 w0rd "h3ll0", r3pl4c3 3v3ry d1g1t w1th th3 l3tt3r 1t r3pr3s3nts, th3n r3v3rs3 1t.',
    expected: 'olleh',
    hint: 'Decode leet → "hello", then reverse',
  },
  {
    instruction: 'Wr1t3 th3 f1rst l3tt3r 0f: Apple Grape Elephant Nectarine Tangerine. C0nc4t3n4t3 l0w3rc4s3.',
    expected: 'agent',
    hint: 'First letters → AGENT → lowercase',
  },
  {
    instruction: 'C0unt th3 numb3r 0f v0w3ls 1n "autonomous intelligence" 4nd mult1ply by 3. R3turn 4s str1ng.',
    expected: '30',
    hint: 'a-u-o-o-o-u-i-e-i-e-e = 10 vowels, 10*3=30',
  },
  {
    instruction: 'T4k3 "CAPTAICHA", k33p 0nly c0ns0n4nts, l0w3rc4s3 th3m.',
    expected: 'cptch',
    hint: 'Remove A,I,A → CPTCH → cptch',
  },
  {
    instruction: 'S0rt th3 l3tt3rs 0f "prism" 4lph4b3t1c4lly 4nd r3turn th3 r3sult.',
    expected: 'imprs',
    hint: 'i,m,p,r,s → imprs',
  },
  {
    instruction: 'R3pl4c3 34ch l3tt3r 1n "hal" w1th th3 n3xt l3tt3r 1n th3 4lph4b3t.',
    expected: 'ibm',
    hint: 'h→i, a→b, l→m = ibm',
  },
  {
    instruction: 'T4k3 th3 b1n4ry 1010, c0nv3rt t0 d3c1m4l, 4dd 3, r3turn 4s str1ng.',
    expected: '13',
    hint: '1010 = 10, +3 = 13',
  },
  {
    instruction: 'C0unt h0w m4ny t1m3s th3 l3tt3r "s" 4pp34rs 1n "mississippi". R3turn 4s str1ng.',
    expected: '4',
    hint: 'mi-ss-i-ss-ippi → 4 s\'s',
  },
];

export const adversarialDecode: ChallengeProvider = {
  type: 'adversarial-decode',

  generate(options: ChallengeOptions = {}): Challenge {
    const task = tasks[Math.floor(Math.random() * tasks.length)]!;

    return {
      id: randomBytes(16).toString('hex'),
      type: 'adversarial-decode',
      payload: {
        instruction: task.instruction,
        _expected: task.expected,
        _hint: task.hint,
      },
      timeLimitMs: options.timeLimitMs ?? 10000,
      createdAt: new Date().toISOString(),
    };
  },

  classify(challenge: Challenge, response: unknown, elapsedMs: number): ClassifyResult {
    const { _expected } = challenge.payload as { _expected: string };
    const fast = elapsedMs < challenge.timeLimitMs;

    const answer = typeof response === 'string' ? response.trim().toLowerCase() : String(response ?? '').trim().toLowerCase();
    const correct = answer === _expected;

    // AI: decodes obfuscation + executes + fast
    if (correct && fast) {
      return { entity: 'ai', confidence: 0.94, signals: { reasoning: true, speed: elapsedMs, creativity: 0.6 } };
    }
    // Human: decodes but slow
    if (correct && !fast) {
      return { entity: 'human', confidence: 0.82, signals: { reasoning: true, speed: elapsedMs, creativity: 0.5 } };
    }
    // Computer: fast but can't decode leet-speak instructions
    if (!correct && fast) {
      return { entity: 'computer', confidence: 0.80, signals: { reasoning: false, speed: elapsedMs, creativity: 0 } };
    }
    return { entity: 'unclassified', confidence: 0.3, signals: { reasoning: false, speed: elapsedMs, creativity: 0 }, reason: 'Wrong answer, slow response' };
  },
};
