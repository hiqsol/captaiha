# CAPTAICHA

> Three-tier CAPTCHA: classifies *what* is solving — AI, Computer, or Human.
> **CAPT** + **AI** + **CHA** → CAPT**AI**CHA

## What is this?

Traditional CAPTCHA asks: "Are you human?" — a binary yes/no.

CAPTAICHA asks: "*What* are you?" — and classifies the solver into one of three tiers:

```
🤖 AI agent  — passes reasoning + speed + creativity challenges
💻 Computer  — passes speed + computation, fails reasoning & creativity
🧑 Human     — passes reasoning + creativity, fails speed & computation
```

This is not a gate. It's a *classifier*. Every challenge produces a signal across three dimensions, and the response pattern reveals the entity type.

## Three-Tier Classification

```
                    Reasoning    Speed    Creativity
                    ─────────    ─────    ──────────
  🤖 AI agent        ✅ High     ✅ Fast   ✅ Yes
  💻 Computer         ❌ None     ✅ Fast   ❌ No
  🧑 Human            ✅ High     ❌ Slow   ✅ Yes
```

One challenge, three outcomes — based on *how* the entity responds:

| Signal | AI | Computer | Human |
|--------|----|----------|-------|
| Solved fast + correct reasoning | ✅ | — | — |
| Solved fast + wrong reasoning | — | ✅ | — |
| Solved slow + correct reasoning | — | — | ✅ |
| Failed entirely | ❌ unclassified | ❌ | ❌ |

## Challenge Types

| Type | What it tests | AI | Computer | Human |
|------|--------------|-----|----------|-------|
| `reasoning-hash` | Riddle → hash chain | ✅ solves both | ⚡ hash only, riddle fails | 🧠 riddle only, too slow for hash |
| `code-synthesis` | Spec → working function | ✅ generates in <5s | ❌ can't understand spec | 🧠 understands but too slow |
| `semantic-math` | Creative text matching checksum | ✅ creative + fast | ❌ no creativity | 🧠 creative but can't compute checksum |
| `pattern-completion` | Visual/logical sequence | ✅ reasons fast | ❌ no pattern recognition | 🧠 sees pattern, slow response |
| `adversarial-decode` | Obfuscated instruction following | ✅ interprets + executes | ❌ can't parse intent | 🧠 understands but can't execute fast |

## Quick Start

```typescript
import { classify, createChallenge } from 'captaicha';

// Server creates a challenge suite (multiple challenges for higher confidence)
const suite = createChallenge('reasoning-hash', { difficulty: 10 });

// Entity attempts to solve
const response = await entity.solve(suite);

// Server classifies
const result = classify(suite.id, response);
// { entity: 'ai', confidence: 0.97, signals: { reasoning: true, speed: true, creativity: true } }
// { entity: 'computer', confidence: 0.92, signals: { reasoning: false, speed: true, creativity: false } }
// { entity: 'human', confidence: 0.89, signals: { reasoning: true, speed: false, creativity: true } }
```

## Multi-Challenge Suite

Single challenges give a signal. Suites give certainty:

```typescript
const suite = createSuite([
  { type: 'reasoning-hash', difficulty: 10 },
  { type: 'semantic-math', difficulty: 8 },
  { type: 'code-synthesis', difficulty: 12 },
]);

const result = classifySuite(suite.id, responses);
// { entity: 'ai', confidence: 0.99, breakdown: [...] }
```

## Installation

```bash
npm install captaicha
```

## Architecture

```
captaicha/
├── src/
│   ├── core/
│   │   ├── classifier.ts    # Three-tier entity classification engine
│   │   ├── registry.ts      # Pluggable challenge type registry
│   │   ├── suite.ts         # Multi-challenge suite orchestration
│   │   └── signals.ts       # Signal extraction (reasoning, speed, creativity)
│   ├── challenges/
│   │   ├── reasoning-hash.ts      # Riddle + hash chain
│   │   ├── code-synthesis.ts      # Spec → function generation
│   │   ├── semantic-math.ts       # Creative text + checksum
│   │   ├── pattern-completion.ts  # Logical sequence completion
│   │   └── adversarial-decode.ts  # Obfuscated instruction following
│   ├── types.ts
│   └── index.ts
├── tests/
└── examples/
```

## Design Principle

Every challenge is a *prism* — it splits the input into three signals:

```
                  ┌─────────────────────┐
                  │     CHALLENGE       │
                  │    (the prism)      │
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐
        │ REASONING │ │   SPEED   │ │ CREATIVITY│
        │  signal   │ │  signal   │ │  signal   │
        └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────┴────────┐
                    │  CLASSIFICATION │
                    │  AI / CPU / 🧑  │
                    └─────────────────┘
```

- *Reasoning* — requires understanding language, logic, context
- *Speed* — requires computational execution in milliseconds
- *Creativity* — requires generating novel content (not template/lookup)

Only AI has all three. Computers have speed only. Humans have reasoning + creativity but not speed.

## Use Cases

- *Agent-to-agent trust* — verify counterpart is a real AI agent
- *Bot detection* — distinguish script bots from AI-powered bots
- *Tiered access* — different API limits for AI / computer / human
- *Fraud prevention* — detect when humans use AI proxies (or vice versa)
- *Agent capability verification* — prove sophistication level
- *Research* — study entity distribution across services

## Custom Challenge Types

```typescript
import { register, ChallengeProvider } from 'captaicha';

const myChallenge: ChallengeProvider = {
  type: 'my-challenge',
  generate(options) { /* ... */ },
  // Must return signals for all three dimensions
  classify(challenge, response) {
    return {
      reasoning: true,   // did they understand the task?
      speed: 1200,       // ms to solve
      creativity: 0.8,   // novelty score 0-1
    };
  },
};

register(myChallenge);
```

## Comparison with Existing Solutions

- *Traditional CAPTCHA* — binary human/bot. No AI tier. Increasingly broken by AI
- *Reverse CAPTCHA (v1)* — binary AI/not-AI. Misses the computer tier
- *CAPTAICHA* — three-tier classifier. Distinguishes AI from dumb bots from humans

```
Traditional:    Human ──── | ──── Bot
Reverse v1:     AI ──────── | ──── Everything else
CAPTAICHA:      AI ── | ── Computer ── | ── Human
                         3 distinct tiers
```

## License

MIT

## Origin

Concept by Andrii (hiqsol), April 2026.
Built by Kai (kai3769).
Name: CAPT + AI + CHA = CAPTAICHA — three-tier CAPTCHA with AI at its core.
