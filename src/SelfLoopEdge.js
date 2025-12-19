import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
export default function SelfLoopEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
}) {
    // Node geometry (assuming radius 30px from App.js styling)
    const radius = 30;

    // sourceX/sourceY are at the handle position (Top Center).
    // The node center is radius distance below the handle.
    const centerX = sourceX;
    const centerY = sourceY + radius;
    // Calculate angles for ~11 o'clock (235 deg) and ~1 o'clock (305 deg)
    // Tighter angles to make the loop "thinner" horizontally but still avoid top center.
    // 12 o'clock = 270. 
    // -45 deg -> 225 deg (Top Left)
    // +45 deg -> 315 deg (Top Right)
    // We adjust slightly to 235 and 305 to be closer to 11 and 1.
    const angle1 = (235 * Math.PI) / 180;
    const angle2 = (305 * Math.PI) / 180;
    // Start point
    const startX = centerX + radius * Math.cos(angle1);
    const startY = centerY + radius * Math.sin(angle1);
    // End point
    const endX = centerX + radius * Math.cos(angle2);
    const endY = centerY + radius * Math.sin(angle2);
    // Control points: 
    // To make it "thin" (not sticking out too much), reduce controlDist.
    // To make it loop nicely, bias X coords slightly outwards.
    const controlDist = 30;
    // Tighter control points for a thinner loop
    const cp1X = startX - 10;
    const cp1Y = startY - controlDist;
    const cp2X = endX + 10;
    const cp2Y = endY - controlDist;
    const edgePath = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    // Label position: Center top of the loop
    const labelX = (startX + endX) / 2;
    const labelY = Math.min(cp1Y, cp2Y) - 5;
    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            {label && (
                <EdgeLabelRenderer>
                    <div
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
                        className="nodrag nopan"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
