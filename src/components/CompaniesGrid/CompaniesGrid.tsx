
import Field from '@/components/Field/Field.tsx'
import DataLine from '@/components/DataLine/DataLine.tsx'
import type { Application } from '../../types/general'

import '@/components/CompaniesGrid/CompaniesGrid.css'

import '@/index.css'

type CompaniesGridType = {
    applications: Application[]
}

function CompaniesGrid({ applications }: CompaniesGridType) {

    return (

        <div className='comp__grid' >
            <div
                className='comp__grid-rowgrid'
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
            <div className='comp__grid-c scrollable'>
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