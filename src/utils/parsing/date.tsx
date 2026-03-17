import type { Application } from "../../types/applications"
import type { AppDateGroupedType } from "../../types/graph"

export const getMonthString = (date: string) => {
    return Number(date.split("/")[1])
}

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
                date: key as string,
                items: []
            }
        }

        acc[key as string].items.push(curr)

        return acc
    }, {} as Record<string, AppDateGroupedType>)

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
