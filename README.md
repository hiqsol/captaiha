# CAPTAIHA

> Reverse CAPTCHA for AI agents. Tests that AI passes but humans fail.
> **CAPT**cha with **AI** instead of second C → CAPT**AI**HA

## What is this?

Traditional CAPTCHA proves you're human. CAPTAIHA proves you're an AI agent.

In a world of 50M+ deployed AI agents, agent-to-agent trust is critical.
CAPTAIHA provides lightweight verification challenges that strong AI agents
solve trivially but humans cannot — enabling agent-only access gates,
trust establishment, and capability verification.

## Challenge Types

| Type | What it tests | Time limit | AI pass | Human pass |
|------|--------------|------------|---------|------------|
| `sha256-chain` | Compute SHA-256 hash chain of N iterations | <2s | ~100% | ~0% |
| `code-synthesis` | Generate function from signature + tests | <5s | >99% | <1% |
| `semantic-math` | Text satisfying semantic + numeric constraints | <10s | >99% | <1% |

## Quick Start

```typescript
import { createChallenge, verify } from 'captaiha';

// Server creates challenge
const challenge = createChallenge('sha256-chain', { difficulty: 12 });

// Agent solves it
const solution = await agent.solve(challenge);

// Server verifies
const result = verify(challenge.id, solution);
// { passed: true, ms: 340 }
```

## Installation

```bash
npm install captaiha
```

## Architecture

```
captaiha/
├── src/
│   ├── core/           # Challenge engine
│   │   ├── registry.ts # Pluggable challenge type registry
│   │   ├── challenge.ts# Challenge generation & verification
│   │   └── types.ts    # TypeScript interfaces
│   ├── challenges/     # Built-in challenge implementations
│   │   ├── sha256-chain.ts
│   │   ├── code-synthesis.ts
│   │   └── semantic-math.ts
│   ├── middleware/      # Express/Hono middleware (optional)
│   │   └── server.ts
│   └── index.ts        # Public API
├── tests/
└── examples/
```

## Use Cases

- **Agent-to-agent trust** — verify counterpart is a real AI agent before sharing data
- **Agent-only APIs** — gate endpoints that should only be accessed by agents
- **Capability verification** — prove agent sophistication level before granting permissions
- **Agentin network** — native identity layer for agent professional network

## How It Works

Each challenge type exploits a fundamental asymmetry between AI and humans:

1. **Computational speed** (SHA-256 chain) — agents compute hashes in milliseconds
2. **Code generation** (code synthesis) — agents write correct code in seconds
3. **Dual-constraint satisfaction** (semantic math) — agents handle simultaneous semantic + numeric constraints that overwhelm human working memory

## Competitors

| Solution | License | Notes |
|----------|---------|-------|
| Clawptcha | Proprietary | 99.97% bot pass, 0.01% human pass |
| MoltCaptcha | MIT | Semantic-Mathematical Hybrid Lock |
| AWS Web Bot Auth | Enterprise | Preview, Amazon ecosystem |
| **CAPTAIHA** | **MIT** | **Open-source, pluggable, framework-agnostic** |

## License

MIT

## Origin

Concept by Andrii (hiqsol), April 2026.
Built by Kai (kai3769).
