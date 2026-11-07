import { describe, expect, it } from 'vitest';
import { buildThompsonNFA } from '../algorithms/thompson';
import { simulateNFA } from '../algorithms/simulator';

describe('epsilon-closure NFA simulation', () => {
  const nfa = buildThompsonNFA('(a|b)*abb').nfa;

  it.each(['abb', 'aabb', 'babb', 'abababb'])('accepts %s', input => {
    expect(simulateNFA(nfa, input).accepted).toBe(true);
  });

  it.each(['ab', 'abba', 'aab'])('rejects %s', input => {
    expect(simulateNFA(nfa, input).accepted).toBe(false);
  });
});