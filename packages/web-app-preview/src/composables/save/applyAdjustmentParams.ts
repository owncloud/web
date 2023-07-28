import { MaybeRef, unref } from 'vue'
import { useImageAdjustmentParameters } from '../adjustment-params'

type AdjustmentParamsProps = {
  imageBlob: MaybeRef<Blob>
  adjustmentParams: MaybeRef<any>
}

const applyAdjustmentParams = async ({
  imageBlob,
  adjustmentParams
}: AdjustmentParamsProps): Promise<Blob> => {
  const imageAdjustmentParams = useImageAdjustmentParameters(unref(adjustmentParams))
  const blob = unref(imageBlob)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const img = document.createElement('img')
  img.src = URL.createObjectURL(blob)

  await new Promise<void>((resolve) => {
    img.onload = () => resolve()
  })

  canvas.width = img.width
  canvas.height = img.height

  ctx.filter = imageAdjustmentParams

  ctx.drawImage(img, 0, 0, img.width, img.height)

  const updatedBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve)
  })

  return updatedBlob
}

export default applyAdjustmentParams
