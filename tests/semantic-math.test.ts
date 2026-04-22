import { describe, it, expect } from 'vitest';
import { createChallenge, classify } from '../src/index.js';

describe('semantic-math challenge', () => {
  it('creates a challenge with topic and target sum', () => {
    const ch = createChallenge('semantic-math');
    const p = ch.payload as any;
    expect(p.topic).toBeTruthy();
    expect(p.wordCount).toBeGreaterThanOrEqual(3);
    expect(p.targetAsciiSum).toBeGreaterThan(0);
    expect(p.tolerance).toBeGreaterThan(0);
  });

  it('classifies non-string response', () => {
    const ch = createChallenge('semantic-math');
    const result = classify(ch.id, 123);
    expect(result.entity).toBe('unclassified');
  });

  it('classifies gibberish as computer or unclassified', () => {
    const ch = createChallenge('semantic-math');
    const result = classify(ch.id, 'aaaa bbbb cccc');
    expect(['computer', 'unclassified']).toContain(result.entity);
  });
});
