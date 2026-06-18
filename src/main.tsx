import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GameShell } from '@/app'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameShell />
  </StrictMode>,
)
