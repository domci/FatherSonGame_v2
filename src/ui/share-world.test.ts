import { describe, expect, it } from 'vitest';
import { codeInHash, worldLink } from './share-world';

describe('world links (share a world)', () => {
  it('puts the world code in the address and reads it back', () => {
    const link = worldLink('AB12CD', 'https://crashlanded.dom-builds.com');
    expect(link).toBe('https://crashlanded.dom-builds.com/#welt=AB12CD');
    expect(codeInHash(new URL(link).hash)).toBe('AB12CD');
    expect(codeInHash('#welt=ab12cd')).toBe('AB12CD');
  });

  it('ignores other addresses', () => {
    expect(codeInHash('')).toBeUndefined();
    expect(codeInHash('#eltern')).toBeUndefined();
    expect(codeInHash('#welt=ABC')).toBeUndefined();
    expect(codeInHash('#welt=ABC123<script>')).toBeUndefined();
  });
});
