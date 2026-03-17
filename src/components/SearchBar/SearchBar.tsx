import { FC, useRef, useState } from 'react'
import searchIcon from '@/assets/searchIcon.svg' // ton icône

import styles from '@/components/SearchBar/SearchBar.module.css'

type SearchBarProps = {
    searchInput: string,
    setSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void,
    placeholder?: string
}

const SearchBar: FC<SearchBarProps> = ({ searchInput, setSearchInput, placeholder = 'Search' }) => {

    const divRef = useRef(null)

    return (
        <div ref={divRef} className={styles.container} >
            <img className={styles.icon} src={searchIcon} alt="Search icon" />
            <input
                value={searchInput}
                onChange={(e) => setSearchInput(e)}
                type="text"
                className={styles.input}
                placeholder={placeholder}
            />
        </div>
    )
}

export default SearchBar
