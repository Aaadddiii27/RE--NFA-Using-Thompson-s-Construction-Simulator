import type { ConstructionStep, NFA, Transition } from '../types/automata';
import { toPostfix } from './parser';

interface Fragment {
  start: number;
  end: number;
  label: string;
}

export interface ThompsonResult {
  nfa: NFA;
  steps: ConstructionStep[];
  postfix: string;
  withConcat: string;
}

export function buildThompsonNFA(expression: string): ThompsonResult {
  const parsed = toPostfix(expression);
  const stack: Fragment[] = [];
  const states: number[] = [];
  const transitions: Transition[] = [];
  const alphabet = new Set<string>();
  const steps: ConstructionStep[] = [];
  let nextState = 0;

  const newState = () => {
    const id = nextState++;
    states.push(id);
    return id;
  };

  const record = (token: string, operation: string, explanation: string, added: Transition[]) => {
    steps.push({
      id: steps.length + 1,
      token,
      operation,
      explanation,
      stack: stack.map(fragment => `${fragment.label} (q${fragment.start} → q${fragment.end})`),
      transitionsAdded: added
    });
  };

  for (const token of parsed.postfix) {
    if (!['|', '.', '*'].includes(token)) {
      const start = newState();
      const end = newState();
      const transition = { from: start, to: end, label: token };
      transitions.push(transition);
      alphabet.add(token);
      stack.push({ start, end, label: token });
      record(token, 'Create symbol fragment', `Created a basic fragment for symbol "${token}".`, [transition]);
      continue;
    }

    if (token === '|') {
      if (stack.length < 2) throw new Error('Invalid postfix expression: union needs two fragments.');
      const right = stack.pop()!;
      const left = stack.pop()!;
      const start = newState();
      const end = newState();
      const added = [
        { from: start, to: left.start, label: '' },
        { from: start, to: right.start, label: '' },
        { from: left.end, to: end, label: '' },
        { from: right.end, to: end, label: '' }
      ];
      transitions.push(...added);
      stack.push({ start, end, label: `(${left.label}|${right.label})` });
      record(token, 'Union', 'Created a new start and final state, with epsilon branches to both fragments.', added);
    } else if (token === '.') {
      if (stack.length < 2) throw new Error('Invalid postfix expression: concatenation needs two fragments.');
      const right = stack.pop()!;
      const left = stack.pop()!;
      const added = [{ from: left.end, to: right.start, label: '' }];
      transitions.push(...added);
      stack.push({ start: left.start, end: right.end, label: `${left.label}${right.label}` });
      record(token, 'Concatenation', 'Connected the first fragment to the second using an epsilon transition.', added);
    } else {
      if (stack.length < 1) throw new Error('Invalid postfix expression: Kleene star needs one fragment.');
      const fragment = stack.pop()!;
      const start = newState();
      const end = newState();
      const added = [
        { from: start, to: fragment.start, label: '' },
        { from: start, to: end, label: '' },
        { from: fragment.end, to: fragment.start, label: '' },
        { from: fragment.end, to: end, label: '' }
      ];
      transitions.push(...added);
      stack.push({ start, end, label: `(${fragment.label})*` });
      record(token, 'Kleene Star', 'Added epsilon entry, bypass, loop and exit transitions.', added);
    }
  }

  if (stack.length !== 1) throw new Error('Could not construct an NFA from this expression.');
  const final = stack[0];
  const nfa: NFA = {
    states,
    alphabet: [...alphabet].sort(),
    transitions,
    startState: final.start,
    acceptState: final.end
  };

  return { nfa, steps, postfix: parsed.postfix.join(''), withConcat: parsed.withConcat };
}