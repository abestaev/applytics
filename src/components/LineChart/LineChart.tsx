import '@/components/LineChart/LineChart.css'

type MiniChartProps = {
  height: number,
  width: number,
  data: number[],
  color: string,
  lineColor: string
}

export default function MiniChart({ height, width, data, color, lineColor }: MiniChartProps) {

  const min = Math.min(...data)
  const max = Math.max(...data)

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const normalized = (value - min) / (max - min || 1)
    const y = height - normalized * height
    return `${x},${y}`
  })

  const linePath = `M ${points.join(' L ')}`

  const areaPath = `
    ${linePath}
    L ${width},${height}
    L 0,${height}
    Z
  `

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mini-chart">
      <defs>
        <linearGradient id={`chartGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={areaPath} fill={`url(#chartGradient-${color})`} />
      <path d={linePath} className="mini-chart__line" style={{ stroke: `${lineColor}` }} />
    </svg>
  )
}