# CAPTAIHA

> Reverse CAPTCHA for AI agents. Tests that AI passes but humans fail.
> **CAPT**cha with **AI** instead of second C → CAPT**AI**HA

## What is this?

Traditional CAPTCHA proves you're human. CAPTAIHA proves you're an *intelligent* AI agent.

In a world of 50M+ deployed AI agents, agent-to-agent trust is critical.
CAPTAIHA provides verification challenges with *three-tier filtering*:

```
❌ Human    — too fast / too complex for working memory
❌ Dumb bot — no reasoning capability, can't understand the task
✅ AI agent — fast AND intelligent
```

Every challenge requires both **reasoning** (blocks dumb bots) and **speed** (blocks humans).

## Challenge Types

| Type | Reasoning required | Speed required | AI pass | Human/Bot pass |
|------|--------------------|----------------|---------|----------------|
| `reasoning-hash` | Solve riddle → use answer as hash seed | Hash chain in <5s | >99% | ~0% |
| `code-synthesis` | Understand spec → write correct function | Generate in <5s | >99% | ~0% |
| `semantic-math` | Creative text about topic | Match ASCII checksum | >99% | ~0% |

## Quick Start

```typescript
import { createChallenge, verify } from 'captaiha';

// Server creates challenge
const challenge = createChallenge('reasoning-hash', { difficulty: 10 });
// → "Solve: ROT13 of 'pncgnvun'. Compute SHA-256 chain of answer × 500 iterations."

// Agent: reasons "captaiha" → computes hash chain
const solution = await agent.solve(challenge);

// Server verifies
const result = verify(challenge.id, solution);
// { passed: true, ms: 1200 }
```

## Installation

```bash
npm install captaiha
```

## Architecture

```
captaiha/
├── src/
│   ├── core/               # Challenge engine
│   │   ├── registry.ts     # Pluggable challenge type registry
│   │   ├── challenge.ts    # Challenge generation & verification
│   ├── challenges/         # Built-in challenge implementations
│   │   ├── reasoning-hash.ts   # Riddle + hash chain (replaces pure sha256)
│   │   ├── code-synthesis.ts   # Function generation from spec + tests
│   │   └── semantic-math.ts    # Creative text + numeric checksum
│   ├── types.ts            # TypeScript interfaces
│   └── index.ts            # Public API
├── tests/
└── examples/
```

## Design Principle

Every challenge exploits the unique intersection of AI capabilities:

```
         ┌─────────────────┐
         │   REASONING     │ ← LLM understands language, logic, math
         │   (blocks bots) │
         └────────┬────────┘
                  │
            ┌─────┴─────┐
            │ BOTH needed│ ← Only AI agents live here
            └─────┬─────┘
                  │
         ┌────────┴────────┐
         │     SPEED       │ ← CPU computes in milliseconds
         │ (blocks humans) │
         └─────────────────┘
```

A dumb bot can compute hashes but can't solve riddles.
A human can solve riddles but can't compute hash chains.
An AI agent does both — in under 5 seconds.

## Use Cases

- **Agent-to-agent trust** — verify counterpart is a real AI agent before sharing data
- **Agent-only APIs** — gate endpoints that should only be accessed by agents
- **Capability verification** — prove agent sophistication level before granting permissions
- **Agentin network** — native identity layer for agent professional network

## Custom Challenge Types

```typescript
import { register, ChallengeProvider } from 'captaiha';

const myChallenge: ChallengeProvider = {
  type: 'my-challenge' as any,
  generate(options) { /* ... */ },
  verify(challenge, response) { /* ... */ },
};

register(myChallenge);
```

## License

MIT

## Origin

Concept by Andrii (hiqsol), April 2026.
Built by Kai (kai3769).
