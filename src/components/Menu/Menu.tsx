
import SearchBar from "@/components/SearchBar/SearchBar"

import '@/components/Menu/Menu.css'

import CellMenu from "../../components/CellMenu/CellMenu"

import internshipsIcon from "@/assets/internshipsIcon.svg"
import ContactLinks from "../../components/ContactLinks/ContactLinks"

function Menu() {
    return (
        <div className="menu-container-1">

            <div className="menu__titlecontainer">
                <img className="menu__internshipsIcon" src={internshipsIcon} alt="internships icon" />
                <h1 className="menu__title">Internships</h1>
            </div>

            <div className="menu__searchbarcontainer">
                <SearchBar />
            </div>

            <div>
                <CellMenu placeholder="Home" icon="homeIcon" />
                <CellMenu placeholder="Dashboard" icon="dashboardIcon" />
                <CellMenu placeholder="Statistics" icon="statisticsIcon" selected={true} />
                <CellMenu placeholder="Projects" icon="projectsIcon" />
                <div className="menu__line"></div>
            </div>
            <div>
                <CellMenu placeholder="Settings" icon="settingsIcon" />
                <CellMenu placeholder="Support" icon="messagesIcon" />
            </div>
            <div className="menu__contacts">
                <ContactLinks placeholder="Linkedin" icon="linkedinIcon" url="https://www.linkedin.com/in/mezyann-tellal-139a19291" />
                <ContactLinks placeholder="Hack The Box" icon="htbIcon" url="https://app.hackthebox.com/public/users/1947096" />
                <ContactLinks placeholder="Leetcode" icon="leetcodeIcon" url="https://leetcode.com/u/mtellal/" />
                <ContactLinks placeholder="Github" icon="githubIcon" url='https://github.com/mtellal' />
            </div>
        </div>
    )
}

export default Menu