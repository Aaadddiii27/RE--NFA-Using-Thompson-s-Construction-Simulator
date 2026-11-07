import { describe, expect, it } from 'vitest';
import { buildThompsonNFA } from '../algorithms/thompson';

describe("Thompson's construction", () => {
  it('builds an NFA for a symbol', () => {
    const { nfa } = buildThompsonNFA('a');
    expect(nfa.states).toHaveLength(2);
    expect(nfa.transitions).toHaveLength(1);
    expect(nfa.transitions[0].label).toBe('a');
  });

  it('uses epsilon transition for concatenation', () => {
    const { nfa } = buildThompsonNFA('ab');
    expect(nfa.transitions.some(t => t.label === '')).toBe(true);
  });

  it('creates four epsilon transitions for Kleene star', () => {
    const { nfa } = buildThompsonNFA('a*');
    expect(nfa.transitions.filter(t => t.label === '')).toHaveLength(4);
  });

  it('builds the agreed primary example', () => {
    const { nfa } = buildThompsonNFA('(a|b)*abb');
    expect(nfa.states).toHaveLength(14);
    expect(nfa.transitions).toHaveLength(16);
    expect(nfa.startState).toBe(6);
    expect(nfa.acceptState).toBe(13);
  });
});