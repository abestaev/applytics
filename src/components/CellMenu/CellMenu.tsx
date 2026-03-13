import './CellMenu.css'
import { FC } from 'react'
import searchIcon from '@/assets/searchIcon.svg' 
import homeIcon from '@/assets/homeIcon.svg' 
import dashboardIcon from '@/assets/dashboardIcon.svg' 
import statisticsIcon from '@/assets/statisticsIcon.svg' 
import projectsIcon from '@/assets/projectsIcon.svg' 
import settingsIcon from '@/assets/settingsIcon.svg' 
import messagesIcon from '@/assets/messagesIcon.svg' 

import '@/components/CellMenu/CellMenu.css'

const ICONS: Record<string, string> = {
  homeIcon, 
  dashboardIcon,
  statisticsIcon,
  projectsIcon, 
  settingsIcon,
  messagesIcon
}

type CellMenuProps = {
  placeholder?: string
  icon?: string, 
  selected?:boolean
}

const CellMenu: FC<CellMenuProps> = ({ placeholder = 'Search', icon = searchIcon, selected = false }) => {
  return (
    <button className="cellmenu">
      <img className="cellmenu__icon" src={ICONS[icon] || searchIcon} alt="menu icon" />
      <p 
        className='cellmenu__text'
        style={selected ? {fontWeight: 600, fontSize: '1.2em'} : {}}
      >{placeholder}</p>
    </button>
  )
}

export default CellMenu
