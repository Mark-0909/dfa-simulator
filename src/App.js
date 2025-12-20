import React, { useState, useCallback, useEffect } from 'react';
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
import SelfLoopEdge from './SelfLoopEdge';
import CircularNode from './CircularNode';

// --- STYLING (Based on Lesson 6 Formalisms) ---
const nodeStyle = {
  borderRadius: '50%', width: 60, height: 60,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backgroundColor: '#fff', border: '2px solid #2c3e50',
  fontWeight: 'bold', fontSize: '14px'
};

const finalStyle = { ...nodeStyle, border: '5px double #2c3e50' };

const edgeTypes = {
  selfLoop: SelfLoopEdge,
};

const nodeTypes = {
  circular: CircularNode,
};

function AutomataSimulator() {
  const [nodes, setNodes] = useState([
    { id: 'q0', type: 'circular', position: { x: 100, y: 150 }, data: { label: 'q0', angle: -90 }, style: nodeStyle },
    { id: 'q1', type: 'circular', position: { x: 250, y: 150 }, data: { label: 'q1', angle: -90, isFinal: true }, style: finalStyle },
    { id: 'q2', type: 'circular', position: { x: 400, y: 150 }, data: { label: 'q2', angle: -90, isFinal: true }, style: finalStyle },
  ]);

  // Attach angle change handler to initial nodes
  useEffect(() => {
    setNodes((nds) => nds.map(n => ({
      ...n,
      data: { ...n.data, onAngleChange: (a) => updateNodeAngle(n.id, a) }
    })));
  }, []);


  const [edges, setEdges] = useState([
    { id: 'e1', source: 'q0', target: 'q1', label: 'a', style: { strokeWidth: 2, stroke: '#2c3e50' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2c3e50' }, type: 'smoothstep' },
    { id: 'e2', source: 'q0', target: 'q2', label: 'b', style: { strokeWidth: 2, stroke: '#2c3e50' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2c3e50' }, type: 'smoothstep' }
  ]);
  const [nodeCount, setNodeCount] = useState(3);
  const [startState, setStartState] = useState('q0');
  const [acceptingStates, setAcceptingStates] = useState(new Set(['q1', 'q2']));
  const [testString, setTestString] = useState('aa');
  const [testResult, setTestResult] = useState('');

  const [showSelfLoopModal, setShowSelfLoopModal] = useState(false);
  const [selectedNodeForLoop, setSelectedNodeForLoop] = useState('');
  const [loopLabel, setLoopLabel] = useState('');

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
        type: 'selfLoop',
      }, eds));
    } else {
      setEdges((eds) => addEdge({ ...newEdge, type: 'smoothstep' }, eds));
    }
  }, []);

  // --- MANUAL SELF-LOOP BUTTON ---
  const addSelfLoop = () => {
    // Determine the default node to select (e.g., the first one or the last added)
    // If we have nodes, default to the first one.
    if (nodes.length > 0) {
      setSelectedNodeForLoop(nodes[0].id);
    }
    setLoopLabel('');
    setShowSelfLoopModal(true);
  };

  const handleSaveSelfLoop = () => {
    if (!selectedNodeForLoop) {
      alert('Please select a state.');
      return;
    }
    if (!loopLabel) {
      alert('Please enter a transition symbol.');
      return;
    }

    setEdges((eds) => [...eds, {
      id: `self-${selectedNodeForLoop}-${Date.now()}`,
      source: selectedNodeForLoop,
      target: selectedNodeForLoop,
      label: loopLabel,
      type: 'selfLoop',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 }
    }]);

    setShowSelfLoopModal(false);
  };

  const addState = () => {
    const id = `q${nodeCount}`;
    const newNode = {
      id,
      type: 'circular',
      data: { label: id, angle: -90, onAngleChange: (a) => updateNodeAngle(id, a) },
      position: { x: 100 + nodeCount * 150, y: 150 },
      style: nodeStyle
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

  const updateNodeAngle = (id, angle) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, angle: Number(angle) } };
      }
      return n;
    }));
  };



  const testDFA = () => {
    if (!startState) return setTestResult('⚠️ Set a start state first.');
    let current = startState;
    const input = testString.trim();
    let path = [current];

    for (let char of input) {
      const loopCurrent = current;
      const edge = edges.find(e =>
        e.source === loopCurrent && e.label.split(',').map(s => s.trim()).includes(char)
      );
      if (!edge) {
        setTestResult(`❌ Rejected at ${current} (Path: ${path.join('->')}): No transition for '${char}'`);
        return;
      }
      current = edge.target;
      path.push(current);
    }

    if (acceptingStates.has(current)) setTestResult(`✅ Accepted! Ended in ${current} (Path: ${path.join('->')})`);
    else setTestResult(`❌ Rejected: Ended in non-final state ${current} (Path: ${path.join('->')})`);
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
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => {
            // Toggle accepting logic
            toggleAccepting(n.id);
          }}
          fitView
        >
          <Background variant="dots" />
          <Controls />
        </ReactFlow>
      </div>

      {showSelfLoopModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Add Self Loop</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Select State:</label>
              <select
                value={selectedNodeForLoop}
                onChange={(e) => setSelectedNodeForLoop(e.target.value)}
                style={inputStyle}
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.data.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Transition Symbol:</label>
              <input
                type="text"
                value={loopLabel}
                onChange={(e) => setLoopLabel(e.target.value)}
                placeholder="e.g. a, b"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowSelfLoopModal(false)} style={btnStyle('#95a5a6')}>Cancel</button>
              <button onClick={handleSaveSelfLoop} style={btnStyle('#2ecc71')}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = (bg) => ({ background: bg, color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' });
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalContentStyle = {
  background: '#fff', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

export default function App() {
  return <ReactFlowProvider><AutomataSimulator /></ReactFlowProvider>;
}