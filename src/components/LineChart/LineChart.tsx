import styles from '@/components/LineChart/LineChart.module.css'
import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'

type ProgressBarProps = {
    data: number[],
    color: string,
    lineColor: string
}

export default function ProgressBar({ data, color, lineColor }: ProgressBarProps) {

    const [size, setSize] = useState({ width: 220, height: 40 })

    const divRef = useRef<HTMLDivElement>(null)


    useEffect(() => {
        if (!divRef.current) return
        setSize({ width: divRef.current.offsetWidth, height: divRef.current.offsetHeight })
    }, [divRef.current])


    const min = Math.min(...data)
    const max = Math.max(...data)

    const points = data.map((value, index) => {
        let x;
        let normalized;
        if (!index || !(data.length - 1))
            x = 0
        else
            x = (index / (data.length - 1)) * size.width
        if (value - min === 0)
            normalized = 0
        else
            normalized = (value - min) / (max - min || 1)
        const y = size.height - normalized * size.height
        return `${x},${y}`
    })

    const linePath = `M ${points.join(' L ')}`

    const areaPath = `
    ${linePath}
    L ${size.width},${size.height}
    L 0,${size.height}
    Z
  `

    return (
        <div className={styles.container} ref={divRef}>
            <svg width="100%" height="100%" viewBox={`0 0 ${size.width} ${size.height}`} className={styles.svg}>
                <defs>
                    <linearGradient id={`chartGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                <path d={areaPath} fill={`url(#chartGradient-${color})`} />
                <path d={linePath} className={styles.line} style={{ stroke: `${lineColor}` }} />
            </svg>
        </div>
    )
}