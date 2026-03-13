import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import StatisticsPage from '@/app/routes/Statistics'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StatisticsPage />
  </StrictMode>,
)
