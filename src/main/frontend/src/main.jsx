// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'

// Remove loading indicator after app loads
window.addEventListener('load', () => {
  const loadingEl = document.querySelector('.app-loading')
  if (loadingEl) {
    loadingEl.style.display = 'none'
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)