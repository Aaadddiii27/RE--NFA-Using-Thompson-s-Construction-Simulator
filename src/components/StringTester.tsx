import { useState } from 'react';
import type { NFA } from '../types/automata';
import { simulateNFA } from '../algorithms/simulator';

interface Props { nfa: NFA | null; }

export default function StringTester({ nfa }: Props) {
  const [value, setValue] = useState('aabb');
  const [result, setResult] = useState<ReturnType<typeof simulateNFA> | null>(null);
  const [error, setError] = useState('');

  const test = () => {
    if (!nfa) { setError('Generate an NFA first.'); return; }
    if (value.split('').some(ch => !nfa.alphabet.includes(ch))) {
      setError(`Only these symbols are supported: ${nfa.alphabet.join(', ') || '(empty alphabet)'}`);
      setResult(null);
      return;
    }
    setError('');
    setResult(simulateNFA(nfa, value));
  };

  return (
    <div className="tester">
      <div className="field-row">
        <label className="field-label" htmlFor="test-string">Input string</label>
        <input id="test-string" value={value} onChange={e => { setValue(e.target.value); setResult(null); }} placeholder="e.g. aabb" />
        <button className="button primary" onClick={test}>Test string</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      {result && (
        <div className={`result-banner ${result.accepted ? 'accepted' : 'rejected'}`}>
          <strong>{result.accepted ? 'Accepted' : 'Rejected'}</strong>
          <span>{result.accepted ? 'The NFA reached its accepting state.' : 'The NFA did not reach its accepting state.'}</span>
        </div>
      )}
      {result && <div className="trace">
        <h3>Simulation trace</h3>
        {result.trace.map(row => (
          <div className="trace-row" key={row.step}>
            <span>{row.step === 0 ? 'Start' : `Read "${row.symbol}"`}</span>
            <code>{row.states.length ? `{ ${row.states.map(s => `q${s}`).join(', ')} }` : '∅'}</code>
          </div>
        ))}
      </div>}
    </div>
  );
}