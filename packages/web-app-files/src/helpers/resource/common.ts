import qs from 'qs'

interface BuildQueryStringOptions {
  preview?: number
  scalingup?: number
  a?: number
  etag?: string
  dimensions?: [number, number]
}

export const buildQueryString = (options: BuildQueryStringOptions): string => {
  return qs.stringify({
    scalingup: options.scalingup || 0,
    preview: Object.hasOwnProperty.call(options, 'preview') ? options.preview : 1,
    a: Object.hasOwnProperty.call(options, 'a') ? options.a : 1,
    ...(options.etag && { c: options.etag.replaceAll('"', '') }),
    ...(options.dimensions && options.dimensions[0] && { x: options.dimensions[0] }),
    ...(options.dimensions && options.dimensions[1] && { y: options.dimensions[1] })
  })
}
