export type TransitionLabel = string; // Empty string represents epsilon.

export interface Transition {
  from: number;
  to: number;
  label: TransitionLabel;
}

export interface NFA {
  states: number[];
  alphabet: string[];
  transitions: Transition[];
  startState: number;
  acceptState: number;
}

export interface ConstructionStep {
  id: number;
  token: string;
  operation: string;
  explanation: string;
  stack: string[];
  fragmentStart?: number;
  fragmentEnd?: number;
  transitionsAdded: Transition[];
}

export interface ParseResult {
  tokens: string[];
  withConcat: string;
  postfix: string[];
}