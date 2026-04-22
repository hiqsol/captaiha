import { describe, it, expect } from 'vitest';
import { createChallenge, classify, verify } from '../src/index.js';

describe('core API', () => {
  it('verify() returns passed:false for wrong response', () => {
    const ch = createChallenge('reasoning-hash', { difficulty: 1 });
    const result = verify(ch.id, { hash: 'wrong' });
    expect(result.passed).toBe(false);
    expect(result.reason).toBeTruthy();
  });

  it('challenge id is consumed after classify', () => {
    const ch = createChallenge('reasoning-hash', { difficulty: 1 });
    classify(ch.id, { hash: 'first' });
    const second = classify(ch.id, { hash: 'second' });
    expect(second.entity).toBe('unclassified');
    expect(second.reason).toContain('not found');
  });

  it('createChallenge throws for unknown type', () => {
    expect(() => createChallenge('unknown-type' as any)).toThrow('Unknown challenge type');
  });
});
