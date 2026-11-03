import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { applyPalette, savedPalette } from './lib/palette.js'
import './styles/tokens.css'
import './styles/global.css'

applyPalette(savedPalette()) // antes de pintar, para que no parpadee

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
