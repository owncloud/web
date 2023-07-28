import { MaybeRef, unref } from 'vue'
import { CropVariantEnum } from '../../helpers'

const applyCropping = async (canvas: MaybeRef<any>, cropType: CropVariantEnum): Promise<Blob> => {
  const sourceCanvas = unref(canvas)
  let croppedCanvas
  switch (cropType) {
    case CropVariantEnum.Circular:
      croppedCanvas = document.createElement('canvas')
      const ctx: CanvasRenderingContext2D = croppedCanvas.getContext('2d')
      const width = sourceCanvas.width
      const height = sourceCanvas.height

      croppedCanvas.width = width
      croppedCanvas.height = height

      ctx.imageSmoothingEnabled = true
      ctx.drawImage(sourceCanvas, 0, 0, width, height)
      ctx.globalCompositeOperation = 'destination-in'
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true)
      ctx.fill()
      break
    default:
      croppedCanvas = sourceCanvas
  }

  const updatedBlob = await new Promise<Blob>((resolve) => {
    croppedCanvas.toBlob(resolve)
  })
  return updatedBlob
}

export default applyCropping
