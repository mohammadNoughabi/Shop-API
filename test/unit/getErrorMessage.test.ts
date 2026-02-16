import { describe, it, expect } from 'vitest';

import { getErrorMessage } from '../../src/utils/getErrorMessage.ts';

describe('getErrorMessage', () => {
  it('should return the message of an Error object', () => {
    const error = new Error('This is an error message');
    const message = getErrorMessage(error);
    expect(message).toBe('This is an error message');
  });
  it('should return the string representation of a non-Error object', () => {
    const error = { code: 404, message: 'Not Found' };
    const message = getErrorMessage(error);
    expect(message).toBe('[object Object]');
  });
  it('should return the string representation of a primitive value', () => {
    const error = 42;
    const message = getErrorMessage(error);
    expect(message).toBe('42');
  });
  it('should return the string representation of null', () => {
    const error = null;
    const message = getErrorMessage(error);
    expect(message).toBe('null');
  });
  it('should return the string representation of undefined', () => {
    const error = undefined;
    const message = getErrorMessage(error);
    expect(message).toBe('undefined');
  });
});
