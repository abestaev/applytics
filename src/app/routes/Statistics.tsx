
import NavLine from "@/components/NavLine/NavLine"
import GraphBox from "@/components/GraphBox/GraphBox"

import { useState } from "react"

import pinkVector from '@/assets/pinkVector.svg'
import greenVector from '@/assets/greenVector.svg'
import blueVector from '@/assets/blueVector.svg'

import { useDatas } from "../../hooks/useDatas"
import type { ApplicationState } from "../../types/applications"

import CompanyContainer from "@/features/CompanyContainer/CompanyContainer"
import UploadContainer from '@/components/UploadContainer/UploadContainer'

import styles from '@/app/routes/Statistics.module.css'
import { graphColors } from "@/main"

const StatisticsPage = () => {

    const [appState, setAppState] = useState<ApplicationState>([])

    const { graphState, specialities, speciality, setSpeciality, currentApplications } = useDatas(appState)

    return (
        <div className={styles.statistics}>
            <div style={{position: 'relative', width: '100%'}}>

                <img src={pinkVector} style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, width: '60%' }} />
                <img src={greenVector} style={{ position: 'absolute', left: 0, right: 0, zIndex: -1, width: '100%' }} />
                <img src={blueVector} style={{ position: 'absolute', right: 0, top: 0, zIndex: -1, width: '35%' }} />
               
            </div>
                <div className={styles.header} >

                    <div className={styles.header__title}>
                        <h1 className={styles.header__resume} >Resume your Internships</h1>
                        <h1 className={styles.header__applications}>Applications</h1>
                    </div>

                    <p className={styles.header__text}>Keep tracks of your applications from a simple interface</p>

                    <UploadContainer setAppState={setAppState} />

                </div>


                <div className={styles.body}>

                    <div className={styles.body__title}>
                        <h2>Summarize </h2>
                    </div>

                    <NavLine
                        speciality={speciality}
                        specialities={specialities}
                        setSpeciality={(e: string) => setSpeciality(e)}
                    />

                    <div className={styles.graph}>
                        <GraphBox
                            data={graphState?.graphDatas[0] || []}
                            placeholder="Total resumes sents"
                            result={graphState?.totalResumesSent}
                            monthProgression={20}
                            lineColor={graphColors.total[0]}
                            color={graphColors.total[1]}
                        />
                        <GraphBox
                            data={graphState?.graphDatas[1] || []}
                            placeholder="Total responses recieved"
                            result={graphState?.totalResponsesRecieved}
                            monthProgression={70}
                            lineColor={graphColors.responses[0]}
                            color={graphColors.responses[1]}
                        />
                        <GraphBox
                            data={graphState?.graphDatas[2] || []}
                            placeholder="Total interviews"
                            result={graphState?.totalInterviews}
                            monthProgression={50}
                            lineColor={graphColors.interviews[0]}
                            color={graphColors.interviews[1]}
                        />
                    </div>

                    <CompanyContainer
                        speciality={speciality}
                        applications={currentApplications}
                    />
                </div >
        </div >
    )
}

export default StatisticsPage