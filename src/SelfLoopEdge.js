import React, { useEffect, useMemo, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, useNodesData, useReactFlow } from '@xyflow/react';

export default function SelfLoopEdge({
    id,
    source, // ID of source node
    sourceX,
    sourceY,
    targetX, // Not used for geometry
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    selected,
    data,
}) {
    // Get the source node data to find the current rotation angle
    const nodesData = useNodesData(source);
    // Default to -90 (Top) if not found
    const angleDeg = nodesData?.data?.angle !== undefined ? nodesData.data.angle : -90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const anchorOffset = 0;
    const anchorShift = { x: 0, y: 0 }; // keep loop attached to node with no gap
<<<<<<< HEAD

    // Get ReactFlow instance specifically for screenToFlowPosition
    const { screenToFlowPosition, setEdges } = useReactFlow();
=======
>>>>>>> origin/main

    // Node geometry
    const radius = 38;

    // Calculate CenterX/CenterY based on Handle Position
    const centerX = sourceX - radius * Math.cos(angleRad);
    const centerY = sourceY - radius * Math.sin(angleRad);

    // Offset loop anchor sideways to spread overlapping loops from same source and allow manual drag shift
    const tangentX = Math.sin(angleRad);
    const tangentY = -Math.cos(angleRad);
    const anchorShiftX = tangentX * anchorOffset + anchorShift.x;
    const anchorShiftY = tangentY * anchorOffset + anchorShift.y;

    // User requested: Start at 9 o'clock, End at 11 o'clock (relative to handle at 12).
    // Handle is at `angleDeg`.
    // 9 o'clock is -90 degrees relative to 12.
    // 11 o'clock is -30 degrees relative to 12.

    // Offsets in degrees
    const startOffset = -90; // Tail
    const endOffset = -30;   // Head

    const startAngle = ((angleDeg + startOffset) * Math.PI) / 180;
    const endAngle = ((angleDeg + endOffset) * Math.PI) / 180;

    // Start point
    const startX = centerX + radius * Math.cos(startAngle) + anchorShiftX;
    const startY = centerY + radius * Math.sin(startAngle) + anchorShiftY;

    // End point - pull back slightly from the circle edge so arrow is visible
    const endX = centerX + (radius - 5) * Math.cos(endAngle) + anchorShiftX;
    const endY = centerY + (radius - 5) * Math.sin(endAngle) + anchorShiftY;

    // Control Points
    // Default bulge angles; can be overridden by edge `data` via dragging.
    const defaultControl = useMemo(() => {
        const bulgeAngle1 = ((angleDeg - 85) * Math.PI) / 180;
        const bulgeAngle2 = ((angleDeg - 35) * Math.PI) / 180;
        // Bring self-loop handles closer to the loop
        const cpDist = 40; // How far out
        return {
            c1: {
                x: centerX + (radius + cpDist) * Math.cos(bulgeAngle1) + anchorShiftX,
                y: centerY + (radius + cpDist) * Math.sin(bulgeAngle1) + anchorShiftY,
            },
            c2: {
                x: centerX + (radius + cpDist) * Math.cos(bulgeAngle2) + anchorShiftX,
                y: centerY + (radius + cpDist) * Math.sin(bulgeAngle2) + anchorShiftY,
            },
        };
    }, [angleDeg, centerX, centerY, anchorShiftX, anchorShiftY]);

    const c1 = data?.c1 || defaultControl.c1;
    const c2 = data?.c2 || defaultControl.c2;

<<<<<<< HEAD
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

    // Optimize: Use refs for mutable values
    const pointers = React.useRef({ localC1, localC2 });
    useEffect(() => {
        pointers.current = { localC1, localC2 };
    }, [localC1, localC2]);

    // Use local points for rendering
    const renderC1 = dragging ? localC1 : c1;
    const renderC2 = dragging ? localC2 : c2;

    // Recalculate edge path with render points
    const edgePath = `M ${startX} ${startY} C ${renderC1.x} ${renderC1.y}, ${renderC2.x} ${renderC2.y}, ${endX} ${endY}`;

    // Label position: Middle of the loop CPs roughly
    const labelX = (startX + renderC1.x + renderC2.x + endX) / 4;
    const labelY = (startY + renderC1.y + renderC2.y + endY) / 4;

    useEffect(() => {
        if (!dragging) return;

        function onMove(e) {
            const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });

            // Update local state ONLY
            if (dragging === 'c1') setLocalC1({ x: p.x, y: p.y });
            if (dragging === 'c2') setLocalC2({ x: p.x, y: p.y });
        }

        function onUp() {
            setEdges((eds) => eds.map((edge) => {
                if (edge.id !== id) return edge;
                const next = { ...(edge.data || {}) };
                next[dragging] = dragging === 'c1' ? pointers.current.localC1 : pointers.current.localC2;
                return { ...edge, data: next };
            }));
            setDragging(null);
        }
=======
    const edgePath = `M ${startX} ${startY} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${endX} ${endY}`;

    // Label position: Middle of the loop CPs roughly
    const labelX = (startX + c1.x + c2.x + endX) / 4;
    const labelY = (startY + c1.y + c2.y + endY) / 4;

    const { screenToFlowPosition, setEdges } = useReactFlow();
    const [dragging, setDragging] = useState(null); // 'c1' | 'c2' | null
    const [showHandles, setShowHandles] = useState(false);

    useEffect(() => {
        function onMove(e) {
            if (!dragging) return;
            const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            setEdges((eds) => eds.map((edge) => {
                if (edge.id !== id) return edge;
                const next = { ...(edge.data || {}) };
                next[dragging] = { x: p.x, y: p.y };
                return { ...edge, data: next };
            }));
        }
        function onUp() { setDragging(null); }
>>>>>>> origin/main

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [dragging, id, screenToFlowPosition, setEdges]);

    const handleStyle = (x, y) => ({
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        width: 12,
        height: 12,
        borderRadius: 6,
        // Always orange for visibility
        background: '#f39c12',
        border: '2px solid #2c3e50',
        cursor: 'grab',
        boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
        pointerEvents: 'all',
        zIndex: 1000, // ensure above nodes
    });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        onMouseEnter={() => setShowHandles(true)}
                        onMouseLeave={() => setShowHandles(false)}
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            background: '#fff',
                            padding: '2px 4px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            pointerEvents: 'all',
                            border: '1px solid #ccc'
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
<<<<<<< HEAD
                        style={handleStyle(renderC1.x, renderC1.y)}
=======
                        style={handleStyle(c1.x, c1.y)}
>>>>>>> origin/main
                        onPointerDown={() => setDragging('c1')}
                        className="nodrag nopan react-flow__edge-label"
                        title="Drag to adjust loop"
                    />
                    <div
<<<<<<< HEAD
                        style={handleStyle(renderC2.x, renderC2.y)}
=======
                        style={handleStyle(c2.x, c2.y)}
>>>>>>> origin/main
                        onPointerDown={() => setDragging('c2')}
                        className="nodrag nopan react-flow__edge-label"
                        title="Drag to adjust loop"
                    />
                </EdgeLabelRenderer>
            )}
        </>
    );
}
