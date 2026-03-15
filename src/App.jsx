// ==========================================
// THE MAIN APPLICATION COMPONENT (ROUTER)
// ==========================================
// This file acts as the "Traffic Cop" for our application.
// It looks at the URL in the browser (like "/about" or "/files") and decides which page to show.

import React from 'react';
// These tools help us create "pages" without actually reloading the website.
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import our common frame (Header, Sidebar) that appears on every page
import Layout from './components/Layout';

// Import the individual "Pages" of our application
import Home from './pages/Home';
import About from './pages/About';
import Processor from './pages/Processor';
import Author from './pages/Author';
import ViewFiles from './pages/ViewFiles';
import DataLibrary from './pages/DataLibrary';
import Settings from './pages/Settings';

function App() {
    return (
        // BrowserRouter turns on the routing engine for the whole app
        <BrowserRouter>
            {/* Everything inside <Layout> gets wrapped in the common Header/Sidebar */}
            <Layout>
                {/* <Routes> looks at the URL and picks exactly ONE <Route> to display */}
                <Routes>
                    {/* If the URL ends in "/", display the Home component */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/processor" element={<Processor />} />
                    <Route path="/files" element={<ViewFiles />} />
                    <Route path="/library" element={<DataLibrary />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/author" element={<Author />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
