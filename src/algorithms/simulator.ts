import type { NFA } from '../types/automata';

export function epsilonClosure(nfa: NFA, stateSet: Set<number>): Set<number> {
  const closure = new Set(stateSet);
  const stack = [...stateSet];

  while (stack.length) {
    const state = stack.pop()!;
    for (const transition of nfa.transitions) {
      if (transition.from === state && transition.label === '' && !closure.has(transition.to)) {
        closure.add(transition.to);
        stack.push(transition.to);
      }
    }
  }
  return closure;
}

export interface SimulationResult {
  accepted: boolean;
  trace: { step: number; symbol: string; states: number[] }[];
  finalStates: number[];
}

export function simulateNFA(nfa: NFA, input: string): SimulationResult {
  let current = epsilonClosure(nfa, new Set([nfa.startState]));
  const trace = [{ step: 0, symbol: 'ε-closure(start)', states: [...current].sort((a, b) => a - b) }];

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i];
    const moved = new Set<number>();
    for (const state of current) {
      for (const transition of nfa.transitions) {
        if (transition.from === state && transition.label === symbol) moved.add(transition.to);
      }
    }
    current = epsilonClosure(nfa, moved);
    trace.push({ step: i + 1, symbol, states: [...current].sort((a, b) => a - b) });
  }

  const finalStates = [...current].sort((a, b) => a - b);
  return { accepted: current.has(nfa.acceptState), trace, finalStates };
}