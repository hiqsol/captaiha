// CAPTAIHA — Reverse CAPTCHA for AI agents
// CAPTCHA with AI instead of second C

export type { Challenge, VerifyResult, ChallengeOptions, ChallengeType, ChallengeProvider } from './types.js';
export { createChallenge, verify } from './core/challenge.js';
export { register, listTypes } from './core/registry.js';

// Auto-register built-in challenge types
import { register } from './core/registry.js';
import { sha256Chain } from './challenges/sha256-chain.js';
import { codeSynthesis } from './challenges/code-synthesis.js';
import { semanticMath } from './challenges/semantic-math.js';

register(sha256Chain);
register(codeSynthesis);
register(semanticMath);
