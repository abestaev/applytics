import React from 'react'

import unfoldMoreIcon from '@/assets/unfoldMoreIcon.svg'

import styles from '@/components/Field/Field.module.css'

type FieldProps = {
    placeholder: string
}

function Field({ placeholder }: FieldProps) {
    return (
        <div className={styles.container}>
            <p className={styles.container__text}
            >{placeholder}</p>
            <img className={styles.container__img} src={unfoldMoreIcon} />
        </div>
    )
}

export default Field