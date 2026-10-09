export type WireNode = {
  icon: string;
  name: string;
  tech: string;
};

/**
 * "Wire the API" (Sheet 05) — a generic 15s mini-game reused for every
 * building in v1 (see docs/GOALS.md#non-goals: more mini-games are a later idea).
 */
export const WIRE_NODES: WireNode[] = [
  { icon: 'monitor', name: 'Frontend', tech: 'NEXT.JS' },
  { icon: 'server', name: 'Backend', tech: 'NESTJS' },
  { icon: 'database', name: 'Database', tech: 'POSTGRES' },
];

export const TOTAL_LINKS = WIRE_NODES.length - 1;
export const GAME_SECONDS = 15;

export type WirePort = {
  id: string;
  nodeIndex: number;
  side: 'out' | 'in';
  /** Position within the 570×230 desktop board. */
  x: number;
  y: number;
};

export const WIRE_PORTS: WirePort[] = [
  { id: 'n0-out', nodeIndex: 0, side: 'out', x: 144, y: 115 },
  { id: 'n1-in', nodeIndex: 1, side: 'in', x: 205, y: 115 },
  { id: 'n1-out', nodeIndex: 1, side: 'out', x: 335, y: 115 },
  { id: 'n2-in', nodeIndex: 2, side: 'in', x: 396, y: 115 },
];

/** The pair of ports that make up link N, in required order. */
export const REQUIRED_LINK_PAIRS: [string, string][] = [
  ['n0-out', 'n1-in'],
  ['n1-out', 'n2-in'],
];

export function isValidLinkAttempt(portAId: string, portBId: string, linksMade: number): boolean {
  const pair = REQUIRED_LINK_PAIRS[linksMade];
  if (!pair) return false;
  return (portAId === pair[0] && portBId === pair[1]) || (portAId === pair[1] && portBId === pair[0]);
}

/** Desktop node box left positions within the 570px board. */
export const NODE_LEFT = [20, 211, 402];
