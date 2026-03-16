import React, { useEffect, useState } from 'react'
import ButtonUpload from '../ButtonUpload/ButtonUpload'
import { cleanDatas, normalizeDatas } from '../../features/applicationsDatas/utils'

import Papa from 'papaparse';
import { MAX_SIZE } from '../../main';


import errorSmiley from '@/assets/errorSmiley.svg'
import errorArrow1 from '@/assets/errorArrow1.svg'
import errorArrow2 from '@/assets/errorArrow2.svg'
import errorArrow3 from '@/assets/errorArrow3.svg'

import '@/components/UploadContainer/UploadContainer.css'

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


type UploadContainerProps = {
    setAppState: (e: any) => void
}

function UploadContainer({ setAppState }: UploadContainerProps) {

    const [uploadError, setUploadError] = useState<String>("")
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        initAppsExample()
    }, [])

    async function initAppsExample() {
        const text = await fetch("/apps_example.csv").then(r => r.text())
        Papa.parse(text, {
            header: true,
            complete: (e: any) => {
                setLoading(false)
                const d = cleanDatas(e.data)
                setAppState(d.map((e: any, i: number) => normalizeDatas(e, i)))
            }
        })
    }


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
                const d = cleanDatas(e.data)
                setAppState(d.map((e: any, i: number) => normalizeDatas(e, i)))
            }
        })
    }


    return (
        <div className='upload__container'>
            <p>Let's start by uploading your Google Sheet document ! </p>
            <p className='upload__container-instructions' >
                Go on the google sheet page and click on <b>File</b> &gt; <b>Download</b> &gt; <b>Values separeted ... (.csv)</b> or import your own <b>csv</b> file
            </p>
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
    )
}

export default UploadContainer