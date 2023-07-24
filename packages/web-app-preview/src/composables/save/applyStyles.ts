import { MaybeRef, unref } from 'vue'
import { useImageStyles } from '../styles'

type ImageBlob = {
  imageBlob: MaybeRef<Blob>
  styles: MaybeRef<any>
}

const applyStyles = async ({ imageBlob, styles }: ImageBlob): Promise<Blob> => {
  const imageStyles = useImageStyles(unref(styles))
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

  ctx.filter = imageStyles

  ctx.drawImage(img, 0, 0, img.width, img.height)

  const updatedBlob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve)
  })

  console.log('apply', blob === updatedBlob)

  return updatedBlob
}

export default applyStyles
