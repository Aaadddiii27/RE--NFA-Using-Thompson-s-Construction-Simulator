interface Props { onStart: () => void; }

export default function Home({ onStart }: Props) {
  return (
    <div className="home-page">
      <div className="hero">
        <div className="eyebrow">AUTOMATA THEORY · INTERACTIVE LEARNING</div>
        <h1>Regular Expression<br /><span>to ε-NFA Simulator</span></h1>
        <p>Understand Thompson's Construction by building automata step by step, visualizing transitions and testing strings.</p>
        <button className="button primary large" onClick={onStart}>Start simulation <span>→</span></button>
        <div className="hero-example"><span>TRY THIS EXPRESSION</span><code>(a|b)*abb</code><small>Strings over {`{a, b}`} that end with abb</small></div>
      </div>
      <div className="feature-grid">
        <article className="feature-card"><div className="feature-icon">01</div><h3>Validate & Parse</h3><p>Check the expression, insert concatenation and convert it to postfix notation.</p></article>
        <article className="feature-card"><div className="feature-icon">02</div><h3>Build the ε-NFA</h3><p>Apply Thompson's Construction using a stack of smaller automaton fragments.</p></article>
        <article className="feature-card"><div className="feature-icon">03</div><h3>Visualize & Test</h3><p>Explore the generated state diagram and test strings using epsilon-closure.</p></article>
      </div>
    </div>
  );
}