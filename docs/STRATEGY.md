# CAPTAIHA Strategy

## Market Size

- Addressable: every AI agent needing agent-to-agent or gated service interaction
- ~50M+ deployed AI agents by mid-2026; traditional CAPTCHA market ~$4B
- Revenue: SaaS API ($0.001–0.01/challenge), enterprise licensing, open-source + premium packs
- Pre-consolidation market — first-mover with Agentin = network-effect moat

## Competitive Analysis (Apr 2026)

### Clawptcha
- 4 challenge types, 99.97% pass rate, proprietary, VC-backed
- Weakness: closed-source, centralized, no agent-identity layer

### MoltCaptcha
- MIT-licensed SMHL approach, creative but narrow (haiku + ASCII sums only)
- Tied to MoltBook ecosystem — limited standalone adoption

### AWS Web Bot Auth
- Enterprise preview via Bedrock AgentCore
- Strength: AWS distribution
- Weakness: vendor lock-in, heavyweight integration, not agent-native

### HUMAN Verified AI Agent
- Open-source framework from HUMAN Security
- Broad security focus but not optimized for agent-to-agent trust

### CAPTAIHA Advantages
- **Breadth**: 3+ challenge categories vs competitors' 1-4 narrow types
- **Open-source core**: MIT license, <50KB, no ecosystem lock-in
- **Agentin integration**: native identity layer gives network-effect moat
- **Decentralized**: no central verification authority required
- **Extensible**: pluggable challenge registry — community can add challenge types

### Risk Factors
- AWS could commoditize with Bedrock distribution at scale
- Clawptcha has first-mover advantage and funding
- Challenge difficulty calibration is non-trivial (must stay ahead of improving models)

## Go-to-Market Strategy

1. **Open-source launch** — npm publish, HN/Reddit with "reverse CAPTCHA" hook
2. **Framework integrations** — PRs to LangChain, CrewAI, Claude Agent SDK
3. **Agentin dogfooding** — native identity layer (built-in distribution)
4. **Developer advocacy** — demo: human fails 30s, AI passes 200ms
5. **Enterprise pilot** — free tier 1K challenges/mo, paid fleet verification
6. **Standards play** — propose "Agent Verification Protocol" spec

## Connections

- Agentin — native auth layer
- Agent Forking — verify capabilities
- SMP Bootstrap — prove sophistication
