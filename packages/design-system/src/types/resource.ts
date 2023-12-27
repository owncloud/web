export type Resource = {
  name: string
  extension: string
  type: string
  path: string
  thumbnail: string
  locked?: boolean
  processing?: boolean
  isFolder: boolean
  mimeType: string
  description: string
  id: string
  disabled: boolean
}
