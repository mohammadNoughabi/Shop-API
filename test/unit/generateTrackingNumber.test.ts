import { it, describe, expect } from 'vitest';

import { generateTrackingNumber } from '../../src/utils/generateTrackingNumber.ts';

describe('generateTrackingNumber', () => {
  it('should generate a tracking number of 10 digits', () => {
    const trackingNumber = generateTrackingNumber(10);
    const trackingNumberStr = trackingNumber.toString().padStart(10, '0'); // Ensure it's 10 digits with leading zeros if necessary

    expect(trackingNumberStr).toHaveLength(10);
    expect(trackingNumberStr).toMatch(/^\d+$/); // Ensure it's all digits
  });
});
