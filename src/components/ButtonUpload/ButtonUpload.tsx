
import downloadIcon from '@/assets/downloadIcon.svg'

import googleSheetIcon from '@/assets/googleSheetIcon.svg'

type ButtonUploadProps = {
  placeholder: string
  onChange?: (e: any) => void
}

export function ButtonUpload({ placeholder, onChange }: ButtonUploadProps) {
  return (
    <label className="button-icon">
      <input
        type="file"
        onChange={onChange}
        style={{ display: 'none' }}
      />

      <img className="button-icon__icon" src={downloadIcon} alt="" />

      {placeholder && (
        <>
          <span className="button-icon__text">{placeholder}</span>
          <img className="button-icon__icon" src={googleSheetIcon} alt="" />
        </>
      )}
    </label>
  )
}



export default ButtonUpload