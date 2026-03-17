import { useMemo, useState } from "react"
import type { Application, ApplicationState } from "../types/applications"
import { computeGraphData } from "../utils/parsing/graph"
import { sortAppsByDate } from "../utils/parsing/date"


export const useDatas = (data: ApplicationState) => {

    const [speciality, setSpeciality] = useState("")

    const specialities = useMemo(
        () => {
            const spes = Array.from(new Set(data.map((item: Application) => item.speciality)))
            if (spes.length > 0)
                setSpeciality(spes[0])
            return spes
        },
        [data]
    )

    const graphState = useMemo(
        () => {
            const appsBySpeciality = data.filter(e => e.speciality === speciality)
            return computeGraphData(appsBySpeciality)
        },
        [data, speciality]
    )


    const currentApplications = useMemo(
        () => sortAppsByDate(data.filter(e => e.speciality === speciality), true),
        [speciality]
    )

    return {
        graphState,
        specialities,
        speciality,
        setSpeciality,
        currentApplications
    }
}


