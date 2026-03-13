import './SearchBar.css'
import { FC } from 'react'
import searchIcon from '@/assets/searchIcon.svg' // ton icône

type SearchBarProps = {
  placeholder?: string
}

const SearchBar: FC<SearchBarProps> = ({ placeholder = 'Search' }) => {
  return (
    <div className="search-bar">
      <img className="search-bar__icon" src={searchIcon} alt="Search icon" />
      <input
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
      />
    </div>
  )
}

export default SearchBar
