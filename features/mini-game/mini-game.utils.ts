import { REQUIRED_LINK_PAIRS, type WirePort } from './mini-game.constants';

export type PortVisualState = 'done' | 'next-source' | 'next-target' | 'future';

/** Which of the 4 visual states a port is in, given how many links are made so far. */
export function portVisualState(port: WirePort, linksMade: number): PortVisualState {
  const linkIndex = REQUIRED_LINK_PAIRS.findIndex(([a, b]) => a === port.id || b === port.id);
  if (linkIndex < 0) return 'future';
  if (linkIndex < linksMade) return 'done';
  if (linkIndex === linksMade) return port.side === 'out' ? 'next-source' : 'next-target';
  return 'future';
}
