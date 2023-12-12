export interface UppyResource {
  id?: string
  source: string
  name: string
  isFolder: boolean
  type: string
  size: number
  data: Blob
  isRemote: boolean
  meta: {
    // IMPORTANT: must only contain primitive types, complex types won't be serialized properly!
    name?: string
    mtime?: number
    // current space & folder
    spaceId: string
    spaceName: string
    driveAlias: string
    driveType: string
    currentFolder: string // current folder path during upload initiation
    currentFolderId?: string
    fileId?: string
    // upload data
    uppyId?: string
    relativeFolder: string
    relativePath: string
    tusEndpoint: string
    uploadId: string
    topLevelFolderId?: string
    // route data
    routeName?: string
    routeDriveAliasAndItem?: string
    routeShareId?: string
  }
  tus?: {
    endpoint: string
  }
  xhrUpload?: {
    endpoint: string
  }
}
