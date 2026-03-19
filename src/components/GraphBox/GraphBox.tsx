import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'


import greenChartIcon from '@/assets/greenChartIcon.svg'
import ButtonDots from '../ButtonDots/ButtonDots'
import ProgressBar from '../LineChart/LineChart'

import styles from '@/components/GraphBox/GraphBox.module.css'


type GraphBoxProps = {
    data: Array<number>,
    placeholder: string,
    result: number,
    monthProgression: number,
    color: string,
    lineColor: string
}

function GraphBox({ data, placeholder, result, monthProgression, color, lineColor }: GraphBoxProps) {


    return (
        <div className={`${styles.graphbox} blur`}>

            <h3 className={styles.title}>{placeholder}</h3>

            <div className={styles.body}>

                <div className={styles.body__header}>

                    <div className={styles.results}>
                        <p className={styles.results__title}>{result}</p>
                        {
                            data && data.length > 0 ?
                                <>
                                    <img className={styles.results__icon} src={greenChartIcon} />
                                    <p className={styles.results__monthprogression}>{monthProgression}%</p>
                                </>
                                : <p className={styles.results__monthprogression} style={{ color: 'black' }}>-</p>
                        }
                        <p className={styles.results__text}>vs last month</p>
                    </div>

                    <ButtonDots />

                </div>

                {
                    data && data.length > 0 &&
                    <ProgressBar
                        data={data}
                        lineColor={lineColor}
                        color={color}
                    />
                }
            </div>
        </div>
    )
}

export default GraphBox