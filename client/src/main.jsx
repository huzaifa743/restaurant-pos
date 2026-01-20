import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n'

// Suppress osano.js SVG viewBox errors (harmless third-party warnings)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    // Filter out osano.js SVG viewBox errors - they're harmless warnings from external library
    if (message.includes('viewBox') && message.includes('Expected number')) {
      return; // Suppress these harmless errors
    }
    originalError.apply(console, args);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
