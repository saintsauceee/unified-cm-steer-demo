import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './fig1.css'
import Fig1 from './Fig1.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fig1 />
  </StrictMode>,
)
