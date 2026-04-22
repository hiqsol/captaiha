import { describe, it, expect } from 'vitest';
import { createChallenge, classify } from '../src/index.js';

describe('adversarial-decode challenge', () => {
  it('creates challenge with obfuscated instruction', () => {
    const ch = createChallenge('adversarial-decode');
    const p = ch.payload as any;
    expect(p.instruction).toBeTruthy();
    expect(typeof p.instruction).toBe('string');
  });

  it('does not leak expected answer', () => {
    const ch = createChallenge('adversarial-decode');
    const p = ch.payload as any;
    expect(p._expected).toBeUndefined();
    expect(p._hint).toBeUndefined();
  });

  it('classifies wrong answer', () => {
    const ch = createChallenge('adversarial-decode');
    const result = classify(ch.id, 'completely wrong');
    expect(['computer', 'unclassified']).toContain(result.entity);
  });
});
