import { describe, expect, it } from 'vitest';
import { queryClient } from './queryClient';

describe('queryClient', () => {
  it('does not retry failed queries automatically', () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
  });
});
