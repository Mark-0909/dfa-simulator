import React, { useEffect, useMemo, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, useReactFlow } from '@xyflow/react';
import BezierPulse from './BezierPulse';

function cubicPoint(t, p0, c1, c2, p3) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const a = mt2 * mt; // (1-t)^3
  const b = 3 * mt2 * t; // 3(1-t)^2 t
  const c = 3 * mt * t2; // 3(1-t) t^2
  const d = t2 * t; // t^3
  return {
    x: a * p0.x + b * c1.x + c * c2.x + d * p3.x,
    y: a * p0.y + b * c1.y + c * c2.y + d * p3.y,
  };
}

export default function AdjustableBezierEdge(props) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style = {},
    markerEnd,
    label,
    selected,
    data,
  } = props;

  const { screenToFlowPosition, setEdges } = useReactFlow();
  // Keep starts attached to the node handle—no manual shifts
  const anchorShift = { x: 0, y: 0 };
  const anchorOffset = 0;

  // Offset the source point sideways to fan out sibling edges
  const dx0 = targetX - sourceX;
  const dy0 = targetY - sourceY;
  const len0 = Math.max(1, Math.hypot(dx0, dy0));
  const nx0 = -dy0 / len0;
  const ny0 = dx0 / len0;
  const sX = sourceX + nx0 * anchorOffset + anchorShift.x;
  const sY = sourceY + ny0 * anchorOffset + anchorShift.y;

  const initial = useMemo(() => {
    const dx = targetX - sX;
    const dy = targetY - sY;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len; // normal x
    const ny = dx / len;  // normal y
    const offset = Math.min(60, Math.max(20, len / 4));

    return {
      c1: { x: sX + nx * offset, y: sY + ny * offset },
      c2: { x: targetX + nx * offset, y: targetY + ny * offset },
    };
  }, [sX, sY, targetX, targetY]);

  const c1 = data?.c1 ?? initial.c1;
  const c2 = data?.c2 ?? initial.c2;

  const [dragging, setDragging] = useState(null); // 'c1' | 'c2' | null
  const [showHandles, setShowHandles] = useState(false);

  // Local state for immediate visual feedback
  const [localC1, setLocalC1] = useState(c1);
  const [localC2, setLocalC2] = useState(c2);

  // Sync local state when props change (if not dragging)
  useEffect(() => {
    if (!dragging) {
      setLocalC1(c1);
      setLocalC2(c2);
    }
  }, [c1, c2, dragging]);

  // Optimize: Use refs for mutable values needed in callbacks to avoid Effect re-runs
  const pointers = React.useRef({ localC1, localC2 });
  // Update refs whenever local state changes
  useEffect(() => {
    pointers.current = { localC1, localC2 };
  }, [localC1, localC2]);

  // Use local points for rendering
  const renderC1 = dragging ? localC1 : c1;
  const renderC2 = dragging ? localC2 : c2;

  const path = `M ${sX} ${sY} C ${renderC1.x} ${renderC1.y}, ${renderC2.x} ${renderC2.y}, ${targetX} ${targetY}`;
  const mid = cubicPoint(0.5, { x: sX, y: sY }, renderC1, renderC2, { x: targetX, y: targetY });

  useEffect(() => {
    if (!dragging) return;

    function onMove(e) {
      const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      // Update local state ONLY
      if (dragging === 'c1') setLocalC1({ x: p.x, y: p.y });
      if (dragging === 'c2') setLocalC2({ x: p.x, y: p.y });
    }

    function onUp() {
      // Commit to global state on release
      setEdges((eds) => eds.map((edge) => {
        if (edge.id !== id) return edge;
        const next = { ...(edge.data || {}) };
        // Read from ref to get latest values without closing over them
        next[dragging] = dragging === 'c1' ? pointers.current.localC1 : pointers.current.localC2;
        return { ...edge, data: next };
      }));
      setDragging(null);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, id, screenToFlowPosition, setEdges]); // Removed localC1/localC2 from deps!

  const handleStyle = (x, y) => ({
    position: 'absolute',
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
    width: 12,
    height: 12,
    borderRadius: 6,
    background: '#f39c12',
    border: '2px solid #2c3e50',
    cursor: 'grab',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
    pointerEvents: 'all',
    zIndex: 10000,
  });

  return (
    <>
      <BaseEdge path={path} markerEnd={markerEnd} style={style} />
      {data && data.animatePulse && (
        <BezierPulse key={data.animatePulse} duration={data?.animatePulseDuration || 700} pathPoints={{
          p0: { x: sX, y: sY },
          c1: renderC1,
          c2: renderC2,
          p3: { x: targetX, y: targetY }
        }} />
      )}
      {label && (
        <EdgeLabelRenderer>
          <div
            onMouseEnter={() => setShowHandles(true)}
            onMouseLeave={() => setShowHandles(false)}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${mid.x}px, ${mid.y}px)`,
              background: '#fff',
              padding: '2px 4px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              pointerEvents: 'all',
              border: '1px solid #ccc',
              zIndex: 10000,
            }}
            className="nodrag nopan react-flow__edge-label"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}

      {(selected || showHandles || dragging) && (
        <EdgeLabelRenderer>
          <div
            style={handleStyle(renderC1.x, renderC1.y)}
            onPointerDown={() => setDragging('c1')}
            className="nodrag nopan react-flow__edge-label"
            title="Drag to adjust curve"
          />
          <div
            style={handleStyle(renderC2.x, renderC2.y)}
            onPointerDown={() => setDragging('c2')}
            className="nodrag nopan react-flow__edge-label"
            title="Drag to adjust curve"
          />
        </EdgeLabelRenderer>
      )}
    </>
  );
}
