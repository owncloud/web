// TODO: find a good location for the Resource interface. Needed in other repos as well, so it needs to be deployed to npm.
// TODO: add more fields to the resource interface. Extend into different resource types: FileResource, FolderResource, ShareResource, IncomingShareResource, OutgoingShareResource, ...
export interface Resource {
  id: number | string
  fileId?: string
  storageId?: string
  name?: string
  path: string
  webDavPath: string
  downloadURL?: string
  type?: string
}

export const extractStorageId = (id: string): string => {
  if (id?.indexOf('!')) {
    return id.split('!')[0]
  }
  return ''
}
