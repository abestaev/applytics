
import type { RawApplication, AppDateGroupedType } from "@/types/general"
import type { Application, GraphState } from "../../types/general"
import { STATUS_TYPE, TYPE_VALUES } from "../../main"


export const parseDate = (dateStr: string) => {
    if (!dateStr)
        return 0
    const [day, month, year] = dateStr.split("/")
    return new Date(+year, +month - 1, +day).getTime()
}


export const groupAppsByDate = (data: Application[]): AppDateGroupedType[] => {

    const grouped = data.reduce((acc, curr) => {
        const key = curr.date
        if (!key) return acc

        if (!acc[key as string]) {
            acc[key as string] = {
                Date: key as string,
                items: []
            }
        }

        acc[key as string].items.push(curr)

        return acc
    }, {} as Record<string, { Date: string; items: RawApplication[] }>)

    return Object.values(grouped)
}

export const sortAppsByDate = (datas: Application[], reverse: boolean = false) => {
    return [...datas].sort(
        (a: Application, b: Application) => {
            if (reverse)
                return parseDate(b.date as string) - parseDate(a.date as string)
            return parseDate(a.date as string) - parseDate(b.date as string)
        }
    )
}

export const getLastResumesSent = (datas: { Date: string, items: RawApplication[] }[]) => {
    return datas.reduce((acc, curr) => {
        if (curr.items && curr.items.length)
            acc.push(curr.items.length as never)
        return acc
    }, [])
}

export const getLastResponsesRecieved = (datas: { Date: string, items: RawApplication[] }[]) => {
    return datas.reduce((acc, curr) => {
        if (curr.items) {
            const num = curr.items.reduce((acc, curr) => {
                return (curr.status === "REFUSED" ? 1 : 0) + acc
            }, 0)
            acc.push(num as never)
        }
        return acc
    }, [])
}

export const getLastInterviews = (datas: { Date: string, items: RawApplication[] }[]) => {
    return datas.reduce((acc, curr) => {
        if (curr.items) {
            const num = curr.items.reduce((acc, curr) => {
                return (curr.interviews as number > 0 ? curr.interviews as number : 0) + acc
            }, 0)
            acc.push(num as never)
        }
        return acc
    }, [])
}


export const getMonthString = (date: string) => {
    return Number(date.split("/")[1])
}

export const filerGraphDatasByMonth = (datas: { Date: string, items: RawApplication[] }[], month: number) => {
    return datas.filter(e => {
        return month === getMonthString(e.Date)
    })
}



const getGeneralInfosFromDatas = (datas: Application[]) => {
    const totalInterviews = datas.reduce((acc, curr) => Number(curr.interviews ?? 0) + acc, 0)
    const totalResumesSent = datas.length
    const totalResponsesRecieved = datas.filter(a => a.status === "REFUSED").length
    return { totalInterviews, totalResumesSent, totalResponsesRecieved }
}


export const computeGraphData = (datas: Application[]): GraphState => {

    const generalInfos = getGeneralInfosFromDatas(datas)

    const sortedDatas = sortAppsByDate(datas)

    const appsByDate = groupAppsByDate(sortedDatas)

    let currentMonth = new Date().getMonth() + 1
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1

    let datasCurrentMonth = filerGraphDatasByMonth(appsByDate, currentMonth)

    if (datasCurrentMonth.length === 0 && sortedDatas.length > 0) {
        currentMonth = getMonthString(sortedDatas[sortedDatas.length - 1].date)
        datasCurrentMonth = filerGraphDatasByMonth(appsByDate, currentMonth)
    }

    // const datasPreviousMonth = filerGraphDatasByMonth(datas, previousMonth)

    const lastResumesSentCurrentMonth = getLastResumesSent(datasCurrentMonth)
    // const lastResumesSentPreviousMonth = getLastResumesSent(datasCurrentMonth)

    const lastResponsesRecievedCurrentMonth = getLastResponsesRecieved(datasCurrentMonth)
    // const lastResponsesRecievedPreviousMonth = getLastResponsesRecieved(datasPreviousMonth)

    const lastInterviewsCurrentMonth = getLastInterviews(datasCurrentMonth)
    // const lastInterviewsPreviousMonth = getLastInterviews(datasPreviousMonth)

    const graphDatas = [lastResumesSentCurrentMonth, lastResponsesRecievedCurrentMonth, lastInterviewsCurrentMonth]

    return { ...generalInfos, graphDatas }

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

export const notNull = (s: string) => {
    return s && s.length > 0
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
