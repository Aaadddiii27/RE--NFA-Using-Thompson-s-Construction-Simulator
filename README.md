# RE-NFA-Simulator

An interactive browser-based Regular Expression to epsilon-NFA simulator using Thompson's Construction.

## Requirements
- Node.js 18 or later
- npm

## Run locally
1. Extract the ZIP.
2. Open the `RE-NFA-Simulator` folder in VS Code.
3. Open the integrated terminal in that folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite (usually http://localhost:5173).

## Run tests

```bash
npm test
```

## Production build

```bash
npm run build
npm run preview
```

## Supported regular-expression syntax
- `|` union
- Implicit concatenation, e.g. `ab`
- `*` Kleene star
- Parentheses, e.g. `(a|b)*abb`
- Single-character operands other than the reserved operators and whitespace

This is an educational simulator, not a full JavaScript regular-expression engine. It does not currently support `+`, `?`, character classes, escape sequences, or empty alternatives.

## Main modules
- `src/algorithms/validator.ts`: syntax validation and explicit concatenation
- `src/algorithms/parser.ts`: tokenization and Shunting Yard conversion
- `src/algorithms/thompson.ts`: stack-based Thompson fragment construction
- `src/algorithms/simulator.ts`: epsilon-closure NFA simulation
- `src/components/NFAVisualizer.tsx`: SVG automaton visualization
- `src/components/ConstructionSteps.tsx`: recorded construction history
