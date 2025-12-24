import React, { useMemo, useState, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, useNodesData, useReactFlow } from '@xyflow/react';
import BezierPulse from './BezierPulse';

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
    // No local pulse state here; use `BezierPulse` component for animation
    // Access React Flow API early so helpers are available for geometry
    const { screenToFlowPosition, setEdges } = useReactFlow();
    // Get the source node data to find the current rotation angle
    const nodesData = useNodesData(source);
    // Base anchor angle from node (where the handle sits)
    const anchorAngleDeg = nodesData?.data?.angle !== undefined ? nodesData.data.angle : -90;
    const anchorAngleRad = (anchorAngleDeg * Math.PI) / 180;

    // Loop-specific angle (can be rotated independently of the node anchor)
    // Keep self-loop orientation independent of node handle selection
    const loopAngleDeg = data?.loopAngle !== undefined ? data.loopAngle : -90;
    const loopAngleRad = (loopAngleDeg * Math.PI) / 180;
    const anchorOffset = 0;
    const anchorShift = { x: 0, y: 0 }; // keep loop attached to node with no gap

    // Node geometry
    const radius = 38;

    // Calculate CenterX/CenterY based on the cardinal handle so rotation follows the state
    let centerX;
    let centerY;
    switch (sourcePosition) {
        case 'Top':
        case 'top':
            centerX = sourceX;
            centerY = sourceY + radius;
            break;
        case 'Right':
        case 'right':
            centerX = sourceX - radius;
            centerY = sourceY;
            break;
        case 'Bottom':
        case 'bottom':
            centerX = sourceX;
            centerY = sourceY - radius;
            break;
        case 'Left':
        case 'left':
            centerX = sourceX + radius;
            centerY = sourceY;
            break;
        default:
            centerX = sourceX - radius * Math.cos(anchorAngleRad);
            centerY = sourceY - radius * Math.sin(anchorAngleRad);
            break;
    }

    // Offset loop anchor sideways to spread overlapping loops from same source and allow manual drag shift
    const tangentX = Math.sin(loopAngleRad);
    const tangentY = -Math.cos(loopAngleRad);
    const anchorShiftX = tangentX * anchorOffset + anchorShift.x;
    const anchorShiftY = tangentY * anchorOffset + anchorShift.y;

    // User requested: Start at 9 o'clock, End at 11 o'clock (relative to handle at 12).
    // Handle is at `angleDeg`.
    // 9 o'clock is -90 degrees relative to 12.
    // 11 o'clock is -30 degrees relative to 12.

    // Offsets in degrees
    const startOffset = -90; // Tail
    const endOffset = -30;   // Head

    const startAngle = ((loopAngleDeg + startOffset) * Math.PI) / 180;
    const endAngle = ((loopAngleDeg + endOffset) * Math.PI) / 180;

    // Start point - just inside the circle edge for a tighter touch
    const startX = centerX + (radius - 4) * Math.cos(startAngle) + anchorShiftX;
    const startY = centerY + (radius - 4) * Math.sin(startAngle) + anchorShiftY;

    // End point - just inside the circle edge so the arrow tip meets the state outline
    const endX = centerX + (radius - 4) * Math.cos(endAngle) + anchorShiftX;
    const endY = centerY + (radius - 4) * Math.sin(endAngle) + anchorShiftY;

    // Control Points
    // Default bulge angles; can be overridden by edge `data` via dragging.
    const defaultControl = useMemo(() => {
        const bulgeAngle1 = ((loopAngleDeg - 85) * Math.PI) / 180;
        const bulgeAngle2 = ((loopAngleDeg - 35) * Math.PI) / 180;
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
    }, [loopAngleDeg, centerX, centerY, anchorShiftX, anchorShiftY]);

    const c1 = data?.c1 || defaultControl.c1;
    const c2 = data?.c2 || defaultControl.c2;

    const edgePath = `M ${startX} ${startY} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${endX} ${endY}`;

    // Label position: Middle of the loop CPs roughly
    const labelX = (startX + c1.x + c2.x + endX) / 4;
    const labelY = (startY + c1.y + c2.y + endY) / 4;

    
    const [dragging, setDragging] = useState(null); // 'c1' | 'c2' | 'angle' | null
    const [showHandles, setShowHandles] = useState(false);
    // Animation is handled by the BezierPulse component; no local effects required.

    useEffect(() => {
        if (!dragging) return;

        function onMove(e) {
            const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });

            if (dragging === 'c1' || dragging === 'c2') {
                setEdges((eds) => eds.map((edge) => {
                    if (edge.id !== id) return edge;
                    const next = { ...(edge.data || {}) };
                    next[dragging] = { x: p.x, y: p.y };
                    return { ...edge, data: next };
                }));
                return;
            }

            if (dragging === 'angle') {
                const dx = p.x - centerX;
                const dy = p.y - centerY;
                const newAngle = Math.atan2(dy, dx) * (180 / Math.PI);

                setEdges((eds) => eds.map((edge) => {
                    if (edge.id !== id) return edge;
                    const next = { ...(edge.data || {}), loopAngle: newAngle };
                    delete next.c1;
                    delete next.c2;
                    return { ...edge, data: next };
                }));
            }
        }

        function onUp() { setDragging(null); }

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [dragging, id, screenToFlowPosition, setEdges, centerX, centerY]);

    const handleStyle = (x, y) => ({
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        width: 12,
        height: 12,
        borderRadius: 6,
        // Always orange for visibility on control points
        background: '#f39c12',
        border: '2px solid #2c3e50',
        cursor: 'grab',
        boxShadow: '0 0 0 2px rgba(255,255,255,0.8)',
        pointerEvents: 'all',
        zIndex: 10000, // ensure above all contents
    });

    // Rotation handle: visible rotate icon; still draggable
    const rotationHandleStyle = (x, y) => ({
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23666\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"1 4 1 10 7 10\"/><path d=\"M3.51 15a9 9 0 1 0 2.13-9.36L1 10\"/></svg>')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '80% 80%',
        border: '1px solid #ccc',
        cursor: 'grab',
        pointerEvents: 'all',
        zIndex: 1000,
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
    });

    // Rotation handle sits outside the loop; drag to rotate the loop around the node
    const rotationHandleRadius = radius + 24;
    const rotationHandleX = centerX + rotationHandleRadius * Math.cos(loopAngleRad);
    const rotationHandleY = centerY + rotationHandleRadius * Math.sin(loopAngleRad);

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {/* One-shot pulse animation along the loop when `data.animatePulse` changes.
                Use inline SMIL `animateMotion` with a direct `path` attribute (matches LandingPage approach).
            */}
            {data && data.animatePulse && (
                <BezierPulse duration={data?.animatePulseDuration || 700} pathPoints={{
                    p0: { x: startX, y: startY },
                    c1: { x: c1.x, y: c1.y },
                    c2: { x: c2.x, y: c2.y },
                    p3: { x: endX, y: endY }
                }} />
            )}
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
                            border: '1px solid #ccc',
                            zIndex: 10000
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
                        style={handleStyle(c1.x, c1.y)}
                        onPointerDown={() => setDragging('c1')}
                        className="nodrag nopan react-flow__edge-label"
                        title="Drag to adjust loop"
                    />
                    <div
                        style={handleStyle(c2.x, c2.y)}
                        onPointerDown={() => setDragging('c2')}
                        className="nodrag nopan react-flow__edge-label"
                        title="Drag to adjust loop"
                    />
                    <div
                        style={rotationHandleStyle(rotationHandleX, rotationHandleY)}
                        onPointerDown={() => setDragging('angle')}
                        className="nodrag nopan react-flow__edge-label"
                        title="Drag to rotate loop around state"
                    />
                </EdgeLabelRenderer>
            )}
        </>
    );
}