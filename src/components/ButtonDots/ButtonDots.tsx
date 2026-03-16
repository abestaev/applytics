import React from 'react'

import moreIcon from '@/assets/moreIcon.svg'
import '@/components/ButtonDots/ButtonDots.css'

const ICONS: Record<string, string> = {
    moreIcon
}

type ButtonDotsProps = {
    icon: string
}

function ButtonDots({ icon }: ButtonDotsProps) {
    return (
        <div className='ButtonDots'>
            <img className='ButtonDots__icon' src={ICONS[moreIcon] || moreIcon} alt={moreIcon} />
        </div>
    )
}

export default ButtonDots