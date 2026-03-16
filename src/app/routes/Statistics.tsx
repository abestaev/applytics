
import '@/app/routes/Statistics.css'
import NavLine from "@/components/NavLine/NavLine"
import GraphBox from "@/components/GraphBox/GraphBox"

import { useState } from "react"

import pinkVector from '@/assets/pinkVector.svg'
import greenVector from '@/assets/greenVector.svg'
import blueVector from '@/assets/blueVector.svg'

import { useDatas } from "../../hooks/useDatas"
import type { ApplicationState } from "../../types/general"

import CompanyContainer from "@/features/CompanyContainer/CompanyContainer"
import UploadContainer from '@/components/UploadContainer/UploadContainer'



const StatisticsPage = () => {

    const [appState, setAppState] = useState<ApplicationState>([])

    const { graphState, specialities, speciality, setSpeciality, currentApplications } = useDatas(appState)


    return (
        <div className="statistics">
            <div className="statistics-container" style={{ position: 'relative' }}>
                
                <img src={pinkVector} style={{ position: 'absolute', top: 0, left: 0, height: '30em', zIndex: -1 }} />
                <img src={greenVector} style={{ position: 'absolute', left: 0, right: 0, zIndex: -1, }} />
                <img src={blueVector} style={{ position: 'absolute', right: 0, top: 0 }} />


                <div className='stat__header-container' >

                    <div className="stat__header-title">
                        <h1 style={{fontWeight: '300'}}>Resume your Internships</h1>
                        <h1 style={{fontWeight: '500'}}>Applications</h1>
                    </div>

                    <p style={{ marginTop: '1em', fontSize: '1.1em' }}>Keep tracks of your applications from a simple interface</p>

                    <UploadContainer setAppState={setAppState} />

                </div>


                <div className="stat__body">

                    <div className="stat__body-title">
                        <h2 style={{ fontWeight: 400, fontSize: '2em' }}>Summarize </h2>
                    </div>

                    <NavLine
                        speciality={speciality}
                        specialities={specialities}
                        setSpeciality={(e: string) => setSpeciality(e)}
                    />

                    <div className="stat__graphs">
                        <GraphBox
                            data={graphState?.graphDatas[0] || []}
                            placeholder="Total resumes sents"
                            result={graphState?.totalResumesSent}
                            monthProgression={20}
                            lineColor="#207900"
                            color="#aaff8b"
                        />
                        <GraphBox
                            data={graphState?.graphDatas[1] || []}
                            placeholder="Total responses recieved"
                            result={graphState?.totalResponsesRecieved}
                            monthProgression={70}
                            lineColor="#B20041"
                            color="#ff7e9a"
                        />
                        <GraphBox
                            data={graphState?.graphDatas[2] || []}
                            placeholder="Total interviews"
                            result={graphState?.totalInterviews}
                            monthProgression={50}
                            lineColor="#0043BF"
                            color="#83aeff"
                        />
                    </div>

                    <CompanyContainer
                        applications={currentApplications}
                    />
                </div >
            </div >
        </div >
    )
}

export default StatisticsPage