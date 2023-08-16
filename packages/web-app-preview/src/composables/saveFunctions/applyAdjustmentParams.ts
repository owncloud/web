import { MaybeRef, unref } from 'vue'
import { useImageAdjustmentParameters } from '../adjustmentParams'

type AdjustmentParamsProps = {
  imageBlob: MaybeRef<Blob>
  adjustmentParams: MaybeRef<any>
  activeRotation: MaybeRef<number>
}

const applyAdjustmentParams = async ({
  imageBlob,
  adjustmentParams,
  activeRotation
}: AdjustmentParamsProps): Promise<Blob> => {
  const imageAdjustmentParams = useImageAdjustmentParameters(unref(adjustmentParams))
  const blob = unref(imageBlob)
  const rotate = unref(activeRotation) || 0
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = document.createElement('img') // Use Image constructor for better control
  img.src = URL.createObjectURL(blob)

  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
  })

  canvas.width = img.width
  canvas.height = img.height

  ctx.translate(img.width / 2, img.height / 2)

  ctx.translate(-img.width / 2, -img.height / 2)

  // Calculate new dimensions after rotation
  if (rotate) {
    ctx.rotate((rotate * Math.PI) / 180)
    const angleRad = (rotate * Math.PI) / 180
    const rotatedWidth =
      Math.abs(img.width * Math.cos(angleRad)) + Math.abs(img.height * Math.sin(angleRad))
    const rotatedHeight =
      Math.abs(img.width * Math.sin(angleRad)) + Math.abs(img.height * Math.cos(angleRad))

    // Adjust canvas dimensions to fit rotated image
    canvas.width = rotatedWidth
    canvas.height = rotatedHeight
    ctx.filter = imageAdjustmentParams
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  } else {
    ctx.filter = imageAdjustmentParams
    ctx.drawImage(img, 0, 0, img.width, img.height)
  }

  const updatedBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve)
  })

  return updatedBlob
}

export default applyAdjustmentParams
