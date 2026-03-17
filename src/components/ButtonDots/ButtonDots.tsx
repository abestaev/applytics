
import moreIcon from '@/assets/moreIcon.svg'

import styles from  '@/components/ButtonDots/ButtonDots.module.css'

const ICONS: Record<string, string> = {
    moreIcon
}


function ButtonDots() {
    return (
        <div className={styles.container}>
            <img className={styles.container__img} src={ICONS[moreIcon] || moreIcon} alt={moreIcon} />
        </div>
    )
}

export default ButtonDots