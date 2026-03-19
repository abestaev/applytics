import React, { useEffect, useState } from 'react'
import ButtonUpload from '../ButtonUpload/ButtonUpload'

import Papa from 'papaparse';
import { MAX_SIZE } from '../../main';

import ErrorUpload from '../ErrorUpload/ErrorUpload';

import styles from '@/components/UploadContainer/UploadContainer.module.css'
import { cleanDatas, normalizeDatas } from '../../utils/parsing/parsing';


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
                const cleaned = cleanDatas(e.data)
                setAppState(cleaned.map((e: any, i: number) => normalizeDatas(e, i)))
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
        if (file.size === 0) {
            setUploadError("Hum ... no ! Empty csv file not allowed")
            return
        }

        setLoading(true)

        Papa.parse(file, {
            header: true,
            complete: (e: any) => {
                setLoading(false)
                const cleaned = cleanDatas(e.data)
                const final = cleaned.map((e: any, i: number) => normalizeDatas(e, i))
                setAppState(final)
            }
        })
    }


    return (
        <div className={styles.container}>
            <p>Let's start by uploading your Google Sheet document ! </p>
            <p className={styles.instructions} >
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