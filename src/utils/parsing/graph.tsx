
import type { AppDateGroupedType } from "@/types/general"

import { getMonthString, groupAppsByDate, sortAppsByDate } from "./date"
import type { Application } from "../../types/applications"
import type { GraphState } from "../../types/graph"


export const getLastResumesSent = (datas: AppDateGroupedType[]) => {
    return datas.reduce((acc, curr) => {
        if (curr.items && curr.items.length)
            acc.push(curr.items.length as never)
        return acc
    }, [])
}

export const getLastResponsesRecieved = (datas: AppDateGroupedType[]) => {
    return datas.reduce((acc, curr) => {
        if (curr.items) {
            const num = curr.items.reduce((acc: number, curr: Application) => {
                return (curr.status === "REFUSED" ? 1 : 0) + acc
            }, 0)
            acc.push(num as never)
        }
        return acc
    }, [])
}

export const getLastInterviews = (datas: AppDateGroupedType[]) => {
    return datas.reduce((acc, curr) => {
        if (curr.items) {
            const num = curr.items.reduce((acc: number, curr: Application) => {
                return (curr.interviews as number > 0 ? curr.interviews as number : 0) + acc
            }, 0)
            acc.push(num as never)
        }
        return acc
    }, [])
}


export const filerGraphDatasByMonth = (datas: AppDateGroupedType[], month: number) => {
    return datas.filter(e => {
        return month === getMonthString(e.date)
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
