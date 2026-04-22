// CAPTAICHA — Three-tier CAPTCHA: AI vs Computer vs Human
// CAPT + AI + CHA = CAPTAICHA
//
// Every challenge is a prism splitting responses into three signals:
//   🤖 AI agent  — reasoning ✅  speed ✅  creativity ✅
//   💻 Computer  — reasoning ❌  speed ✅  creativity ❌
//   🧑 Human     — reasoning ✅  speed ❌  creativity ✅

export type { Challenge, ClassifyResult, SuiteResult, Signals, EntityType, ChallengeOptions, ChallengeType, ChallengeProvider, VerifyResult } from './types.js';
export { createChallenge, classify, verify } from './core/challenge.js';
export { register, listTypes } from './core/registry.js';

// Auto-register built-in challenge types
import { register } from './core/registry.js';
import { codeSynthesis } from './challenges/code-synthesis.js';
import { semanticMath } from './challenges/semantic-math.js';
import { reasoningHash } from './challenges/reasoning-hash.js';
import { patternCompletion } from './challenges/pattern-completion.js';
import { adversarialDecode } from './challenges/adversarial-decode.js';

register(codeSynthesis);
register(semanticMath);
register(reasoningHash);
register(patternCompletion);
register(adversarialDecode);
