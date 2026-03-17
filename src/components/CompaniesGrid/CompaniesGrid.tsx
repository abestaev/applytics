
import Field from '@/components/Field/Field.tsx'
import DataLine from '@/components/DataLine/DataLine.tsx'
import type { Application } from '../../types/applications'

import styles from '@/components/CompaniesGrid/CompaniesGrid.module.css'

import '@/index.css'

type CompaniesGridType = {
    applications: Application[]
}

function CompaniesGrid({ applications }: CompaniesGridType) {

    return (
        <div className={styles.container} >
            <div
                className={styles.grid__row}
            >
                <div style={{ marginRight: '1em' }}>
                    <input type="checkbox" />
                </div>
                <div>
                    <Field placeholder="Name" />
                </div>
                <div>
                    <Field placeholder="Date" />
                </div>
                <div>
                    <Field placeholder="Type" />
                </div>
                <div style={{ textWrap: 'nowrap', whiteSpace: 'nowrap', wordWrap: 'break-word', textOverflow: 'ellipsis' }}>
                    <Field placeholder="City" />
                </div>
                <div>
                    <Field placeholder="% of total" />
                </div>
            </div>
            <div className={`${styles.container__apps} scrollable`}>
                {
                    applications?.map((a: Application, i: number) =>
                        <DataLine
                            key={a.id}
                            index={i}
                            application={a}
                            applications={applications}
                            percentTotal={Math.round(applications.filter(e => e.company === a.company).length / applications.length * 100)}
                        />
                    )
                }
            </div>
        </div>

    )
}

export default CompaniesGrid