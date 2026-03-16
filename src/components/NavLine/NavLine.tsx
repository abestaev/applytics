
import '@/components/NavLine/NavLine.css'


type NavLineProps = {
    speciality: string,
    specialities: string[],
    setSpeciality: (e: string) => void
}

const NavLine = ({ speciality, specialities, setSpeciality }: NavLineProps) => {


    const updateCategorie = (currentCategorie: string, categorie: string) => {
        if (currentCategorie != categorie) {
            setSpeciality(categorie)
        }
    }

    const pickStyle = (index: number) => {
        const style = {
            borderRadius: '10px',
            backgroundColor: 'white'
        }
        if (index == 0)
            return { ...style, backgroundColor: 'white', borderRight: "var(--border)" }
        //else if (index == categories.length - 1)
        //    return { ...style, borderLeft: "1px solid rgba(0, 0, 0, 0.3)" }
        else
            return { ...style, backgroundColor: 'white', borderRight: "var(--border)", borderLeft: "var(--border)" }
    }

    return (
        <div className='navline__container blur'>
            {
                specialities && specialities.filter(e => e && e.match('^[a-zA-Z0-9]+$')).map((e, i) =>
                    <p
                        key={i}
                        className='navline__text'
                        onClick={() => updateCategorie(speciality, e)}
                        style={speciality == e ? pickStyle(i) : {}}
                    >
                        {e}
                    </p>
                )
            }
        </div>
    )
}

export default NavLine