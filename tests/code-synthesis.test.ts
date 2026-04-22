import { describe, it, expect } from 'vitest';
import { createChallenge, classify } from '../src/index.js';

describe('code-synthesis challenge', () => {
  it('creates a challenge with description and signature', () => {
    const ch = createChallenge('code-synthesis');
    const p = ch.payload as any;
    expect(p.description).toBeTruthy();
    expect(p.signature).toBeTruthy();
    expect(p.testCases).toBeInstanceOf(Array);
    expect(p.testCases.length).toBeGreaterThan(0);
  });

  it('does not leak expected outputs', () => {
    const ch = createChallenge('code-synthesis');
    const p = ch.payload as any;
    expect(p._expected).toBeUndefined();
    for (const tc of p.testCases) {
      expect(tc.expected).toBeUndefined();
    }
  });

  it('classifies non-string response as unclassified', () => {
    const ch = createChallenge('code-synthesis');
    const result = classify(ch.id, 42);
    expect(result.entity).toBe('unclassified');
  });

  it('classifies invalid function string', () => {
    const ch = createChallenge('code-synthesis');
    const result = classify(ch.id, 'not a function');
    expect(['computer', 'unclassified']).toContain(result.entity);
  });
});
