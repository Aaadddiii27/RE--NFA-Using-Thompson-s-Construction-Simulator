
import { useMemo, useRef, useState } from 'react';
import dagre from '@dagrejs/dagre';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { NFA } from '../types/automata';

interface Props {
  nfa: NFA | null;
}

const NODE_SIZE = 54;

export default function NFAVisualizer({ nfa }: Props) {
  const [zoom, setZoom] = useState(0.65);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Generate automatic graph layout
  const layout = useMemo(() => {
    if (!nfa) return null;

    const graph = new dagre.graphlib.Graph({ multigraph: true });

    graph.setGraph({
      rankdir: 'LR',
      nodesep: 85,
      ranksep: 110,
      edgesep: 40,
      marginx: 80,
      marginy: 90
    });

    graph.setDefaultEdgeLabel(() => ({}));

    nfa.states.forEach(state => {
      graph.setNode(`q${state}`, {
        width: NODE_SIZE,
        height: NODE_SIZE
      });
    });

    nfa.transitions.forEach((transition, index) => {
      graph.setEdge(
        `q${transition.from}`,
        `q${transition.to}`,
        { index },
        `edge-${index}`
      );
    });

    dagre.layout(graph);

    // Calculate transition positions
    const edges = nfa.transitions.map((transition, index) => {
      const edge = graph.edge(
        `q${transition.from}`,
        `q${transition.to}`,
        `edge-${index}`
      );

      const points = edge?.points || [];
      const middleIndex = Math.floor(points.length / 2);

      const middle = points[middleIndex] || {
        x: 0,
        y: 0
      };

      return {
        ...transition,
        points,
        labelX: middle.x,
        labelY: middle.y,
        key: index
      };
    });

    // Calculate state positions
    const nodes = nfa.states.map(state => {
      const node = graph.node(`q${state}`);

      return {
        id: state,
        x: node.x,
        y: node.y
      };
    });

    return {
      nodes,
      edges,
      width: (graph.graph().width || 800) + 160,
      height: (graph.graph().height || 300) + 180
    };
  }, [nfa]);

  // Fit the complete diagram inside the available viewport
  const fitToScreen = () => {
    const viewport = viewportRef.current;

    if (!viewport || !layout) return;

    const availableWidth = viewport.clientWidth - 40;
    const availableHeight = viewport.clientHeight - 40;

    if (availableWidth <= 0 || availableHeight <= 0) return;

    const widthScale = availableWidth / layout.width;
    const heightScale = availableHeight / layout.height;

    const fitScale = Math.min(widthScale, heightScale);

    setZoom(Math.max(0.2, Math.min(1.5, fitScale)));
  };

  // Empty state
  if (!nfa || !layout) {
    return (
      <div className="empty-state">
        Generate an NFA to see its state diagram here.
      </div>
    );
  }

  // Display epsilon for empty transition labels
  const displayLabel = (label: string) => {
    return label === '' ? 'ε' : label;
  };

  // Generate SVG transition paths
  const makePath = (points: { x: number; y: number }[]) => {
    if (!points.length) return '';

    return points
      .map((point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
      )
      .join(' ');
  };

  return (
    <div className="visualizer-container">

      {/* Toolbar */}
      <div className="visualizer-toolbar">

        <div className="diagram-legend">
          <span>
            <i className="legend-start" />
            Initial state
          </span>

          <span>
            <i className="legend-final" />
            Accepting state
          </span>

          <span>
            <i className="legend-epsilon">ε</i>
            Epsilon transition
          </span>
        </div>

        {/* Zoom controls */}
        <div className="zoom-controls">

          <button
            title="Zoom out"
            onClick={() =>
              setZoom(z => Math.max(0.2, z - 0.15))
            }
          >
            <ZoomOut size={16} />
          </button>

          <span>{Math.round(zoom * 100)}%</span>

          <button
            title="Zoom in"
            onClick={() =>
              setZoom(z => Math.min(2, z + 0.15))
            }
          >
            <ZoomIn size={16} />
          </button>

          <button
            title="Fit to Screen"
            onClick={fitToScreen}
          >
            <Maximize2 size={16} />
          </button>

        </div>
      </div>

      {/* Diagram viewport */}
      <div
        className="diagram-viewport"
        ref={viewportRef}
      >

        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          style={{
            width: `${layout.width * zoom}px`,
            height: `${layout.height * zoom}px`,
            display: 'block'
          }}
          className="nfa-svg"
          role="img"
          aria-label="Generated epsilon NFA state transition diagram"
        >

          <defs>
            <marker
              id="nfa-arrow"
              markerWidth="9"
              markerHeight="9"
              refX="8"
              refY="4"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path
                d="M0,0 L0,8 L9,4 Z"
                fill="#46dce7"
              />
            </marker>
          </defs>

          {/* Transition arrows and labels */}
          {layout.edges.map(edge => {
            const from = layout.nodes.find(
              node => node.id === edge.from
            )!;

            const isLoop = edge.from === edge.to;
            const label = displayLabel(edge.label);

            // Self-loop transition
            if (isLoop) {
              const d = `
                M ${from.x - 12} ${from.y - 24}
                C ${from.x - 65} ${from.y - 105},
                  ${from.x + 65} ${from.y - 105},
                  ${from.x + 12} ${from.y - 24}
              `;

              return (
                <g key={edge.key}>

                  <path
                    d={d}
                    fill="none"
                    stroke="#46dce7"
                    strokeWidth="2"
                    markerEnd="url(#nfa-arrow)"
                  />

                  <rect
                    x={from.x - 18}
                    y={from.y - 103}
                    width={36 + label.length * 5}
                    height="22"
                    rx="5"
                    fill="#101a39"
                  />

                  <text
                    x={from.x}
                    y={from.y - 87}
                    textAnchor="middle"
                    fill="#70e5eb"
                    fontSize="14"
                    fontWeight="700"
                  >
                    {label}
                  </text>

                </g>
              );
            }

            const path = makePath(edge.points);

            return (
              <g key={edge.key}>

                <path
                  d={path}
                  fill="none"
                  stroke="#46dce7"
                  strokeWidth="2"
                  markerEnd="url(#nfa-arrow)"
                />

                {/* Transition label background */}
                <rect
                  x={edge.labelX - Math.max(12, label.length * 5)}
                  y={edge.labelY - 25}
                  width={Math.max(24, label.length * 10 + 8)}
                  height="23"
                  rx="5"
                  fill="#101a39"
                  stroke="#263d67"
                  strokeWidth="0.7"
                />

                {/* Transition label */}
                <text
                  x={edge.labelX}
                  y={edge.labelY - 9}
                  textAnchor="middle"
                  fill="#70e5eb"
                  fontSize="14"
                  fontWeight="700"
                >
                  {label}
                </text>

              </g>
            );
          })}

          {/* Initial state arrow */}
          {layout.nodes
            .filter(node => node.id === nfa.startState)
            .map(node => (
              <g key="initial-arrow">

                <path
                  d={`M ${node.x - 65} ${node.y} L ${node.x - 29} ${node.y}`}
                  stroke="#46dce7"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#nfa-arrow)"
                />

                <text
                  x={node.x - 66}
                  y={node.y - 13}
                  textAnchor="middle"
                  fill="#70e5eb"
                  fontSize="12"
                  fontWeight="600"
                >
                  Start
                </text>

              </g>
            ))}

          {/* State circles */}
          {layout.nodes.map(node => {
            const isInitial = node.id === nfa.startState;
            const isFinal = node.id === nfa.acceptState;

            return (
              <g key={node.id}>

                <circle
                  cx={node.x}
                  cy={node.y}
                  r="25"
                  fill={isInitial ? '#173b55' : '#172447'}
                  stroke={isFinal ? '#38d9b1' : '#8ca9d9'}
                  strokeWidth="2.5"
                />

                {/* Double circle for accepting state */}
                {isFinal && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="19"
                    fill="none"
                    stroke="#38d9b1"
                    strokeWidth="1.8"
                  />
                )}

                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="600"
                >
                  q{node.id}
                </text>

              </g>
            );
          })}

        </svg>
      </div>

      {/* Diagram information */}
      <div className="diagram-footer">

        <span>
          States: <strong>{nfa.states.length}</strong>
        </span>

        <span>
          Transitions: <strong>{nfa.transitions.length}</strong>
        </span>

        <span>
          Initial: <strong>q{nfa.startState}</strong>
        </span>

        <span>
          Final: <strong>q{nfa.acceptState}</strong>
        </span>

      </div>

    </div>
  );
}
