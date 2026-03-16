import './SearchBar.css'
import { FC, useRef, useState } from 'react'
import searchIcon from '@/assets/searchIcon.svg' // ton icône
import type { Application } from '../../types/general'


type SearchBarProps = {
    searchInput: string,
    setSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void,
    applications: Application[],
    placeholder?: string
}

const SearchBar: FC<SearchBarProps> = ({ searchInput, setSearchInput, applications, placeholder = 'Search' }) => {

    const divRef = useRef(null)

    return (
        <div ref={divRef} className="search-bar" style={{ position: 'relative' }} >
            <img className="search-bar__icon" src={searchIcon} alt="Search icon" />
            <input
                onChange={(e) => setSearchInput(e)}
                type="text"
                className="search-bar__input"
                placeholder={placeholder}
            />
            {/* {
                searchedApps && searchedApps.length > 0 &&
                <div style={{
                    border: 'var(--border)',
                    zIndex: '1',
                    width: '100%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    bottom: `-${Math.min(searchedApps.length * 35, 105) + 5 }px`,
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '105px',
                    height : `${ searchedApps.length * 35}px`,

                    overflow: 'auto'
                }}>
                    {
                        searchedApps.map((e: Application, i: number) => <p style={{ margin: 0, padding: 0, padding: '5px 10px', borderTop: i === 0 ? 'none' :'1px solid black' }}>{e.company}</p>)

                    }
                </div>
            } */}
        </div>
    )
}

export default SearchBar
