// ==========================================
// A BASIC REACT COMPONENT (Home Page)
// ==========================================
// A React component is just a Javascript function that returns HTML-like code (called JSX).

import React from 'react';
// We use <Link> instead of the normal HTML <a> tag so we can change pages
// instantly without the browser flashing or reloading.
import { Link } from 'react-router-dom';

const Home = () => {
    // Everything inside the return() statement is what will be drawn on the screen.
    // Note: React uses 'className' instead of 'class' because 'class' is a reserved word in Javascript.
    return (
        <div className="content-container">
            <h1>Welcome to Antigravity</h1>
            
            <div className="card">
                <p>
                    Discover the future of processing power. We are pushing the boundaries of what is possible
                    with our cutting-edge technology and innovative designs.
                </p>
                {/* This Link acts like an <a> tag but keeps us inside our Single Page Application */}
                <Link to="/processor" className="btn">Explore the Processor</Link>
            </div>

            {/* In React, inline styles require double curly braces {{ }} */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h2>Innovation</h2>
                    <p>Redefining architecture with a focus on speed and efficiency. Our designs are built for the next generation of computing.</p>
                </div>
                <div className="card">
                    <h2>Community</h2>
                    <p>Driven by open-source principles and a passionate community of developers and engineers.</p>
                </div>
            </div>
        </div>
    );
};

// Exporting this means other files (like App.jsx) can import and use it.
export default Home;
