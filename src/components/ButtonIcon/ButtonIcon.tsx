
import filterIcon from '@/assets/filterIcon.svg'
import downloadIcon from '@/assets/downloadIcon.svg'

import moreIcon from '@/assets/moreIcon.svg'

import googleSheetIcon from '@/assets/googleSheetIcon.svg'

type ButtonIconProps = {
  icon: string
  placeholder?: string,
  onClick: () => void
}

const ICONS: Record<string, string> = {
  filterIcon,
  downloadIcon,
  moreIcon
}

const ButtonIcon = ({ icon, placeholder, onClick }: ButtonIconProps) => {
  return (
    <div>
      <button  onClick={onClick}>
        <img  src={ICONS[icon] || filterIcon} alt={placeholder} />
        {
          placeholder &&
          <>
            <span>{placeholder}</span>
            {
              icon === "downloadIcon" &&
                <img src={googleSheetIcon} alt={placeholder} />
            }
          </>
        }
      </button>
    </div>
  )
}




export default ButtonIcon