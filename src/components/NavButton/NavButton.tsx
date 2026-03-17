
import styles from '@/components/NavButton/NavButton.module.css'


function NavButton() {

    const pickStyle = (index: number) => {
        if (index == 0)
            return { borderRight: "var(--border)" }
        //else if (index == categories.length - 1)
        //    return { ...style, borderLeft: "1px solid rgba(0, 0, 0, 0.3)" }
        else if (index == 2)
            return { borderLeft: "var(--border)" }
    }

    return (
        <div className={styles.container}>
            <button
                className={styles.button}
                style={pickStyle(0)}
            >
                View All
            </button>
            <button
                className={styles.button}
                style={pickStyle(1)}
            >
                Public
            </button>
            <button
                className={styles.button}
                style={pickStyle(2)}
            >
                Private
            </button>
        </div>
    )
}

export default NavButton