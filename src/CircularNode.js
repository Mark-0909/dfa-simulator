import React, { useEffect, useState } from 'react';
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

const baseAngles = [-90, 0, 90, 180]; // degrees

export default function CircularNode({ data, id, selected }) {
    const updateNodeInternals = useUpdateNodeInternals();
    const [animationFrame, setAnimationFrame] = useState(0);

    // Support multiple handles around the circle
    // number of handles intentionally implicit (derived from angles array)

    const angles = data.angles || baseAngles;

    const prevAngles = React.useRef(angles);
    useEffect(() => {
        if (prevAngles.current !== angles) {
            updateNodeInternals(id);
            prevAngles.current = angles;
        }
    }, [angles, id, updateNodeInternals]);

    // Animation loop for start pulse
    useEffect(() => {
        const startPulseActive = data.startPulse && Date.now() - data.startPulse < (data.startPulseDuration || 700);
        if (!startPulseActive) return;

        let raf = null;
        const step = () => {
            setAnimationFrame(prev => prev + 1);
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);

        return () => {
            if (raf) cancelAnimationFrame(raf);
        };
    }, [data.startPulse, data.startPulseDuration]);

    const isFinal = data.isFinal;
    const style = isFinal ? finalStyle : nodeStyle;

    // Calculate start pulse dot position and opacity for arrow
    const startPulseActive = data.startPulse && Date.now() - data.startPulse < (data.startPulseDuration || 700);
    const pulseDuration = data.startPulseDuration || 700;
    const pulseProgress = startPulseActive ? (Date.now() - data.startPulse) / pulseDuration : 0;
    // Animate dot from left (x=0) to right (x=24) along arrow
    const dotX = pulseProgress * 24;
    const dotOpacity = startPulseActive ? 0.9 - 0.6 * (1 - pulseProgress) : 0;
    const dotRadius = startPulseActive ? 5 * (1 + 0.25 * Math.sin(pulseProgress * Math.PI * 2)) : 5;

    return (
        <div style={{ ...style, borderColor: selected ? '#3498db' : '#2c3e50', position: 'relative' }}>
            {/* Start arrow for initial state q0 */}
            {data?.label === 'q0' && (
                <svg
                    width={28}
                    height={14}
                    style={{ position: 'absolute', left: -28, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    aria-hidden="true"
                >
                    <defs>
                        <marker id={`start-arrow-${id}`}
                                markerWidth="6"
                                markerHeight="6"
                                refX="6"
                                refY="3"
                                orient="auto">
                            <path d="M0,0 L6,3 L0,6 z" fill="#2c3e50" />
                        </marker>
                    </defs>
                    {/* Main arrow line */}
                    <line x1="0" y1="7" x2="24" y2="7" stroke="#2c3e50" strokeWidth="1.5" markerEnd={`url(#start-arrow-${id})`} />
                    {/* Green dot pulse traveling along arrow */}
                    {startPulseActive && (
                        <>
                            <circle cx={dotX} cy="7" r={dotRadius} fill="#2ecc71" stroke="#fff" strokeWidth="1" opacity={dotOpacity} />
                        </>
                    )}
                </svg>
            )}
            {data.label}

            {/* Render multiple handles around the circle */}
            {angles.map((angle, idx) => {
                const rad = (angle * Math.PI) / 180;
                const handleX = 50 + 50 * Math.cos(rad);
                const handleY = 50 + 50 * Math.sin(rad);

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
