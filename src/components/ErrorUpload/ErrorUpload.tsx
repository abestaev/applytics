import errorSmiley from '@/assets/errorSmiley.svg'
import errorArrow1 from '@/assets/errorArrow1.svg'
import errorArrow2 from '@/assets/errorArrow2.svg'
import errorArrow3 from '@/assets/errorArrow3.svg'

import styles from '@/components/ErrorUpload/ErrorUpload.module.css'

type ErrorUploadProps = {
    placeholder: String
}

const ErrorUpload = ({ placeholder }: ErrorUploadProps) => {
    return (
        <>
            <div className={styles.container} >
                <img src={errorSmiley} alt="error" />
                <div>
                    <div className={styles.arrows__container}>
                        <img src={errorArrow1} />
                        <img src={errorArrow3} />
                    </div>
                    <p className={styles.text}>{placeholder}</p>
                    <img
                        src={errorArrow2}
                        alt='error arrow'
                        className={styles.arrow3}
                    />
                </div>
            </div>
        </>
    )
}

export default ErrorUpload