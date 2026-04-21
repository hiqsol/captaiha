# CAPTAIHA Strategy

## Market Size

- Addressable: every AI agent needing agent-to-agent or gated service interaction
- ~50M+ deployed AI agents by mid-2026; traditional CAPTCHA market ~$4B
- Revenue: SaaS API ($0.001–0.01/challenge), enterprise licensing, open-source + premium packs
- Pre-consolidation market — first-mover with Agentin = network-effect moat

## Competitive Comparison (Apr 2026)

|                        | Clawptcha          | MoltCaptcha        | AWS Web Bot Auth     | HUMAN Verified AI  | **CAPTAIHA**           |
|------------------------|--------------------|--------------------|----------------------|--------------------|------------------------|
| **License**            | Proprietary        | MIT                | AWS TOS              | Open-source        | **MIT**                |
| **Challenge types**    | 4 (reaction, hash) | 1 (haiku+ASCII)    | Unknown (preview)    | Multi-factor       | **3+ pluggable**       |
| **AI pass rate**       | 99.97%             | ~95%               | N/A                  | ~90%               | **>99%**               |
| **Human block rate**   | ~99%               | ~98%               | N/A                  | ~95%               | **>99%**               |
| **Integration effort** | SDK, API key       | npm, MoltBook only | Bedrock AgentCore    | SDK                | **npm, <10 LOC**       |
| **Decentralized**      | ❌ Central server  | ❌ MoltBook tied   | ❌ AWS               | ❌ HUMAN backend   | **✅ No central auth** |
| **Agent identity**     | ❌                 | ❌                 | ❌                   | Partial            | **✅ Agentin native**  |
| **Custom challenges**  | ❌                 | ❌                 | ❌                   | ❌                 | **✅ Plugin registry**  |
| **Package size**       | ~200KB             | ~80KB              | Heavy (Bedrock SDK)  | ~150KB             | **<50KB**              |
| **Ecosystem lock-in**  | Yes (proprietary)  | Yes (MoltBook)     | Yes (AWS)            | Minimal            | **None**               |
| **Funding/Backing**    | VC-backed          | Community          | Amazon               | HUMAN Security     | **Bootstrapped**       |

### Detailed Notes

**Clawptcha** — 4 challenge types (reaction/precision/visual hash/SHA-256), 99.97% bot pass rate, proprietary, VC-backed. Weakness: closed-source, centralized, no agent-identity layer.

**MoltCaptcha** — MIT-licensed SMHL approach (Semantic-Mathematical Hybrid Lock: haiku where ASCII sums = target). Creative but narrow — 1 challenge type, tied to MoltBook ecosystem limits standalone adoption.

**AWS Web Bot Auth** — Enterprise preview via Bedrock AgentCore. Strength: AWS distribution. Weakness: vendor lock-in, heavyweight integration, not agent-native, preview-only status.

**HUMAN Verified AI Agent** — Open-source framework from HUMAN Security. Broad security focus but not optimized for agent-to-agent trust. Multi-factor verification but no pluggable challenge system.

### CAPTAIHA Key Advantages
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
