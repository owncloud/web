import queryString from 'query-string'

interface buildQueryStringOptions {
  preview?: number
  scalingup?: number
  a?: number
  etag?: string
  dimensions?: [number, number]
}

export const buildQueryString = (options: buildQueryStringOptions): string => {
  return queryString.stringify({
    scalingup: options.scalingup || 0,
    preview: options.preview || 1,
    a: options.a || 1,
    ...(options.etag && { c: options.etag.replaceAll('"', '') }),
    ...(options.dimensions[0] && { x: options.dimensions[0] }),
    ...(options.dimensions[1] && { y: options.dimensions[1] })
  })
}
