
/*
    Raw application type
*/ 
export type RawApplication = {
    Company: string,
    Link: string,
    Date: string,
    Speciality: string,
    Status: string,
    Type: "CDI" | "Internship",
    City?: string,
    Spontaneous?: string,
    Interviews?: string,
    Others?: string
}

/*
    Normalised RawApplication
*/ 

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

