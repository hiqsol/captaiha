import { describe, it, expect } from 'vitest';
import { createSuite, classifySuite } from '../src/core/suite.js';
import '../src/index.js'; // auto-register challenge types

describe('createSuite', () => {
  it('creates a suite with multiple challenges', () => {
    const suite = createSuite([
      { type: 'reasoning-hash', difficulty: 5 },
      { type: 'semantic-math', difficulty: 5 },
    ]);

    expect(suite.id).toMatch(/^suite-/);
    expect(suite.challenges).toHaveLength(2);
    expect(suite.challenges[0].type).toBe('reasoning-hash');
    expect(suite.challenges[1].type).toBe('semantic-math');
  });

  it('throws on empty config array', () => {
    expect(() => createSuite([])).toThrow('at least one challenge');
  });
});

describe('classifySuite', () => {
  it('returns unclassified when no responses provided', () => {
    const suite = createSuite([{ type: 'reasoning-hash', difficulty: 5 }]);
    const result = classifySuite(suite, {});

    expect(result.entity).toBe('unclassified');
    expect(result.confidence).toBe(0);
    expect(result.breakdown).toHaveLength(1);
  });

  it('classifies with object-style responses', () => {
    const suite = createSuite([{ type: 'reasoning-hash', difficulty: 5 }]);
    const challengeId = suite.challenges[0].id;

    // Provide some response (may be wrong, but classifySuite should handle it)
    const result = classifySuite(suite, { [challengeId]: { answer: 'test', hash: 'abc' } });

    expect(result.breakdown).toHaveLength(1);
    expect(['ai', 'computer', 'human', 'unclassified']).toContain(result.entity);
  });

  it('classifies with Map-style responses', () => {
    const suite = createSuite([{ type: 'semantic-math', difficulty: 5 }]);
    const challengeId = suite.challenges[0].id;

    const responses = new Map<string, unknown>();
    responses.set(challengeId, { text: 'hello world', checksum: 42 });

    const result = classifySuite(suite, responses);
    expect(result.breakdown).toHaveLength(1);
  });
});
