

export type RawApplication = {
    Company: string,
    Link: string,
    Date: Date | string,
    Speciality: string,
    Status: string,
    Type: "CDI" | "Internship",
    City?: string,
    Spontaneous?: boolean | string,
    Interviews?: number | string,
    Others?: string
}


export type Application = {
    id: number,
    company: string,
    link: string,
    date: string,
    speciality: string,
    status: string,
    type: "CDI" | "Internship",
    city?: string,
    spontaneous?: boolean | string,
    interviews?: number | string,
    others?: string
}


export type ApplicationState = Application[]







export type GraphState = {
    totalInterviews: number,
    totalResumesSent: number,
    totalResponsesRecieved: number,
    graphDatas: Array<any>
}









export type AppDateGroupedType = {
    date: string,
    items: RawApplication[]
}


export type ApplicationResponseType = {
    specialities: string[],
    totalInterviews: number,
    totalResumesSent: number,
    totalResponsesRecieved: number,
    datas: AppSortedBySpeType[],
    datasGroupedByDate: AppDateGroupedType[]
}


export type AppSortedBySpeType = {
    speciality: string,
    rawItems: RawApplication[],
    items: AppDateGroupedType[],
    totalInterviews: number,
    totalResumesSent: number,
    totalResponsesRecieved: number,
    graphDatas: Array<any>
}

