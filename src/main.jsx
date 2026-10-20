import React from 'react'
import ReactDOM from 'react-dom/client'
// Global CSS must load BEFORE component CSS (mirrors the original cascade order:
// slug.css first, then section/inline styles). See src/styles/footer.css.
import './index.css'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
