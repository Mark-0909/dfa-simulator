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
import AdjustableBezierEdge from './AdjustableBezierEdge';
import CircularNode from './CircularNode';
import ContextMenu from './ContextMenu';

// --- STYLING (Based on Lesson 6 Formalisms) ---
const nodeStyle = {
  borderRadius: '50%', width: 60, height: 60,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  // Make node fill semi-transparent so edges remain visible underneath
  backgroundColor: 'rgba(255,255,255,0.6)', border: '2px solid #2c3e50',
  fontWeight: 'bold', fontSize: '14px'
};

const finalStyle = { ...nodeStyle, border: '5px double #2c3e50' };

const edgeTypes = {
  selfLoop: SelfLoopEdge,
  adjustableBezier: AdjustableBezierEdge,
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
    // The mapping creates closure handlers per-node. Disable the eslint
    // rule here because each handler intentionally captures the node id.
    // eslint-disable-next-line no-loop-func
    setNodes((nds) => nds.map(n => ({
      ...n,
      data: { ...n.data, onAngleChange: (a) => updateNodeAngle(n.id, a) }
    })));
  }, []);


  const baseEdges = [
    { id: 'e1', source: 'q0', target: 'q1', label: 'a', style: { strokeWidth: 2, stroke: '#2c3e50' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2c3e50' }, type: 'adjustableBezier' },
    { id: 'e2', source: 'q0', target: 'q2', label: 'b', style: { strokeWidth: 2, stroke: '#2c3e50' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2c3e50' }, type: 'adjustableBezier' }
  ];

  const applyEdgeOffsets = useCallback((eds) => {
    const bySource = new Map();
    eds.forEach((e) => {
      if (!bySource.has(e.source)) bySource.set(e.source, []);
      bySource.get(e.source).push(e);
    });

    const result = [];
    bySource.forEach((arr) => {
      arr.sort((a, b) => a.id.localeCompare(b.id));
      const n = arr.length;
      arr.forEach((edge, idx) => {
        const offset = (idx - (n - 1) / 2) * 10; // spread siblings
        result.push({
          ...edge,
          data: { ...(edge.data || {}), anchorOffset: offset },
        });
      });
    });

    return result;
  }, []);

  const [edges, setEdges] = useState(() => applyEdgeOffsets(baseEdges));

  const [startState, setStartState] = useState('q0');
  const [acceptingStates, setAcceptingStates] = useState(new Set(['q1', 'q2']));
  const [testString, setTestString] = useState('aa');
  const [testResult, setTestResult] = useState('');

  const [showSelfLoopModal, setShowSelfLoopModal] = useState(false);
  const [selectedNodeForLoop, setSelectedNodeForLoop] = useState('');
  const [loopLabel, setLoopLabel] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [pendingConnect, setPendingConnect] = useState(null);
  const [connectLabel, setConnectLabel] = useState('');
  const [connectError, setConnectError] = useState('');
  const [selfLoopError, setSelfLoopError] = useState('');

  // Context Menu State
  const [menu, setMenu] = useState(null);
  const ref = React.useRef(null);

  const onNodesChange = useCallback((chs) => setNodes((nds) => applyNodeChanges(chs, nds)), []);
  const onEdgesChange = useCallback(
    (chs) => setEdges((eds) => applyEdgeOffsets(applyEdgeChanges(chs, eds))),
    [applyEdgeOffsets]
  );

  // --- IMPROVED CONNECTION LOGIC (Handles Self-Loops Visually) ---
  const onConnect = useCallback((params) => {
    // Open the custom connection modal instead of using window.prompt
    setPendingConnect(params);
    setConnectLabel('');
    setConnectError('');
    setShowConnectModal(true);
  }, []);

  const handleSaveConnection = () => {
    if (!pendingConnect) return setShowConnectModal(false);
    if (!connectLabel) {
      setConnectError('Please enter a transition symbol.');
      return;
    }

    const params = pendingConnect;
    const isSelfLoop = params.source === params.target;

    const newEdge = {
      ...params,
      id: `e-${params.source}-${params.target}-${Date.now()}`,
      label: connectLabel,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#2c3e50' },
      style: { strokeWidth: 2, stroke: '#2c3e50' },
    };

    if (isSelfLoop) {
      setEdges((eds) => applyEdgeOffsets(addEdge({ ...newEdge, type: 'selfLoop' }, eds)));
    } else {
      setEdges((eds) => applyEdgeOffsets(addEdge({ ...newEdge, type: 'adjustableBezier' }, eds)));
    }

    setPendingConnect(null);
    setConnectLabel('');
    setConnectError('');
    setShowConnectModal(false);
  };

  // --- MANUAL SELF-LOOP BUTTON ---
  const addSelfLoop = () => {
    // Determine the default node to select (e.g., the first one or the last added)
    // If we have nodes, default to the first one.
    if (nodes.length > 0) {
      setSelectedNodeForLoop(nodes[0].id);
    }
    setLoopLabel('');
    setSelfLoopError('');
    setShowSelfLoopModal(true);
  };

  const handleSaveSelfLoop = () => {
    if (!selectedNodeForLoop) {
      setSelfLoopError('Please select a state.');
      return;
    }
    if (!loopLabel) {
      setSelfLoopError('Please enter a transition symbol.');
      return;
    }

    // Check if this node already has self-loops and offset the angle
    const existingSelfLoops = edges.filter(e => e.source === selectedNodeForLoop && e.target === selectedNodeForLoop);
    const baseAngle = -90; // Top position
    const angleOffset = existingSelfLoops.length * 60; // Offset by 60 degrees for each existing loop
    const loopAngle = baseAngle + angleOffset;

    setEdges((eds) => applyEdgeOffsets([...eds, {
      id: `self-${selectedNodeForLoop}-${Date.now()}`,
      source: selectedNodeForLoop,
      target: selectedNodeForLoop,
      label: loopLabel,
      type: 'selfLoop',
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { strokeWidth: 2 },
      data: { loopAngle }
    }]));

    setShowSelfLoopModal(false);
    setSelfLoopError('');
  };

  const addState = () => {
    // Find the lowest available id
    let i = 0;
    while (true) {
      if (!nodes.find(n => n.id === `q${i}`)) {
        break;
      }
      i++;
    }
    const id = `q${i}`;

    const makeAngleHandler = (nodeId) => (a) => updateNodeAngle(nodeId, a);

    const newNode = {
      id,
      type: 'circular',
      data: { label: id, angle: -90, onAngleChange: makeAngleHandler(id) },

      // Use i-based positioning to match original logic but using recycled index
      position: { x: 100 + (nodes.length) * 100, y: 150 + (nodes.length % 2) * 50 },
      style: nodeStyle
    };
    setNodes((nds) => [...nds, newNode]);
    // setNodeCount can be removed or ignored.
    if (startState === '') setStartState(id);
  };

  const toggleAccepting = (stateId) => {
    const newAccepting = new Set(acceptingStates);
    if (newAccepting.has(stateId)) newAccepting.delete(stateId);
    else newAccepting.add(stateId);

    setAcceptingStates(newAccepting);
    setNodes((nds) => nds.map((node) => {
      if (node.id !== stateId) return node;
      const isFinal = newAccepting.has(node.id);
      return {
        ...node,
        style: isFinal ? finalStyle : nodeStyle,
        data: { ...node.data, isFinal: isFinal }
      };
    }));
  };

  const updateNodeAngle = (id, angle) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, angle: Number(angle) } };
      }
      return n;
    }));
  };

  // --- CONTEXT MENU HANDLERS ---
  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      setMenu({
        id: node.id,
        type: 'node',
        top: event.clientY,
        left: event.clientX,
      });
    },
    [setMenu],
  );

  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();

      setMenu({
        id: edge.id,
        type: 'edge',
        top: event.clientY,
        left: event.clientX,
      });
    },
    [setMenu],
  );

  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  const handleMenuClick = (action, id) => {
    if (action === 'delete') {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      // Also cleanup accepting set
      if (acceptingStates.has(id)) {
        const newSet = new Set(acceptingStates);
        newSet.delete(id);
        setAcceptingStates(newSet);
      }
      if (startState === id) setStartState('');
    } else if (action === 'deleteEdge') {
      setEdges((eds) => eds.filter((e) => e.id !== id));
    } else if (action === 'final') {
      toggleAccepting(id);
    }
    setMenu(null);
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

      <div style={{ flexGrow: 1 }} ref={ref}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          edgeTypes={edgeTypes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => {
            // Toggle accepting logic - Keeping existing behavior as requested, but also available in menu
            toggleAccepting(n.id);
          }}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={onPaneClick}
          fitView
        >
          <Background variant="dots" />
          <Controls />
          {menu && <ContextMenu onClick={handleMenuClick} {...menu} />}
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
                onChange={(e) => { setLoopLabel(e.target.value); setSelfLoopError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSelfLoop(); }}
                placeholder="e.g. a, b"
                style={inputStyle}
              />
              {selfLoopError && <div style={{ color: 'red', marginTop: '6px' }}>{selfLoopError}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setShowSelfLoopModal(false); setSelfLoopError(''); }} style={btnStyle('#95a5a6')}>Cancel</button>
              <button onClick={handleSaveSelfLoop} style={btnStyle('#2ecc71')}>Save</button>
            </div>
          </div>
        </div>
      )}
      {showConnectModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Add Transition</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>From → To:</label>
              <div style={{ padding: '8px 10px', background: '#f7f7f7', borderRadius: '4px' }}>
                {pendingConnect ? `${pendingConnect.source} → ${pendingConnect.target}` : ''}
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Transition Symbol:</label>
              <input
                type="text"
                value={connectLabel}
                onChange={(e) => { setConnectLabel(e.target.value); setConnectError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveConnection(); }}
                placeholder="e.g. a, b"
                style={inputStyle}
              />
              {connectError && <div style={{ color: 'red', marginTop: '6px' }}>{connectError}</div>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => { setShowConnectModal(false); setPendingConnect(null); setConnectError(''); }} style={btnStyle('#95a5a6')}>Cancel</button>
              <button onClick={handleSaveConnection} style={btnStyle('#2ecc71')}>Save</button>
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

export default function Simulator() {
  return <ReactFlowProvider><AutomataSimulator /></ReactFlowProvider>;
}
