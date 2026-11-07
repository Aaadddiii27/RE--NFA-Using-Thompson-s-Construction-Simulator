import { useMemo, useState } from 'react';
import { Activity, ArrowRight, CheckCircle2, CircleAlert, GitBranch, Sparkles } from 'lucide-react';
import Sidebar, { type Page } from './components/Sidebar';
import NFAVisualizer from './components/NFAVisualizer';
import ConstructionSteps from './components/ConstructionSteps';
import StringTester from './components/StringTester';
import Home from './pages/Home';
import { validateRegex } from './algorithms/validator';
import { toPostfix } from './algorithms/parser';
import { buildThompsonNFA, type ThompsonResult } from './algorithms/thompson';

const PAGE_TITLES: Record<Page, string> = {
  home: 'Dashboard',
  simulator: 'Regular Expression Simulator',
  steps: 'Construction History',
  visualization: 'NFA Visualization',
  testing: 'String Testing'
};

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [expression, setExpression] = useState('(a|b)*abb');
  const [result, setResult] = useState<ThompsonResult | null>(null);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [notice, setNotice] = useState('');

  const validation = useMemo(() => expression.trim() ? validateRegex(expression) : null, [expression]);

  const generate = () => {
    const check = validateRegex(expression);
    if (!check.valid) { setError(check.error || 'Invalid expression.'); setResult(null); return; }
    try {
      const built = buildThompsonNFA(expression);
      setResult(built);
      setError('');
      setNotice('Equivalent ε-NFA generated successfully.');
      setActiveStep(0);
      setPage('simulator');
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Unable to generate NFA.');
    }
  };

  const parsed = useMemo(() => {
    try { return expression.trim() && validation?.valid ? toPostfix(expression) : null; }
    catch { return null; }
  }, [expression, validation]);

  return (
    <div className="app-shell">
      <Sidebar active={page} onNavigate={setPage} />
      <main className="main-content">
        <header className="topbar">
          <div><div className="eyebrow">RE → ε-NFA SIMULATOR</div><h2>{PAGE_TITLES[page]}</h2></div>
          <div className="topbar-status"><span className="status-dot" /> Local browser session</div>
        </header>

        {page === 'home' && <Home onStart={() => setPage('simulator')} />}

        {page === 'simulator' && <div className="page-content">
          <section className="panel input-panel">
            <div className="panel-heading"><div><div className="eyebrow">STEP 01 · INPUT</div><h3>Enter a regular expression</h3></div><Sparkles size={20} /></div>
            <div className="input-line">
              <input aria-label="Regular expression" value={expression} onChange={e => { setExpression(e.target.value); setError(''); setNotice(''); }} onKeyDown={e => e.key === 'Enter' && generate()} placeholder="e.g. (a|b)*abb" />
              <button className="button primary" onClick={generate}>Generate ε-NFA <ArrowRight size={16} /></button>
            </div>
            <p className="hint">Supported: union <code>|</code>, implicit concatenation <code>ab</code>, Kleene star <code>*</code>, parentheses <code>()</code>.</p>
            {validation && <div className={`validation ${validation.valid ? 'valid' : 'invalid'}`}>
              {validation.valid ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
              {validation.valid ? 'Expression syntax looks valid.' : validation.error}
            </div>}
            {error && <div className="alert error">{error}</div>}
            {notice && <div className="alert success">{notice}</div>}
          </section>

          <div className="two-column">
            <section className="panel">
              <div className="panel-heading"><div><div className="eyebrow">STEP 02 · PARSING</div><h3>Expression processing</h3></div><Activity size={19} /></div>
              {parsed ? <>
                <div className="process-item"><span>Explicit concatenation</span><code>{parsed.withConcat}</code></div>
                <div className="process-item"><span>Postfix notation</span><code>{parsed.postfix.join('')}</code></div>
              </> : <div className="empty-state compact">Enter a valid expression to preview parsing.</div>}
            </section>
            <section className="panel summary-panel">
              <div className="panel-heading"><div><div className="eyebrow">STEP 03 · OUTPUT</div><h3>Generated automaton</h3></div><GitBranch size={19} /></div>
              {result ? <div className="stats-grid">
                <div><strong>{result.nfa.states.length}</strong><span>States</span></div>
                <div><strong>{result.nfa.transitions.length}</strong><span>Transitions</span></div>
                <div><strong>{result.steps.length}</strong><span>Steps</span></div>
              </div> : <div className="empty-state compact">Your NFA summary will appear here.</div>}
            </section>
          </div>

          <section className="panel">
            <div className="panel-heading"><div><div className="eyebrow">STEP 04 · VISUALIZATION</div><h3>Generated ε-NFA</h3></div></div>
            <NFAVisualizer nfa={result?.nfa || null} />
          </section>
        </div>}

        {page === 'steps' && <div className="page-content"><section className="panel">
          <div className="panel-heading"><div><div className="eyebrow">THOMPSON'S CONSTRUCTION</div><h3>How the automaton was built</h3></div></div>
          <ConstructionSteps steps={result?.steps || []} activeStep={activeStep} onStepChange={setActiveStep} />
        </section></div>}

        {page === 'visualization' && <div className="page-content"><section className="panel">
          <div className="panel-heading"><div><div className="eyebrow">GENERATED FROM NFA DATA</div><h3>State transition diagram</h3></div></div>
          <NFAVisualizer nfa={result?.nfa || null} />
          {result && <div className="automaton-meta"><span>Initial state: <b>q{result.nfa.startState}</b></span><span>Accepting state: <b>q{result.nfa.acceptState}</b></span><span>Alphabet: <b>{result.nfa.alphabet.join(', ')}</b></span></div>}
        </section></div>}

        {page === 'testing' && <div className="page-content"><section className="panel">
          <div className="panel-heading"><div><div className="eyebrow">ε-CLOSURE SIMULATION</div><h3>Test a string against your NFA</h3></div></div>
          <StringTester nfa={result?.nfa || null} />
        </section></div>}
      </main>
    </div>
  );
}