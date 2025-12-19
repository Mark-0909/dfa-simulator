import React from 'react';
import { BaseEdge, EdgeLabelRenderer, useNodesData } from '@xyflow/react';

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
}) {
    // Get the source node data to find the current rotation angle
    const nodesData = useNodesData(source);
    // Default to -90 (Top) if not found
    const angleDeg = nodesData?.data?.angle !== undefined ? nodesData.data.angle : -90;
    const angleRad = (angleDeg * Math.PI) / 180;

    // Node geometry
    const radius = 30;

    // Calculate CenterX/CenterY based on Handle Position
    const centerX = sourceX - radius * Math.cos(angleRad);
    const centerY = sourceY - radius * Math.sin(angleRad);

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
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);

    // End point
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    // Control Points
    // We want the loop to bulge out between 9 and 11 (around 10 o'clock, -60 degrees).
    // Let's bias CPs towards -80 (Left-ish) and -40 (Top-ish) relative to handle.



    // But we need to bulge OUTWARDS.
    // Actually, simple Bezier logic:
    // CP1: Start + Vector perpendicular to radius? No.
    // Let's project outwards radially but rotated slightly towards the loop body.

    // Try bulging at -60 deg offset
    const bulgeAngle1 = ((angleDeg - 75) * Math.PI) / 180;
    const bulgeAngle2 = ((angleDeg - 45) * Math.PI) / 180;

    const cpDist = 45; // How far out

    const cp1X = centerX + (radius + cpDist) * Math.cos(bulgeAngle1);
    const cp1Y = centerY + (radius + cpDist) * Math.sin(bulgeAngle1);

    const cp2X = centerX + (radius + cpDist) * Math.cos(bulgeAngle2);
    const cp2Y = centerY + (radius + cpDist) * Math.sin(bulgeAngle2);

    const edgePath = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

    // Label position: Middle of the loop CPs roughly
    const labelX = (startX + cp1X + cp2X + endX) / 4;
    const labelY = (startY + cp1Y + cp2Y + endY) / 4;

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
