import type { Application } from "./applications"

/*
    Graph state
*/
export type GraphState = {
    totalInterviews: number,
    totalResumesSent: number,
    totalResponsesRecieved: number,
    graphDatas: Array<any>
}

/*
    Applications grouped by dates
*/

export type AppDateGroupedType = {
    date: string,
    items: Application[]
}

