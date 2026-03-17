import React, { useEffect, useRef, useState } from 'react'
import type { Application } from '../../types/applications'


import styles from '@/components/DataLine/DataLine.module.css'

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
            f.push(<p key={key} className='dataline__extend-text'><strong>{key}</strong>: {value}</p>)
        }
        return f
    }

    return (
        <>
            <div
                onClick={() => setSelected(e => !e)}
                className={styles.dataline}
                style={{
                    borderTop: index === 0 ? 'none' : 'var(--border)'
                }}
            >
                <div className={styles.dataline__cell} style={{ marginRight: '1em' }}>
                    <input type="checkbox" />
                </div>

                <div className={styles.dataline__cell}>
                    <p >{application?.company || ""}</p>
                </div>

                <div className={styles.dataline__cell}>
                    <p>{application?.date || ""}</p>
                </div>

                <div className={styles.dataline__cell}>
                    <p>{application?.type || ""}</p>
                </div>

                <div className={styles.dataline__cell}>
                    <p>{application?.city || ""}</p>
                </div>

                <div className={styles.dataline__percent}>
                    <div
                        ref={percentDivRef}
                        className={styles.dataline__bar}
                    ></div>
                    <div
                        className={styles['dataline__bar-fill']}
                        style={{
                            height: `${percentDivRef.current?.offsetHeight}px`,
                            width: `${width * percentTotal / 100}px`,
                        }}
                    ></div>
                    <p
                        className={styles['dataline__percent-text']}
                    >{percentTotal}%</p>
                </div>

            </div>
            {
                selected &&
                <div
                    className={styles.dataline__extend}
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