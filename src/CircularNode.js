import React, { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';

const nodeStyle = {
    borderRadius: '50%', width: 60, height: 60,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    // Transparent fill so edges are never visually covered
    backgroundColor: 'transparent', border: '2px solid #2c3e50',
    fontWeight: 'bold', fontSize: '14px',
    position: 'relative',
    // Ensure we don't get squashed
    minWidth: 60, minHeight: 60
};

const finalStyle = { ...nodeStyle, boxShadow: 'inset 0 0 0 2px #2c3e50', backgroundColor: 'transparent' };
<<<<<<< HEAD

const baseAngles = [-90, 0, 90, 180]; // degrees

export default function CircularNode({ data, id, selected }) {
    const updateNodeInternals = useUpdateNodeInternals();

    // Support multiple handles around the circle
    const numHandles = 4; // top, right, bottom, left
=======

export default function CircularNode({ data, id, selected }) {
    const updateNodeInternals = useUpdateNodeInternals();
    
    // Support multiple handles around the circle
    const numHandles = 4; // top, right, bottom, left
    const baseAngles = [-90, 0, 90, 180]; // degrees
    
    const angles = data.angles || baseAngles;
>>>>>>> origin/main

    const angles = data.angles || baseAngles;

    const prevAngles = React.useRef(angles);
    useEffect(() => {
<<<<<<< HEAD
        if (prevAngles.current !== angles) {
            updateNodeInternals(id);
            prevAngles.current = angles;
        }
=======
        updateNodeInternals(id);
>>>>>>> origin/main
    }, [angles, id, updateNodeInternals]);

    const isFinal = data.isFinal;
    const style = isFinal ? finalStyle : nodeStyle;

    return (
        <div style={{ ...style, borderColor: selected ? '#3498db' : '#2c3e50' }}>
            {data.label}

            {/* Render multiple handles around the circle */}
            {angles.map((angle, idx) => {
                const rad = (angle * Math.PI) / 180;
                const handleX = 50 + 50 * Math.cos(rad);
                const handleY = 50 + 50 * Math.sin(rad);
<<<<<<< HEAD

                const handleMouseDownForHandle = (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    const onMouseMove = (moveEvent) => {
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
                            data.onAngleChange(deg, idx);
                        }
                    };

                    const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                    };

                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                };

                // Determine the nearest cardinal Position for the RF Handle
                const deg = ((angle % 360) + 360) % 360;
                let handlePosition = Position.Top;
                if (deg >= 315 || deg < 45) handlePosition = Position.Right;
                else if (deg >= 45 && deg < 135) handlePosition = Position.Bottom;
                else if (deg >= 135 && deg < 225) handlePosition = Position.Left;
                else handlePosition = Position.Top;

=======
                
                const handleMouseDownForHandle = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const onMouseMove = (moveEvent) => {
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
                            data.onAngleChange(deg, idx);
                        }
                    };
                    
                    const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                    };
                    
                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                };
                
                // Determine the nearest cardinal Position for the RF Handle
                const deg = ((angle % 360) + 360) % 360;
                let handlePosition = Position.Top;
                if (deg >= 315 || deg < 45) handlePosition = Position.Right;
                else if (deg >= 45 && deg < 135) handlePosition = Position.Bottom;
                else if (deg >= 135 && deg < 225) handlePosition = Position.Left;
                else handlePosition = Position.Top;

>>>>>>> origin/main
                return (
                    <div
                        key={`handle-${idx}`}
                        onMouseDown={handleMouseDownForHandle}
                        style={{
                            position: 'absolute',
                            left: `${handleX}%`,
                            top: `${handleY}%`,
                            transform: 'translate(-50%, -50%)',
                            width: 12, height: 12,
                            background: 'transparent',
                            cursor: 'crosshair',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        className="nodrag">
                        {/* Visible Handle Dot */}
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34495e' }} />
<<<<<<< HEAD

=======
                        
>>>>>>> origin/main
                        {/* Actual RF Handles (hidden/stacked) */}
                        <Handle
                            type="source"
                            position={handlePosition}
                            id={`source-${idx}`}
                            style={{
                                opacity: 0,
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                            }}
                        />
                        <Handle
                            type="target"
                            position={handlePosition}
                            id={`target-${idx}`}
                            isConnectableStart={false}
                            style={{
                                opacity: 0,
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
