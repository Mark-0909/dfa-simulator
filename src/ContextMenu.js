import React from 'react';

export default function ContextMenu({
    id,
    top,
    left,
    right,
    bottom,
    onMouseLeave,
    onClick,
    ...props
}) {
    return (
        <div
            style={{
                top,
                left,
                right,
                bottom,
                position: 'absolute',
                zIndex: 10,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                padding: '5px 0',
                minWidth: '150px',
            }}
            {...props}
            onMouseLeave={onMouseLeave}
        >
            <button
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#e74c3c'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
                onClick={() => onClick('delete', id)}
            >
                Delete Node
            </button>
            <button
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
                onClick={() => onClick('final', id)}
            >
                Toggle Final State
            </button>
        </div>
    );
}
