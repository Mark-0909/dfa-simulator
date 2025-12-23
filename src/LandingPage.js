import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const btnRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen((v) => !v);

    const handleBtnClick = (e) => {
        // Ripple Effect
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.width = `${rect.width}px`;
        ripple.style.height = `${rect.width}px`;
        ripple.style.marginTop = `-${rect.width / 2}px`;
        ripple.style.marginLeft = `-${rect.width / 2}px`;

        // Append cleanly
        button.appendChild(ripple);

        // Cleanup after animation
        setTimeout(() => {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            navigate('/simulator'); // Navigate after effect triggers
        }, 300); // Slight delay to see the ripple start, or immediate if preferred.
        // Actually, navigation might be better immediate or after short delay. 
        // Let's do a very short delay to let user perceive the click? 
        // Or just let natural React Router handling take over.
        // The previous code had direct navigation. I'll stick to concurrent execution.
    };

    return (
        <div className="landing-page-wrapper">
            <header className="dfa-header reveal-up">
                <div className="brand-wrapper">
                    <div className="brand"><h1>DFA Simulator</h1></div>
                    <div className="status-pill">SYSTEM_KERNEL: ONLINE</div>
                </div>
                <div className="nav-links-header">
                    <a href="#about">About</a>
                    <a href="#docs">Documentation</a>
                    <a href="https://github.com/your-username/dfa-simulator" target="_blank" rel="noopener noreferrer">GitHub</a>
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
                    <a href="#about">About</a>
                    <a href="#docs">Documentation</a>
                    <a href="https://github.com/your-username/dfa-simulator" target="_blank" rel="noopener noreferrer">GitHub</a>
                </nav>
            )}

            <main className="hero-container">
                <div className="hero-content">
                    <h2 className="hero-title reveal-up delay-1">VISUALIZE.<br />COMPUTE.<br />DETERMINE.</h2>
                    <p className="hero-sub reveal-up delay-2">
                        Build and test Deterministic Finite Automata in a clean, professional environment.
                    </p>
                    <button
                        className="main-cta reveal-up delay-3"
                        ref={btnRef}
                        onClick={handleBtnClick}
                    >
                        <span className="glass-glint"></span>
                        Launch Simulator
                    </button>
                </div>

                <div className="dfa-visual-stage reveal-up delay-3">
                    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <marker id="arrow" viewBox="0 0 10 10" refX="38" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.2)" />
                            </marker>
                            <marker id="arrow-end" viewBox="0 0 10 10" refX="50" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.2)" />
                            </marker>
                        </defs>

                        {/* Static Paths */}
                        <path d="M 100 200 L 300 100" className="transition-path" markerEnd="url(#arrow)" />
                        <path d="M 300 100 L 500 250" className="transition-path" markerEnd="url(#arrow-end)" />

                        {/* Packet 1: q0 -> q1 (First half of loop) */}
                        <circle r="4" className="data-packet">
                            <animateMotion
                                dur="3s"
                                repeatCount="indefinite"
                                path="M 100 200 L 300 100"
                                keyTimes="0;0.5;1"
                                keyPoints="0;1;1"
                                calcMode="linear"
                            />
                            <animate
                                attributeName="opacity"
                                values="0;1;1;0"
                                keyTimes="0;0.1;0.5;0.51"
                                dur="3s"
                                repeatCount="indefinite"
                            />
                        </circle>

                        {/* Packet 2: q1 -> q2 (Second half of loop) */}
                        <circle r="4" className="data-packet">
                            <animateMotion
                                dur="3s"
                                repeatCount="indefinite"
                                path="M 300 100 L 500 250"
                                keyTimes="0;0.5;1"
                                keyPoints="0;0;1"
                                calcMode="linear"
                            />
                            <animate
                                attributeName="opacity"
                                values="0;0;1;1;0"
                                keyTimes="0;0.5;0.6;0.95;1"
                                dur="3s"
                                repeatCount="indefinite"
                            />
                        </circle>

                        {/* Nodes */}
                        <g className="state-node">
                            <circle cx="100" cy="200" r="30" className="state-circle" />
                            <text x="100" y="205" textAnchor="middle">q₀</text>
                        </g>

                        <g className="state-node">
                            <circle cx="300" cy="100" r="30" className="state-circle" />
                            <text x="300" y="105" textAnchor="middle">q₁</text>
                        </g>

                        <g className="state-node">
                            <circle cx="500" cy="250" r="36" className="accept-outer" />
                            <circle cx="500" cy="250" r="30" className="accept-inner" />
                            <text x="500" y="255" textAnchor="middle">q₂</text>
                        </g>
                    </svg>
                </div>
                {/* Mobile-only bottom CTA: shows after the diagram on small screens */}
                <div className="mobile-bottom-cta">
                    <button
                        className="main-cta"
                        onClick={handleBtnClick}
                    >
                        <span className="glass-glint"></span>
                        Launch Simulator
                    </button>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
