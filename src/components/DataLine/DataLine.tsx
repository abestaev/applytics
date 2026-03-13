import React, { useEffect, useRef, useState } from 'react'
import './DataLine.css'
import type { Application } from '../../types/general'
import { useDatas } from '../../hooks/useDatas'

type DataLineProps = {
    application: Application,
    applications: Application[]
    percentTotal: number
}

function DataLine({ application, percentTotal }: DataLineProps) {


    const percentDivRef = useRef<HTMLDivElement>(null)

    const [selected, setSelected] = useState(false)

    const [width, setWidth] = useState(0)

    useEffect(() => {
        if (percentDivRef && percentDivRef.current) {
            setWidth(percentDivRef.current?.offsetWidth)
        }
    }, [percentDivRef])


    const displayAppInfo = (application: Application) => {
        const f = []
        for (const [key, value] of Object.entries(application)) {
            f.push(<p style={{overflow: 'hidden', width: '100%'}}><strong>{key}</strong>: {value}</p>)
        }
        return f
    }


    return (
        <>
            <div
                onClick={() => setSelected(e => !e)}
                className='dataline-container'
                style={{
                    display: 'grid',
                    padding: '0.5em 1em',
                    borderTop: 'var(--border)',
                    gridTemplateColumns: 'auto 4fr 1fr 1fr 1fr 1fr',
                    rowGap: '1em'
                }}
            >
                <div style={{ marginRight: '1em', justifyItems: 'flex-start' }}>
                    <input type="checkbox" />
                </div>

                <div style={{ justifyItems: 'flex-start' }}>
                    <p className='dataline-text'>{application?.company || ""}</p>
                </div>

                <div style={{ justifyItems: 'flex-start' }}>
                    <p>{application?.date as string || ""}</p>
                </div>

                <div style={{ justifyItems: 'flex-start' }}>
                    <p>{application?.type || ""}</p>
                </div>

                <div
                    style={{
                        width: '100%',
                        overflow: 'hidden'
                    }}
                >
                    <p style={{
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>{application?.city || ""}</p>
                </div>

                <div style={{ display: 'flex', justifyItems: 'flex-start', alignItems: 'center', gap: '1em' }}>
                    <div
                        ref={percentDivRef}
                        style={{
                            position: 'relative',
                            backgroundColor: 'rgba(165, 47, 47, 0.08)',
                            height: '0.7em',
                            flex: '4',
                            borderRadius: '1em',
                        }}
                    ></div>
                    <div
                        style={{
                            position: 'absolute',
                            backgroundColor: '#90b7ff',
                            borderRadius: '1em',
                            height: `${percentDivRef.current?.offsetHeight}px`,
                            width: `${width * percentTotal / 100}px`,
                        }}
                    ></div>
                    <p style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>{percentTotal}%</p>
                </div>

            </div>
            {
                selected &&
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1em', 
                    }}
                >
                    {
                        displayAppInfo(application)
                    }
                </div>
            }
        </>
    )
}

export default DataLine