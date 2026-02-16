import { it, describe, expect } from 'vitest';

import { generateTrackingNumber } from '../../src/utils/generateTrackingNumber.ts';

describe('generateTrackingNumber', () => {
  it('should generate a tracking number of 10 digits', () => {
    const trackingNumber = generateTrackingNumber(10);
    expect(String(trackingNumber)).toMatch(/^\d{10}$/);
  });
});
