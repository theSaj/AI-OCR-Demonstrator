// ==========================================
// THE APPLICATION ENTRY POINT
// ==========================================
// Think of this file as the key turning in the ignition to start the car.
// It tells the browser how to take our React code and actually draw it on the screen.

import React from 'react' // The core React library
import ReactDOM from 'react-dom/client' // The tool that connects React to the web browser's Document Object Model (DOM)
import App from './App.jsx' // Our main application component
import './index.css' // The global styles (colors, fonts, etc.) for our app

// Find the HTML element with the ID "root" (in index.html)
// and tell React to take control of it and render our <App /> inside.
ReactDOM.createRoot(document.getElementById('root')).render(
    // StrictMode is a developer tool that highlights potential problems in an application by running checks twice.
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
