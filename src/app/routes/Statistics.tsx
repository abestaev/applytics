import ButtonIcon from "@/components/ButtonIcon/ButtonIcon"

import '@/app/routes/Statistics.css'
import NavLine from "@/components/NavLine/NavLine"
import GraphBox from "@/components/GraphBox/GraphBox"
import NavButton from "@/components/NavButton/NavButton"

import { useState } from "react"
import SearchBar from "../../components/SearchBar/SearchBar"

import pinkVector from '@/assets/pinkVector.svg'
import greenVector from '@/assets/greenVector.svg'
import blueVector from '@/assets/blueVector.svg'

import errorSmiley from '@/assets/errorSmiley.svg'
import errorArrow1 from '@/assets/errorArrow1.svg'
import errorArrow2 from '@/assets/errorArrow2.svg'
import errorArrow3 from '@/assets/errorArrow3.svg'
import ButtonUpload from "../../components/ButtonUpload/ButtonUpload"
import CompaniesGrid from "../../components/CompaniesGrid/CompaniesGrid"

import Papa from 'papaparse';
import {
    normalizeDatas,

} from "../../features/applicationsDatas/utils"
import { useDatas } from "../../hooks/useDatas"
import type { ApplicationState } from "../../types/general"


type ErrorUploadProps = {
    placeholder: String
}

const ErrorUpload = ({ placeholder }: ErrorUploadProps) => {
    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1em',
                    marginTop: '1em'
                }}
            >
                <img src={errorSmiley} alt="error" />
                <div

                >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <img src={errorArrow1} />
                        <img src={errorArrow3} />
                    </div>
                    <p style={{ padding: '0.5em 0' }}>{placeholder}</p>
                    <img
                        src={errorArrow2}
                        alt='error arrow'
                        style={{
                            display: 'flex',
                            justifySelf: 'center'
                        }}
                    />
                </div>
            </div>
        </>
    )
}

const MAX_SIZE = 1 * 1024 * 1024 // 1MB


const StatisticsPage = () => {

    const [appState, setAppState] = useState<ApplicationState>([])

    const { graphState, specialities, speciality, setSpeciality, currentApplications } = useDatas(appState)


    const [uploadError, setUploadError] = useState<String>("")
    const [loading, setLoading] = useState(false)


    const uploadCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (!file) return

        setUploadError("")

        if (file.type !== "text/csv") {
            setUploadError("Nop ! Only .csv type document allowed")
            return
        }
        if (file.size > MAX_SIZE) {
            setUploadError("Oops ! Your document is to big. Pick a smaller one (<1Mb)")
            return
        }
        setLoading(true)

        Papa.parse(file, {
            header: true,
            complete: (e: any) => {
                setLoading(false)
                setAppState(e.data.map((e: any, i: number) => normalizeDatas(e, i)))
            }
        })
    }


    return (
        <div className="statistics">
            <div className="statistics-container" style={{ position: 'relative' }}>
                <img src={pinkVector} style={{ position: 'absolute', top: 0, left: 0, height: '30em', zIndex: -1 }} />
                <img src={greenVector} style={{ position: 'absolute', left: 0, zIndex: -1 }} />
                <img src={blueVector} style={{ position: 'absolute', right: 0, top: 0 }} />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >

                    <div className="statistics__header">
                        <h1 className="statistics__header__titlelight">Resume your Internships</h1>
                        <h1 className="statistics__header__titlebold">Applications</h1>
                    </div>
                    <p style={{ marginTop: '1em', fontSize: '1.1em' }}>Keep tracks of your applications from a simple interface</p>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: '3em',
                        }}
                    >
                        <p>Let's start by uploading your Google Sheet document ! </p>
                        <p
                            style={{ fontSize: '0.94em', marginBottom: '1em', zIndex: 1 }}
                        >Go on the google sheet page and click on <b>File</b> &gt; <b>Download</b> &gt; <b>Values separeted ... (.csv)</b> or import your own <b>csv</b> file </p>
                        {
                            loading ?
                                <div className="loader"></div> :
                                <ButtonUpload
                                    placeholder="Upload"
                                    onChange={(e) => { uploadCSV(e) }}
                                />
                        }
                        {
                            uploadError && <ErrorUpload placeholder={uploadError} />
                        }
                    </div>
                </div>

                <div className="statistics-container-2">

                    <div className="statistics__title__2">
                        <h2 style={{ fontWeight: 400, color: 'black', fontSize: '2em' }}>Summarize </h2>
                    </div>

                    <NavLine
                        speciality={speciality}
                        specialities={specialities}
                        setSpeciality={(e: string) => setSpeciality(e)}
                    />

                    <div className="statistics__graphes">
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

                    <div className="statistics__companies blur">

                        <h2 className="statistics__companies__h2">Companies</h2>
                        <div className="statistics__companies__options">
                            <div style={{
                                flex: '2',
                                display: 'flex',
                                alignContent: 'flex-start'
                            }}>
                                <NavButton />
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1em',
                                    flex: '1'
                                }}
                            >
                                <SearchBar />
                                <ButtonIcon icon="filterIcon" placeholder="Filters" />
                            </div>
                        </div>

                        <CompaniesGrid
                            applications={currentApplications || []}
                        />

                    </div>
                </div>
            </div>
        </div>
    )
}

export default StatisticsPage