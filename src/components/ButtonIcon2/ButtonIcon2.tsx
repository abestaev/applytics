import React from 'react'

import moreIcon from '@/assets/moreIcon.svg'
import '@/components/ButtonIcon2/ButtonIcon2.css'

const ICONS: Record<string, string> = {
    moreIcon
}

type ButtonIcon2Props = {
    icon: string
}

function ButtonIcon2({ icon }: ButtonIcon2Props) {
    return (
        <div className='buttonicon2'>
            <img className='buttonicon2__icon' src={ICONS[moreIcon] || moreIcon} alt={moreIcon} />
        </div>
    )
}

export default ButtonIcon2