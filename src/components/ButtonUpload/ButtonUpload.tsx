
import downloadIcon from '@/assets/downloadIcon.svg'

import googleSheetIcon from '@/assets/googleSheetIcon.svg'

type ButtonUploadProps = {
  placeholder: string
  onChange?: (e: any) => void
}

export function ButtonUpload({ placeholder, onChange }: ButtonUploadProps) {
  return (
    <label>
      <input
        type="file"
        onChange={onChange}
        style={{ display: 'none' }}
      />

      <img src={downloadIcon} alt="" />

      {placeholder && (
        <>
          <span>{placeholder}</span>
          <img src={googleSheetIcon} alt="" />
        </>
      )}
    </label>
  )
}



export default ButtonUpload