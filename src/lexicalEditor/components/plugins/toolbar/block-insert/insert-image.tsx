'use client'

import { ImageIcon } from 'lucide-react'

import { useToolbarContext } from '../../../context/toolbar-context'
import { SelectItem } from '../../../../ui/select'

import { InsertImageDialog } from '../../../plugins/images-plugin'

export function InsertImage({onImageUpload}: { onImageUpload: (file: File) => any }) {
  const { activeEditor, showModal } = useToolbarContext()

  return (
    <SelectItem
      value="image"
      onPointerUp={(e) => {
        showModal('Insert Image', (onClose) => (
          <InsertImageDialog onImageUpload={onImageUpload} activeEditor={activeEditor} onClose={onClose} />
        ))
      }}
      className=""
    >
      <div className="flex items-center gap-1">
        <ImageIcon className="size-4" />
        <span>Image</span>
      </div>
    </SelectItem>
  )
}
