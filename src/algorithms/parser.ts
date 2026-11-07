import { insertConcatenation, validateRegex } from './validator';
import type { ParseResult } from '../types/automata';

const PRECEDENCE: Record<string, number> = { '|': 1, '.': 2, '*': 3 };
const isOperand = (token: string) => !['|', '.', '*', '(', ')'].includes(token);

export function tokenize(expression: string): string[] {
  return expression.replace(/\s+/g, '').split('');
}

export function toPostfix(expression: string): ParseResult {
  const validation = validateRegex(expression);
  if (!validation.valid) throw new Error(validation.error || 'Invalid regular expression.');

  const withConcat = insertConcatenation(expression);
  const tokens = tokenize(withConcat);
  const output: string[] = [];
  const operators: string[] = [];

  for (const token of tokens) {
    if (isOperand(token)) {
      output.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length && operators[operators.length - 1] !== '(') {
        output.push(operators.pop()!);
      }
      if (!operators.length) throw new Error('Mismatched parentheses.');
      operators.pop();
    } else {
      while (
        operators.length &&
        operators[operators.length - 1] !== '(' &&
        PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[token]
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    }
  }

  while (operators.length) {
    const op = operators.pop()!;
    if (op === '(' || op === ')') throw new Error('Mismatched parentheses.');
    output.push(op);
  }

  return { tokens, withConcat, postfix: output };
}