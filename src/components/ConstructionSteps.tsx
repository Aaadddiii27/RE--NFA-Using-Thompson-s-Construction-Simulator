import type { ConstructionStep } from '../types/automata';

interface Props {
  steps: ConstructionStep[];
  activeStep: number;
  onStepChange: (step: number) => void;
}

export default function ConstructionSteps({ steps, activeStep, onStepChange }: Props) {
  if (!steps.length) return <div className="empty-state">Generate an NFA to inspect its construction history.</div>;
  const current = steps[activeStep] || steps[0];

  return (
    <div className="steps-layout">
      <div className="step-list">
        {steps.map((step, index) => (
          <button key={step.id} onClick={() => onStepChange(index)} className={`step-row ${activeStep === index ? 'selected' : ''}`}>
            <span className="step-number">{step.id}</span>
            <span><strong>{step.operation}</strong><small>Token: {step.token}</small></span>
          </button>
        ))}
      </div>
      <div className="step-detail">
        <div className="eyebrow">STEP {current.id} OF {steps.length}</div>
        <h3>{current.operation}</h3>
        <p>{current.explanation}</p>
        <h4>Postfix token</h4><code className="token-chip">{current.token}</code>
        <h4>Stack after operation</h4>
        {current.stack.length ? <ul className="stack-list">{current.stack.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="muted">Stack is empty.</p>}
        <div className="step-controls">
          <button className="button secondary" disabled={activeStep === 0} onClick={() => onStepChange(activeStep - 1)}>Previous</button>
          <button className="button primary" disabled={activeStep === steps.length - 1} onClick={() => onStepChange(activeStep + 1)}>Next step</button>
        </div>
      </div>
    </div>
  );
}