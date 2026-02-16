import { describe, it, expect } from 'vitest';

import generateRandomCode from '../../src/utils/generateRandomCode.ts';

describe('generateRandomCode', () => {
  it('should generate a random code of 5 digits', () => {
    const code = generateRandomCode();
    expect(code).toMatch(/^\d{1,5}$/);
  });
});
