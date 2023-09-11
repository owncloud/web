export interface AncestorMetaDataValue {
  id: string
  shareTypes: number[]
  parentFolderId: string
  spaceId: string
  path?: string // TODO: remove?
  name: string
}

export type AncestorMetaData = Record<string, AncestorMetaDataValue>
