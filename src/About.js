import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './About.css';
import './LandingPage.css';

const About = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen((v) => !v);

    return (
        <div className="page-wrapper">
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

            <main className="page-content">
                <section className="content-section">
                    <h2>What is DFA Simulator?</h2>
                    <p>
                        DFA Simulator is an interactive educational tool designed to help students, educators, 
                        and enthusiasts understand and work with Deterministic Finite Automata (DFA). 
                        The simulator provides an intuitive graphical interface where users can construct 
                        DFA diagrams by creating states and transitions, then test their automata with 
                        various input strings to see how the machine processes them step by step.
                    </p>
                </section>

                <section className="content-section">
                    <h2>Why DFA Simulator?</h2>
                    <p>
                        Learning automata theory can be challenging, especially when it comes to visualizing 
                        how finite state machines work. DFA Simulator bridges this gap by providing:
                    </p>
                    <ul>
                        <li><strong>Visual Learning:</strong> See your automata come to life with an interactive graph interface</li>
                        <li><strong>Real-time Feedback:</strong> Test your DFA immediately with any input string</li>
                        <li><strong>Intuitive Design:</strong> Built with modern web technologies for a seamless experience</li>
                        <li><strong>Educational Focus:</strong> Perfect for learning formal language theory and automata concepts</li>
                    </ul>
                </section>

                <section className="content-section">
                    <h2>Who is it for?</h2>
                    <ul>
                        <li><strong>Students:</strong> Learning automata theory, formal languages, or theoretical computer science</li>
                        <li><strong>Educators:</strong> Teaching concepts related to finite state machines and computation theory</li>
                        <li><strong>Enthusiasts:</strong> Anyone interested in exploring computational models and formal systems</li>
                    </ul>
                </section>

                <section className="content-section">
                    <h2>Technology Stack</h2>
                    <p>Built with modern web technologies:</p>
                    <ul>
                        <li><strong>React 19:</strong> For a responsive and interactive user interface</li>
                        <li><strong>@xyflow/react:</strong> Powerful graph visualization library</li>
                        <li><strong>React Router:</strong> Seamless navigation between pages</li>
                    </ul>
                </section>

                <section className="content-section">
                    <h2>Open Source</h2>
                    <p>
                        DFA Simulator is open source and available on GitHub. We welcome contributions, 
                        feedback, and suggestions from the community. Whether you want to report a bug, 
                        suggest a feature, or contribute code, we'd love to hear from you!
                    </p>
                    <div className="cta-buttons">
                        <button className="primary-btn" onClick={() => navigate('/simulator')}>
                            Try the Simulator
                        </button>
                        <button className="secondary-btn" onClick={() => window.open('https://github.com/Mark-0909/dfa-simulator', '_blank')}>
                            View on GitHub
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default About;
