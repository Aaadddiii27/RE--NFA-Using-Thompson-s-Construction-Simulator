import { describe, expect, it } from 'vitest';
import { insertConcatenation, validateRegex } from '../algorithms/validator';
import { toPostfix } from '../algorithms/parser';

describe('regular expression validation and parsing', () => {
  it('accepts the primary example', () => {
    expect(validateRegex('(a|b)*abb').valid).toBe(true);
  });

  it('rejects unmatched parentheses', () => {
    expect(validateRegex('(a|b').valid).toBe(false);
  });

  it('inserts explicit concatenation', () => {
    expect(insertConcatenation('(a|b)*abb')).toBe('(a|b)*.a.b.b');
  });

  it('converts the primary example to postfix', () => {
    expect(toPostfix('(a|b)*abb').postfix.join('')).toBe('ab|*a.b.b.');
  });

  it('handles concatenation with grouped expressions', () => {
    expect(toPostfix('a(b|c)').postfix.join('')).toBe('abc|.');
  });
});