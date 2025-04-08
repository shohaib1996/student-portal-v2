import { ImageIcon } from "lucide-react";

import { InsertImageDialog } from "../../plugins/images-plugin";

import { ComponentPickerOption } from "../../plugins/picker/component-picker-option";

export function ImagePickerPlugin(onImageUpload: (file: File) => any) {

  return new ComponentPickerOption('Image', {
    icon: <ImageIcon className="size-4" />,
    keywords: ['image', 'photo', 'picture', 'file'],
    onSelect: (_, editor, showModal) =>
      showModal('Insert Image', (onClose) => (
        <InsertImageDialog onImageUpload={onImageUpload} activeEditor={editor} onClose={onClose} />
      )),
  })
}