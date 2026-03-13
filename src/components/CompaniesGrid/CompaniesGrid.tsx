
import Field from '@/components/Field/Field.tsx'
import DataLine from '@/components/DataLine/DataLine.tsx'
import type { Application } from '../../types/general'


type CompaniesGridType = {
    applications: Application[]
}

function CompaniesGrid({ applications }: CompaniesGridType) {

    return (

        <div style={{
            position: 'relative',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
        }}>

            <div
                style={{
                    display: 'grid',
                    padding: '0.5em 1em',
                    borderTop: 'var(--border)',
                    gridTemplateColumns: 'auto 4fr 1fr 1fr 1fr 1fr',
                    rowGap: '1em'
                }}
            >
                <div style={{ marginRight: '1em', justifyItems: 'flex-start' }}>
                    <input type="checkbox" />
                </div>
                <div style={{ justifyItems: 'flex-start', marginRight: 'auto' }}>
                    <Field placeholder="Name" />
                </div>
                <div style={{ justifyItems: 'flex-start', marginRight: 'auto' }}>
                    <Field placeholder="Date" />
                </div>
                <div style={{ justifyItems: 'flex-start', marginRight: 'auto' }}>
                    <Field placeholder="Type" />
                </div>
                <div style={{ justifyItems: 'flex-start', marginRight: 'auto', textWrap: 'nowrap', whiteSpace: 'nowrap', wordWrap: 'break-word', textOverflow: 'ellipsis' }}>
                    <Field placeholder="City" />
                </div>
                <div style={{ justifyItems: 'flex-start', marginRight: 'auto' }}>
                    <Field placeholder="% of total" />
                </div>
            </div>
            {
                applications?.map((a: Application) =>
                    <DataLine
                        key={a.id}
                        application={a}
                        applications={applications}
                        percentTotal={Math.round(applications.filter(e => e.company === a.company).length / applications.length * 100)}
                    />
                )
            }
        </div>

    )
}

export default CompaniesGrid