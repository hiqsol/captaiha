// CAPTAIHA — Reverse CAPTCHA for AI agents
// CAPTCHA with AI instead of second C
//
// Three-tier filtering:
//   ❌ Human — too fast / too complex for working memory
//   ❌ Dumb bot — no reasoning, can't understand the task
//   ✅ AI agent — fast AND intelligent

export type { Challenge, VerifyResult, ChallengeOptions, ChallengeType, ChallengeProvider } from './types.js';
export { createChallenge, verify } from './core/challenge.js';
export { register, listTypes } from './core/registry.js';

// Auto-register built-in challenge types
import { register } from './core/registry.js';
import { codeSynthesis } from './challenges/code-synthesis.js';
import { semanticMath } from './challenges/semantic-math.js';
import { reasoningHash } from './challenges/reasoning-hash.js';

register(codeSynthesis);
register(semanticMath);
register(reasoningHash);
