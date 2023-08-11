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
  const rotate = unref(activeRotation)
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
  ctx.translate(img.width / 2, img.height / 2)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.translate(-(img.width / 2), -(img.height / 2))

  ctx.drawImage(img, 0, 0, img.width, img.height)

  const updatedBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve)
  })

  return updatedBlob
}

export default applyAdjustmentParams
