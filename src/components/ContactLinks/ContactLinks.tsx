import React from 'react'

import linkedinIcon from '@/assets/linkedinIcon.svg'
import htbIcon from '@/assets/htbIcon.svg'
import leetcodeIcon from '@/assets/leetcodeIcon.svg'
import githubIcon from '@/assets/githubIcon.svg'

import '@/components/ContactLinks/ContactLinks.css'

const ICONS: Record<string, string> = {
    linkedinIcon,
    htbIcon,
    leetcodeIcon,
    githubIcon
}

type ContactLinksProps = {
    placeholder: string,
    icon: string, 
    url: string
}

function ContactLinks({ placeholder, icon, url }: ContactLinksProps) {
    return (
        <div className='contactlinks__container'>
            <img className='contactlinks__icon' src={ICONS[icon]} alt={`${icon}`} />
            <a className="contactlinks__link" href={url}>{placeholder}</a>
        </div>
    )
}

export default ContactLinks