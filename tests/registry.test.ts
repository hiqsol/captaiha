import { describe, it, expect } from 'vitest';
import { listTypes } from '../src/index.js';

describe('registry', () => {
  it('has built-in challenge types registered', () => {
    const types = listTypes();
    expect(types).toContain('reasoning-hash');
    expect(types).toContain('code-synthesis');
    expect(types).toContain('semantic-math');
  });

  it('returns at least 3 types', () => {
    expect(listTypes().length).toBeGreaterThanOrEqual(3);
  });
});
