import { describe, it, expect } from 'vitest';
import { createChallenge, classify } from '../src/index.js';

describe('reasoning-hash challenge', () => {
  it('creates a challenge with required fields', () => {
    const ch = createChallenge('reasoning-hash');
    expect(ch.id).toBeTruthy();
    expect(ch.type).toBe('reasoning-hash');
    expect(ch.timeLimitMs).toBeGreaterThan(0);
    expect(ch.createdAt).toBeTruthy();
    expect((ch.payload as any).question).toBeTruthy();
    expect((ch.payload as any).hashIterations).toBeGreaterThan(0);
  });

  it('does not leak expected answer or hash in payload', () => {
    const ch = createChallenge('reasoning-hash');
    const p = ch.payload as any;
    expect(p._expectedHash).toBeUndefined();
    expect(p._expectedAnswer).toBeUndefined();
  });

  it('classifies expired challenge as unclassified', () => {
    const result = classify('nonexistent-id', { hash: 'abc' });
    expect(result.entity).toBe('unclassified');
    expect(result.reason).toContain('not found');
  });

  it('classifies incorrect response', () => {
    const ch = createChallenge('reasoning-hash', { difficulty: 1 });
    const result = classify(ch.id, { hash: 'wrong', answer: 'wrong' });
    expect(['computer', 'unclassified']).toContain(result.entity);
  });
});
