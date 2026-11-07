const OPERATORS = new Set(['|', '*', '(', ')', '.']);

export function validateRegex(expression: string): { valid: boolean; error?: string } {
  const input = expression.replace(/\s+/g, '');
  if (!input) return { valid: false, error: 'Please enter a regular expression.' };

  let depth = 0;
  let previous: 'operand' | 'operator' | 'open' | 'close' | 'star' | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === '(') {
      if (previous === 'operand' || previous === 'close' || previous === 'star') {
        // Implicit concatenation is allowed before an opening parenthesis.
      }
      depth++;
      previous = 'open';
      continue;
    }

    if (ch === ')') {
      if (depth === 0) return { valid: false, error: 'Unmatched closing parenthesis.' };
      if (previous === 'open' || previous === 'operator') {
        return { valid: false, error: 'Empty or incomplete group.' };
      }
      depth--;
      previous = 'close';
      continue;
    }

    if (ch === '*') {
      if (previous !== 'operand' && previous !== 'close' && previous !== 'star') {
        return { valid: false, error: 'Kleene star must follow an operand or a closing parenthesis.' };
      }
      previous = 'star';
      continue;
    }

    if (ch === '|') {
      if (previous !== 'operand' && previous !== 'close' && previous !== 'star') {
        return { valid: false, error: 'Union must have an expression on both sides.' };
      }
      previous = 'operator';
      continue;
    }

    if (ch === '.') {
      return { valid: false, error: 'Use implicit concatenation (ab), not a dot. The parser inserts dots automatically.' };
    }

    if (OPERATORS.has(ch)) return { valid: false, error: `Unsupported operator: ${ch}` };
    if (/\s/.test(ch)) continue;
    if (previous === 'operator') {
      // A symbol is a valid right operand.
    }
    previous = 'operand';
  }

  if (depth !== 0) return { valid: false, error: 'Unmatched opening parenthesis.' };
  if (previous === 'operator' || previous === 'open') {
    return { valid: false, error: 'Expression cannot end with an operator or opening parenthesis.' };
  }
  return { valid: true };
}

function isOperand(ch: string): boolean {
  return !['|', '*', '(', ')', '.'].includes(ch);
}

export function insertConcatenation(expression: string): string {
  const chars = expression.replace(/\s+/g, '').split('');
  let result = '';
  for (let i = 0; i < chars.length; i++) {
    const current = chars[i];
    const next = chars[i + 1];
    result += current;
    if (!next) continue;

    const currentCanEnd = isOperand(current) || current === ')' || current === '*';
    const nextCanStart = isOperand(next) || next === '(';
    if (currentCanEnd && nextCanStart) result += '.';
  }
  return result;
}