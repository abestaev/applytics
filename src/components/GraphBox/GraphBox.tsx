import React, { useLayoutEffect, useRef, useState } from 'react'

import '@/components/GraphBox/GraphBox.css'

import greenChartIcon from '@/assets/greenChartIcon.svg'
import ButtonDots from '../ButtonDots/ButtonDots'
import MiniChart from '../LineChart/LineChart'

type GraphBoxProps = {
    data: Array<number>,
    placeholder: string,
    result: number,
    monthProgression: number,
    color: string,
    lineColor: string
}

function GraphBox({ data, placeholder, result, monthProgression, color, lineColor }: GraphBoxProps) {


    const divRef = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState({ width: 300, height: 50 })

    useLayoutEffect(() => {
        if (!divRef.current) return
        if (!data || data.length === 0) return 
        if (size.height !== 50) return 

        setSize({
            width: divRef.current.offsetWidth,
            height: divRef.current.offsetHeight
        })
    }, [data])

    return (
        <div className='graphbox blur'>
            <h3 className='graphbox__title'>{placeholder}</h3>
            <div className='graphbox__graph'>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>

                    <div className='graphbox__results'>
                        <p className='graphbox__result'>{result}</p>
                        {
                            data && data.length > 0 ?
                                <>
                                    <img className='graphbox__icon' src={greenChartIcon} />
                                    <p className='graphbox__monthprogression'>{monthProgression}%</p>
                                </>
                                : <p className='graphbox__monthprogression' style={{ color: 'black' }}>-</p>
                        }
                        <p className='graphbox__text'>vs last month</p>
                    </div>
                    <ButtonDots icon='more' />
                </div>

                <div ref={divRef}>
                    {
                        data && data.length > 0 &&
                        <MiniChart
                            height={size.height}
                            width={size.width}
                            data={data}
                            lineColor={lineColor}
                            color={color}
                        />
                    }

                </div>
            </div>
        </div>
    )
}

export default GraphBox