import { describe, it, expect } from 'vitest';
import { createChallenge, classify } from '../src/index.js';

describe('pattern-completion challenge', () => {
  it('creates challenge with sequence', () => {
    const ch = createChallenge('pattern-completion');
    const p = ch.payload as any;
    expect(p.sequence).toBeInstanceOf(Array);
    expect(p.sequence.length).toBeGreaterThanOrEqual(3);
    expect(p.answerCount).toBeGreaterThan(0);
  });

  it('does not leak expected answers', () => {
    const ch = createChallenge('pattern-completion');
    const p = ch.payload as any;
    expect(p._expectedNext).toBeUndefined();
    expect(p._rule).toBeUndefined();
  });

  it('classifies wrong array answer', () => {
    const ch = createChallenge('pattern-completion');
    const result = classify(ch.id, [999, 888]);
    expect(['computer', 'unclassified']).toContain(result.entity);
  });

  it('classifies non-array response', () => {
    const ch = createChallenge('pattern-completion');
    const result = classify(ch.id, true);
    expect(result.entity).toBe('unclassified');
  });
});
