import React, { useState, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  ReactFlowProvider,
  applyEdgeChanges, 
  applyNodeChanges,
  MarkerType,
  addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- STYLING (Based on Lesson 6 Formalisms) ---
const nodeStyle = {
  borderRadius: '50%', width: 60, height: 60,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backgroundColor: '#fff', border: '2px solid #2c3e50', 
  fontWeight: 'bold', fontSize: '14px'
};

const finalStyle = { ...nodeStyle, border: '5px double #2c3e50' };

function AutomataSimulator() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeCount, setNodeCount] = useState(0);
  const [startState, setStartState] = useState('');
  const [acceptingStates, setAcceptingStates] = useState(new Set());
  const [testString, setTestString] = useState('');
  const [testResult, setTestResult] = useState('');

  const onNodesChange = useCallback((chs) => setNodes((nds) => applyNodeChanges(chs, nds)), []);
  const onEdgesChange = useCallback((chs) => setEdges((eds) => applyEdgeChanges(chs, eds)), []);
  
  // --- IMPROVED CONNECTION LOGIC (Handles Self-Loops Visually) ---
  const onConnect = useCallback((params) => {
    const label = prompt('Enter transition symbol (e.g., a or b):');
    if (!label) return;

    const isSelfLoop = params.source === params.target;
    
    const newEdge = {
      ...params,
      id: `e-${params.source}-${params.target}-${Date.now()}`,
      label,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#2c3e50' },
      style: { strokeWidth: 2, stroke: '#2c3e50' },
    };

    if (isSelfLoop) {
      // Force self-loops to use a Bezier curve attached to the top
      setEdges((eds) => addEdge({
        ...newEdge,
        type: 'bezier',
        sourceHandle: 't', // 't' for top handle
        targetHandle: 't',
        curvature: 3,      // Higher value makes the loop more prominent
      }, eds));
    } else {
      setEdges((eds) => addEdge({ ...newEdge, type: 'smoothstep' }, eds));
    }
  }, []);

  // --- MANUAL SELF-LOOP BUTTON ---
  const addSelfLoop = () => {
    const stateId = prompt('Enter state ID for self-loop (e.g., q0):');
    if (!stateId) return;
    
    const stateExists = nodes.find(n => n.id === stateId);
    if (!stateExists) return alert(`State ${stateId} not found!`);

    const label = prompt('Enter transition symbol:');
    if (label) {
      setEdges((eds) => [...eds, {
        id: `self-${stateId}-${Date.now()}`,
        source: stateId,
        target: stateId,
        label,
        type: 'bezier',
        sourceHandle: 't',
        targetHandle: 't',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 }
      }]);
    }
  };

  const addState = () => {
    const id = `q${nodeCount}`;
    const newNode = {
      id,
      data: { label: id },
      position: { x: 100 + nodeCount * 150, y: 150 },
      style: nodeStyle,
      // Provide explicit top handle for self-loops
      sourcePosition: 'top',
      targetPosition: 'top'
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeCount(nodeCount + 1);
    if (startState === '') setStartState(id);
  };

  const toggleAccepting = (stateId) => {
    const newAccepting = new Set(acceptingStates);
    if (newAccepting.has(stateId)) newAccepting.delete(stateId);
    else newAccepting.add(stateId);
    
    setAcceptingStates(newAccepting);
    setNodes((nds) => nds.map((node) => ({
      ...node,
      style: newAccepting.has(node.id) ? finalStyle : nodeStyle,
    })));
  };

  const testDFA = () => {
    if (!startState) return setTestResult('⚠️ Set a start state first.');
    let current = startState;
    const input = testString.trim();

    for (let char of input) {
      const edge = edges.find(e => 
        e.source === current && e.label.split(',').map(s => s.trim()).includes(char)
      );
      if (!edge) {
        setTestResult(`❌ Rejected at ${current}: No transition for '${char}'`);
        return;
      }
      current = edge.target;
    }

    if (acceptingStates.has(current)) setTestResult(`✅ Accepted! Ended in ${current}`);
    else setTestResult(`❌ Rejected: Ended in non-final state ${current}`);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f6fa' }}>
      <header style={{ padding: '20px', background: '#2c3e50', color: '#fff' }}>
        <h2 style={{ margin: 0 }}>DFA Framework Simulator</h2>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button onClick={addState} style={btnStyle('#1abc9c')}>Add State</button>
          <button onClick={addSelfLoop} style={btnStyle('#9b59b6')}>Add Self-Loop</button>
          <input 
            value={testString} 
            onChange={e => setTestString(e.target.value)} 
            placeholder="Test string (e.g. aaab)" 
            style={{ padding: '8px', borderRadius: '4px' }}
          />
          <button onClick={testDFA} style={btnStyle('#3498db')}>Test</button>
        </div>
        {testResult && <div style={{ marginTop: '10px', fontWeight: 'bold' }}>{testResult}</div>}
      </header>

      <div style={{ flexGrow: 1 }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect}
          onNodeClick={(_, n) => toggleAccepting(n.id)}
          fitView
        >
          <Background variant="dots" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' });

export default function App() {
  return <ReactFlowProvider><AutomataSimulator /></ReactFlowProvider>;
}