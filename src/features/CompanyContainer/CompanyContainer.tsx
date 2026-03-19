import React, { useEffect, useState } from 'react'

import NavButton from '@/components/NavButton/NavButton'
import SearchBar from '../../components/SearchBar/SearchBar'
import ButtonIcon from '../../components/ButtonIcon/ButtonIcon'
import type { Application } from '../../types/applications'
import CompaniesGrid from '../../components/CompaniesGrid/CompaniesGrid'

import styles from './CompanyContainer.module.css'

type CompanyContainerProps = {
    speciality: string,
    applications: Application[]
}

function CompanyContainer({ speciality, applications }: CompanyContainerProps) {

    const [currentApplications, setCurrentApplications] = useState<Array<Application>>([])

    const [searchInput, setSearchInput] = useState<string>("")

    useEffect(() => {
        setCurrentApplications(applications)
    }, [applications])

    useEffect(() => {
        setSearchInput("")
    }, [speciality])


    const searchApps = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value && e.target.value.length < 100) {
            setSearchInput(e.target.value)
            setCurrentApplications(applications.filter(a => a.company.startsWith(e.target.value.toUpperCase()) || a.company.startsWith(e.target.value)))
        }
        else {
            setSearchInput("")
            setCurrentApplications(applications)
        }
    }

    return (
        <div className={`${styles.container} blur`}>

            <h3 className={styles.title}>Companies</h3>
            <div className={styles.row}>
                <div className={styles.row__navbutton} >
                    <NavButton />
                </div>
                <div className={styles.row__searchbar} >
                    <SearchBar
                        searchInput={searchInput}
                        setSearchInput={searchApps}
                    />
                    <ButtonIcon icon="filterIcon" placeholder="Filters" onClick={() => { }} />
                </div>
            </div>

                    <CompaniesGrid
                        applications={currentApplications || []}
                    />
            

        </div>
    )
}

export default CompanyContainer