import React, { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';

const nodeStyle = {
    borderRadius: '50%', width: 60, height: 60,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', border: '2px solid #2c3e50',
    fontWeight: 'bold', fontSize: '14px',
    position: 'relative',
    // Ensure we don't get squashed
    minWidth: 60, minHeight: 60
};

const finalStyle = { ...nodeStyle, border: '5px double #2c3e50' };

export default function CircularNode({ data, id, selected }) {
    const updateNodeInternals = useUpdateNodeInternals();
    const angle = data.angle !== undefined ? data.angle : -90;
    const rad = (angle * Math.PI) / 180;

    // Calculate handle position on the rim (0 to 100%)
    // Center is 50%, 50%
    // x = 50 + 50 * cos
    const handleX = 50 + 50 * Math.cos(rad);
    const handleY = 50 + 50 * Math.sin(rad);

    useEffect(() => {
        updateNodeInternals(id);
    }, [angle, id, updateNodeInternals]);

    const isFinal = data.isFinal;
    const style = isFinal ? finalStyle : nodeStyle;

    // Drag Logic
    const handleMouseDown = (e) => {
        e.stopPropagation(); // Prevent node drag
        e.preventDefault();

        const onMouseMove = (moveEvent) => {
            // Calculate angle relative to node center
            // We need the node's screen position? 
            // Actually, we can just use the target element's center if we have ref, 
            // or basic math if we assume the mouse started on the handle.

            // Better: Get the node center. 
            // We can use the event target's closest .react-flow__node 
            const nodeEl = e.target.closest('.react-flow__node');
            if (!nodeEl) return;

            const rect = nodeEl.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = moveEvent.clientX - centerX;
            const dy = moveEvent.clientY - centerY;

            let deg = Math.atan2(dy, dx) * (180 / Math.PI);
            if (deg < 0) deg += 360;

            if (data.onAngleChange) {
                data.onAngleChange(deg);
            }
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div style={{ ...style, borderColor: selected ? '#3498db' : '#2c3e50' }}>
            {data.label}

            {/* Handle Container - clickable for rotation */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: `${handleX}%`,
                    top: `${handleY}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 12, height: 12,
                    background: 'transparent', // Larger hit area?
                    cursor: 'crosshair',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="nodrag">
                {/* Visible Handle Dot */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff0072' }} />

                {/* Actual RF Handles (hidden/stacked) */}
                <Handle
                    type="source"
                    position={Position.Top}
                    id="a"
                    style={{
                        opacity: 0,
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                    }}
                />
                <Handle
                    type="target"
                    position={Position.Top}
                    id="b"
                    style={{
                        opacity: 0,
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                    }}
                />
            </div>
        </div>
    );
}
