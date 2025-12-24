import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Documentation.css';
import './LandingPage.css';

const Documentation = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen((v) => !v);

    return (
        <div className="docs-wrapper">
            <header className="dfa-header reveal-up">
                <div className="brand-wrapper">
                    <div className="brand"><h1>DFA Simulator</h1></div>
                    <div className="status-pill">SYSTEM_KERNEL: ONLINE</div>
                </div>
                <div className="nav-links-header">
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/documentation">Documentation</Link>
                    <a href="https://github.com/Mark-0909/dfa-simulator" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
                <button
                    className="mobile-menu-btn"
                    aria-label="Open navigation menu"
                    onClick={toggleMenu}
                >
                    <span className="hamburger" />
                </button>
            </header>

            {menuOpen && (
                <nav className="mobile-menu reveal-up" onClick={() => setMenuOpen(false)}>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/documentation">Documentation</Link>
                    <a href="https://github.com/Mark-0909/dfa-simulator" target="_blank" rel="noopener noreferrer">GitHub</a>
                </nav>
            )}

            <main className="docs-content">
                <nav className="docs-sidebar">
                    <h3>Contents</h3>
                    <ul>
                        <li><a href="#getting-started">Getting Started</a></li>
                        <li><a href="#usage-guide">Usage Guide</a></li>
                        <li><a href="#key-concepts">Key Concepts</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#tips">Tips & Tricks</a></li>
                    </ul>
                </nav>

                <div className="docs-main">
                    <section id="getting-started" className="doc-section">
                        <h2>Getting Started</h2>
                        <p>
                            Welcome to DFA Simulator! This tool helps you create, visualize, and test 
                            Deterministic Finite Automata. To begin:
                        </p>
                        <ol>
                            <li>Click "Launch Simulator" from the home page</li>
                            <li>Start creating states by clicking on the canvas</li>
                            <li>Connect states with transitions</li>
                            <li>Test your DFA with input strings</li>
                        </ol>
                    </section>

                    <section id="usage-guide" className="doc-section">
                        <h2>Usage Guide</h2>
                        
                        <h3>Creating States</h3>
                        <p>
                            Click anywhere on the canvas to create a new state. States are represented as circles 
                            and are automatically labeled (q0, q1, q2, etc.).
                        </p>

                        <h3>Setting Initial State</h3>
                        <p>
                            The first state you create is automatically set as the initial state. You can identify 
                            it by the incoming arrow from the left.
                        </p>

                        <h3>Marking Final States</h3>
                        <p>
                            Double-click any state to mark it as a final (accepting) state. Final states are 
                            displayed with a double circle. Double-click again to unmark.
                        </p>

                        <h3>Creating Transitions</h3>
                        <p>
                            To create a transition between states:
                        </p>
                        <ol>
                            <li>Click and hold on the source state</li>
                            <li>Drag to the target state</li>
                            <li>Release to create the transition</li>
                            <li>Enter the input symbol(s) for the transition</li>
                        </ol>

                        <h3>Self-Loop Transitions</h3>
                        <p>
                            Drag from a state back to itself to create a self-loop transition. These are useful 
                            for states that remain in the same state on certain inputs.
                        </p>

                        <h3>Editing Transitions</h3>
                        <p>
                            Right-click on any transition to access options for editing or deleting it. You can 
                            modify the input symbols or remove the transition entirely.
                        </p>

                        <h3>Deleting States</h3>
                        <p>
                            Right-click on a state and select "Delete" to remove it. All transitions connected 
                            to that state will also be removed.
                        </p>

                        <h3>Testing Your DFA</h3>
                        <p>
                            Once your DFA is complete:
                        </p>
                        <ol>
                            <li>Click the "Simulate" button</li>
                            <li>Enter an input string</li>
                            <li>Watch as the simulator processes each symbol</li>
                            <li>See whether the string is accepted or rejected</li>
                        </ol>
                    </section>

                    <section id="key-concepts" className="doc-section">
                        <h2>Key Concepts</h2>

                        <h3>What is a DFA?</h3>
                        <p>
                            A Deterministic Finite Automaton (DFA) is a mathematical model of computation 
                            consisting of:
                        </p>
                        <ul>
                            <li><strong>States:</strong> A finite set of states the machine can be in</li>
                            <li><strong>Alphabet:</strong> A finite set of input symbols</li>
                            <li><strong>Transition Function:</strong> Rules that determine the next state based on 
                                the current state and input symbol</li>
                            <li><strong>Initial State:</strong> The state where computation begins</li>
                            <li><strong>Final States:</strong> States that indicate acceptance of the input</li>
                        </ul>

                        <h3>How Does a DFA Work?</h3>
                        <p>
                            A DFA processes an input string symbol by symbol:
                        </p>
                        <ol>
                            <li>Start in the initial state</li>
                            <li>Read the first symbol</li>
                            <li>Follow the transition for that symbol to the next state</li>
                            <li>Repeat for each symbol in the input</li>
                            <li>If you end in a final state, the string is <strong>accepted</strong></li>
                            <li>If you end in a non-final state or no valid transition exists, the string is <strong>rejected</strong></li>
                        </ol>

                        <h3>Deterministic vs Non-Deterministic</h3>
                        <p>
                            In a DFA, for each state and input symbol, there is <strong>exactly one</strong> transition 
                            to a next state. This is what makes it "deterministic" - the next state is completely 
                            determined by the current state and input.
                        </p>
                    </section>

                    <section id="features" className="doc-section">
                        <h2>Features</h2>

                        <div className="feature-grid">
                            <div className="feature-card">
                                <h4>Visual Editor</h4>
                                <p>Intuitive drag-and-drop interface for creating automata</p>
                            </div>
                            <div className="feature-card">
                                <h4>Interactive Simulation</h4>
                                <p>Step through input processing in real-time</p>
                            </div>
                            <div className="feature-card">
                                <h4>Context Menus</h4>
                                <p>Right-click for quick actions on states and transitions</p>
                            </div>
                            <div className="feature-card">
                                <h4>Self-Loops</h4>
                                <p>Support for self-referencing transitions</p>
                            </div>
                            <div className="feature-card">
                                <h4>State Management</h4>
                                <p>Easily add, remove, and configure states</p>
                            </div>
                            <div className="feature-card">
                                <h4>Responsive Design</h4>
                                <p>Works seamlessly on desktop and mobile devices</p>
                            </div>
                        </div>
                    </section>

                    <section id="tips" className="doc-section">
                        <h2>Tips & Tricks</h2>

                        <div className="tip-box">
                            <h4>💡 Planning Your DFA</h4>
                            <p>
                                Before building your DFA, sketch it out on paper first. Think about what strings 
                                you want to accept and what states you'll need to track.
                            </p>
                        </div>

                        <div className="tip-box">
                            <h4>💡 Testing Thoroughly</h4>
                            <p>
                                Test your DFA with multiple input strings - both ones that should be accepted 
                                and ones that should be rejected. This helps verify your automaton works correctly.
                            </p>
                        </div>

                        <div className="tip-box">
                            <h4>💡 Keep It Simple</h4>
                            <p>
                                Start with simple DFAs and gradually increase complexity. Try building automata 
                                for simple patterns like "strings ending in 'ab'" before tackling more complex languages.
                            </p>
                        </div>

                        <div className="tip-box">
                            <h4>💡 Use Meaningful Labels</h4>
                            <p>
                                While states are auto-labeled, think about what each state represents in your 
                                mental model. This makes debugging and understanding your DFA easier.
                            </p>
                        </div>

                        <div className="tip-box">
                            <h4>💡 Check for Completeness</h4>
                            <p>
                                Ensure every state has transitions for all symbols in your alphabet. Missing 
                                transitions will cause the DFA to reject strings unexpectedly.
                            </p>
                        </div>
                    </section>

                    <section className="doc-section">
                        <h2>Need More Help?</h2>
                        <p>
                            If you have questions or encounter issues, please visit our{' '}
                            <a href="https://github.com/Mark-0909/dfa-simulator" target="_blank" rel="noopener noreferrer">
                                GitHub repository
                            </a>{' '}
                            to report issues or ask questions.
                        </p>
                        <button className="primary-btn" onClick={() => navigate('/simulator')}>
                            Start Building Your DFA
                        </button>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Documentation;
