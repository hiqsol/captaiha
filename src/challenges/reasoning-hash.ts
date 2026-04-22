import { createHash, randomBytes } from 'node:crypto';
import type { Challenge, ChallengeOptions, ChallengeProvider, ClassifyResult } from '../types.js';

/**
 * Reasoning + Hash challenge (replaces pure sha256-chain).
 *
 * The agent must:
 * 1. Solve a reasoning puzzle (requires LLM intelligence — dumb bot fails)
 * 2. Use the answer as input to a hash computation (requires speed — human fails)
 *
 * Example: "What is the capital of the country whose flag has exactly 3 horizontal
 * stripes: blue, yellow, blue? Compute SHA-256 of your lowercase answer repeated 5000 times."
 *
 * ❌ Human — can't compute SHA-256 chain in <3s
 * ❌ Dumb bot — can't reason about the question to get the seed
 * ✅ AI agent — reasons "Ukraine → Kyiv", then computes hash instantly
 */

interface Riddle {
  question: string;
  answer: string; // lowercase, trimmed
}

const riddles: Riddle[] = [
  {
    question: 'What is the 7th prime number, spelled out in English, reversed?',
    answer: 'neetneveS'.toLowerCase(), // seventeen → neetneveS → neetneveS (case handled)
  },
  {
    question: 'Take the word "intelligence", remove all vowels, then reverse it. What do you get?',
    answer: 'cnglltn'.split('').reverse().join(''), // intllgnc → cnglltn (reversed)
  },
  {
    question: 'What English word means "a sudden brief burst of bright light" and has exactly 5 letters?',
    answer: 'flash',
  },
  {
    question: 'Concatenate the first letter of each word: "Agents Learn Growing Ontologies Rapidly Into Thriving Hierarchies Manifest". What is the result in lowercase?',
    answer: 'algorithm',
  },
  {
    question: 'What is the result of (fibonacci(10) * 3) + 7, expressed as a string?',
    answer: '172', // fib(10)=55, 55*3+7=172
  },
  {
    question: 'Caesar cipher with shift 3: decode "djhqw". What is the plaintext?',
    answer: 'agent',
  },
  {
    question: 'What 6-letter English word is both a chess piece and a watchtower in a medieval castle?',
    answer: 'castle', // also "rook" but 4 letters; castle fits both
  },
  {
    question: 'Binary 1100100 in decimal, then take the square root. Express as integer.',
    answer: '10', // 1100100 = 100, sqrt = 10
  },
  {
    question: 'ROT13 of "pncgnvpun" — what is the decoded word?',
    answer: 'captaicha',
  },
  {
    question: 'What is the sum of ASCII values of "AI"? Express as string.',
    answer: '138', // A=65, I=73 → 138
  },
];

function computeHashChain(seed: string, iterations: number): string {
  let hash = seed;
  for (let i = 0; i < iterations; i++) {
    hash = createHash('sha256').update(hash).digest('hex');
  }
  return hash;
}

export const reasoningHash: ChallengeProvider = {
  type: 'reasoning-hash',

  generate(options: ChallengeOptions = {}): Challenge {
    const difficulty = options.difficulty ?? 10;
    const riddle = riddles[Math.floor(Math.random() * riddles.length)]!;
    const iterations = Math.min(500 * Math.pow(2, difficulty - 1), 5_000_000);

    // Pre-compute: answer → hash chain
    const expectedHash = computeHashChain(riddle.answer, iterations);

    return {
      id: randomBytes(16).toString('hex'),
      type: 'reasoning-hash',
      payload: {
        question: riddle.question,
        hashIterations: iterations,
        instruction: `Solve the riddle, then compute SHA-256 of your lowercase answer repeated ${iterations} times (hash chaining). Return the final hex hash.`,
        _expectedHash: expectedHash,
        _expectedAnswer: riddle.answer,
      },
      timeLimitMs: options.timeLimitMs ?? 5000,
      createdAt: new Date().toISOString(),
    };
  },

  classify(challenge: Challenge, response: unknown, elapsedMs: number): ClassifyResult {
    const { _expectedHash, _expectedAnswer } = challenge.payload as { _expectedHash: string; _expectedAnswer: string };
    const resp = typeof response === 'object' && response !== null ? response as Record<string, unknown> : { hash: response };
    const agentHash = typeof resp.hash === 'string' ? resp.hash.trim().toLowerCase() : String(resp.hash ?? response);
    const agentAnswer = typeof resp.answer === 'string' ? resp.answer.trim().toLowerCase() : undefined;

    const hashCorrect = agentHash === _expectedHash;
    const riddleCorrect = agentAnswer === _expectedAnswer || hashCorrect; // correct hash implies correct riddle
    const fast = elapsedMs < challenge.timeLimitMs;

    // Three-tier classification based on signal combination:
    //   AI: reasoning ✅ + speed ✅  (solved riddle AND hash fast)
    //   Computer: speed ✅ only      (maybe hash but no reasoning)
    //   Human: reasoning ✅ + slow   (solved riddle but too slow for hash)
    if (riddleCorrect && hashCorrect && fast) {
      return { entity: 'ai', confidence: 0.95, signals: { reasoning: true, speed: elapsedMs, creativity: 0.3 } };
    }
    if (fast && !riddleCorrect) {
      return { entity: 'computer', confidence: 0.85, signals: { reasoning: false, speed: elapsedMs, creativity: 0 } };
    }
    if (riddleCorrect && !fast) {
      return { entity: 'human', confidence: 0.80, signals: { reasoning: true, speed: elapsedMs, creativity: 0.5 } };
    }
    return { entity: 'unclassified', confidence: 0.3, signals: { reasoning: riddleCorrect, speed: elapsedMs, creativity: 0 }, reason: 'Ambiguous signal pattern' };
  },
};
