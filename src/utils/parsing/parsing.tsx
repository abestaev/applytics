import { STATUS_TYPE, TYPE_VALUES } from "../../main"
import type { Application, RawApplication } from "../../types/applications"

export const isAlphaNumeric = (s: string) => {
    if (s === undefined || s.length === 0) return false
    return /^[a-zA-Z 0-9]+$/.test(s)
}

export const isNumeric = (s: string) => {
    if (s === undefined || s.length === 0) return false
    return /^[0-9]+$/.test(s)
}

export const isAplha = (s: string) => {
    if (s === undefined || s.length === 0) return false
    return /^[a-zA-Z]+$/.test(s)
}

export const notNull = (s?: string | null): boolean => {
    return typeof s === 'string' && s.trim().length > 0
}

export const isValidDate = (dateStr: string): boolean => {

    if (!notNull(dateStr))
        return false

    const regex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!regex.test(dateStr)) return false
    const [day, month, year] = dateStr.split('/').map(Number)
    const date = new Date(year, month - 1, day)

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    )
}

export const trimObjValues = (obj: RawApplication) => {
    for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string' && k)
            obj[k as keyof RawApplication] = v.trim() as any
    }
    return obj
}


export const cleanDatas = (data: RawApplication[]) => {
    return data.filter(e => {
        e = trimObjValues(e)

        const d = notNull(e.Company) &&
            isValidDate(e.Date) &&
            isAlphaNumeric(e.Speciality) &&
            notNull(e.Status) && STATUS_TYPE.includes(e.Status) &&
            notNull(e.Type) && TYPE_VALUES.includes(e.Type) &&
            (e.City === undefined || e.City) &&
            (e.Spontaneous === undefined || (e.Spontaneous.trim().toLocaleLowerCase() === "yes" || e.Spontaneous.trim().toLocaleLowerCase() === "no")) &&
            (e.Interviews === undefined || isNumeric(e.Interviews.trim())) &&
            (e.Others === undefined || e.Others.trim())
        return d
    })
}


export const normalizeDatas = (data: RawApplication, id: number): Application => {
    return {
        id,
        company: data.Company,
        link: data.Link,
        date: data.Date,
        speciality: data.Speciality,
        status: data.Status,
        type: data.Type,
        city: data.City,
        spontaneous: data.Spontaneous,
        interviews: data.Interviews,
        others: data.Others
    }
}

