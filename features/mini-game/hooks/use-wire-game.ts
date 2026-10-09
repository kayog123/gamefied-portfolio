import { useEffect, useRef, useState } from 'react';
import { useCountdown } from '@/hooks/use-countdown';
import { GAME_SECONDS, TOTAL_LINKS, isValidLinkAttempt } from '../mini-game.constants';

export type Point = { x: number; y: number };

export type UseWireGameOptions = {
  /** Fires once, the instant the final link is made. */
  onWin: (wiredSeconds: number) => void;
  /** Timeout never fails the visitor — this fires once, the building still completes. */
  onTimeout: () => void;
};

export type UseWireGameResult = {
  linksMade: number;
  isComplete: boolean;
  shake: boolean;
  pendingPortId: string | null;
  dragFromPortId: string | null;
  dragPoint: Point | null;
  remaining: number;
  progress: number;
  startDrag: (portId: string, point: Point) => void;
  updateDrag: (point: Point) => void;
  endDrag: (targetPortId: string | null) => void;
  selectPort: (portId: string) => void;
  attemptNode: (nodeIndex: number) => void;
};

/** Core "Wire the API" state machine — drag, tap and keyboard all funnel through `isValidLinkAttempt`. */
export function useWireGame({ onWin, onTimeout }: UseWireGameOptions): UseWireGameResult {
  const [linksMade, setLinksMade] = useState(0);
  const [shake, setShake] = useState(false);
  const [pendingPortId, setPendingPortId] = useState<string | null>(null);
  const [dragFromPortId, setDragFromPortId] = useState<string | null>(null);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const shakeTimeoutRef = useRef<number | undefined>(undefined);

  const isComplete = linksMade >= TOTAL_LINKS;
  const { remaining, progress } = useCountdown(GAME_SECONDS, {
    running: !isComplete,
    onExpire: onTimeout,
  });

  useEffect(() => () => window.clearTimeout(shakeTimeoutRef.current), []);

  function fail() {
    window.clearTimeout(shakeTimeoutRef.current);
    setShake(true);
    shakeTimeoutRef.current = window.setTimeout(() => setShake(false), 150);
  }

  function registerLink() {
    setLinksMade((n) => n + 1);
    if (linksMade + 1 >= TOTAL_LINKS) onWin(Math.max(0.1, GAME_SECONDS - remaining));
  }

  function attemptLink(portAId: string, portBId: string) {
    if (isValidLinkAttempt(portAId, portBId, linksMade)) registerLink();
    else fail();
  }

  function attemptNode(nodeIndex: number) {
    if (isComplete) return;
    if (nodeIndex === linksMade + 1) registerLink();
    else fail();
  }

  function startDrag(portId: string, point: Point) {
    if (isComplete) return;
    setDragFromPortId(portId);
    setDragPoint(point);
  }

  function updateDrag(point: Point) {
    if (dragFromPortId) setDragPoint(point);
  }

  function endDrag(targetPortId: string | null) {
    const from = dragFromPortId;
    setDragFromPortId(null);
    setDragPoint(null);
    if (!from || !targetPortId || targetPortId === from) return;
    attemptLink(from, targetPortId);
  }

  function selectPort(portId: string) {
    if (isComplete) return;
    if (!pendingPortId) {
      setPendingPortId(portId);
      return;
    }
    if (pendingPortId === portId) {
      setPendingPortId(null);
      return;
    }
    attemptLink(pendingPortId, portId);
    setPendingPortId(null);
  }

  return {
    linksMade,
    isComplete,
    shake,
    pendingPortId,
    dragFromPortId,
    dragPoint,
    remaining,
    progress,
    startDrag,
    updateDrag,
    endDrag,
    selectPort,
    attemptNode,
  };
}
