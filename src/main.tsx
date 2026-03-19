import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import StatisticsPage from '@/app/routes/Statistics'


export const STATUS_TYPE = ["ON GOING", "REFUSED"]

export const TYPE_VALUES = ["Internship", "CDI"]

export const MAX_SIZE = 1 * 1024 * 1024 // 1MB


export const graphColors = {
  total: [ '#207900', '#aaff8b'],
  responses: [ '#B20041', '#ff7e9a'],
  interviews: [ '#0043BF', '#83aeff']
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StatisticsPage />
  </StrictMode>,
)
