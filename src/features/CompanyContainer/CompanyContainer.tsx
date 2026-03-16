import React, { useEffect, useState } from 'react'


import NavButton from '@/components/NavButton/NavButton'
import SearchBar from '../../components/SearchBar/SearchBar'
import ButtonIcon from '../../components/ButtonIcon/ButtonIcon'
import type { Application } from '../../types/general'
import CompaniesGrid from '../../components/CompaniesGrid/CompaniesGrid'

import styles from './CompanyContainer.module.css'

type CompanyContainerProps = {
    applications: Application[]
}

function CompanyContainer({ applications }: CompanyContainerProps) {

    const [currentApplications, setCurrentApplications] = useState<Array<Application>>([])

    const [searchInput, setSearchInput] = useState<string>("")

    useEffect(() => {
        if (applications && applications.length)
            setCurrentApplications(applications)
    }, [applications])


    const searchApps = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value && e.target.value.length < 100)
            setCurrentApplications(applications.filter(a => a.company.startsWith(e.target.value.toUpperCase()) || a.company.startsWith(e.target.value)))
        else
            setCurrentApplications(applications)
    }


    return (
        <div className={`${styles.statistics__companies} blur`}>

            <h2 className={styles.statistics__companies__h2}>Companies</h2>
            <div className={styles.statistics__companies__options}>
                <div style={{
                    flex: '2',
                    display: 'flex',
                    alignContent: 'flex-start'
                }}>
                    <NavButton />
                </div>
                <div
                    style={{
                        display: 'flex',
                        gap: '1em',
                        flex: '1'
                    }}
                >
                    <SearchBar
                        searchInput={searchInput}
                        setSearchInput={searchApps}
                        applications={currentApplications}
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