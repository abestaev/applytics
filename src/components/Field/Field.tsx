import React from 'react'

import unfoldMoreIcon from '@/assets/unfoldMoreIcon.svg'

import '@/components/Field/Field.css'

type FieldProps = {
    placeholder: string
}

function Field({ placeholder }: FieldProps) {
    return (
        <div className='field__container'
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
                gap: '0.3em',
                cursor: 'pointer'
            }}
        >
            <p className='field__p'
                style={{
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontSize: '0.9em'
                }}
            >{placeholder}</p>
            <img className='field__img' src={unfoldMoreIcon} />
        </div>
    )
}

export default Field