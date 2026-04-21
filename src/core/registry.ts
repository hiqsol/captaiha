import type { ChallengeType, ChallengeProvider } from '../types.js';

/** Registry of challenge providers — pluggable via register() */
const providers = new Map<ChallengeType, ChallengeProvider>();

export function register(provider: ChallengeProvider): void {
  providers.set(provider.type, provider);
}

export function getProvider(type: ChallengeType): ChallengeProvider {
  const provider = providers.get(type);
  if (!provider) {
    throw new Error(`Unknown challenge type: ${type}. Available: ${[...providers.keys()].join(', ')}`);
  }
  return provider;
}

export function listTypes(): ChallengeType[] {
  return [...providers.keys()];
}
