import type { Application } from "../../types/general";

export const filterSearch = (search: string, application: Application[]) => {
    return application.filter(e => e.company.startsWith(search))
}