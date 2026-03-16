import React, { useEffect, useRef, useState } from 'react'
import './DataLine.css'
import type { Application } from '../../types/general'


type DataLineProps = {
    index: number,
    application: Application,
    applications: Application[]
    percentTotal: number
}

function DataLine({ index, application, percentTotal }: DataLineProps) {


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
            f.push(<p key={key} style={{ overflow: 'hidden', width: '100%' }}><strong>{key}</strong>: {value}</p>)
        }
        return f
    }


    return (
        <>
            <div
                onClick={() => setSelected(e => !e)}
                className='dataline-container'
                style={{
                    borderTop: index === 0 ? 'none' : 'var(--border)'
                }}
            >
                <div className='dataline-div' style={{ marginRight: '1em' }}>
                    <input type="checkbox" />
                </div>

                <div className='dataline-div'>
                    <p >{application?.company || ""}</p>
                </div>

                <div className='dataline-div'>
                    <p>{application?.date || ""}</p>
                </div>

                <div className='dataline-div'>
                    <p>{application?.type || ""}</p>
                </div>

                <div className='dataline-div'>
                    <p>{application?.city || ""}</p>
                </div>

                <div className='dataline__c-percent'>
                    <div
                        ref={percentDivRef}
                        className='dataline__c-percent-p'
                        style={{
                            position: 'relative',
                            backgroundColor: 'rgba(165, 47, 47, 0.08)',
                            height: '0.5em',
                            flex: '4',
                            borderRadius: '1em',
                        }}
                    ></div>
                    <div
                        className='dataline__c-percent-a'
                        style={{
                            height: `${percentDivRef.current?.offsetHeight}px`,
                            width: `${width * percentTotal / 100}px`,
                        }}
                    ></div>
                    <p style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.95em',
                        color: 'var(--text-color-800)'
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