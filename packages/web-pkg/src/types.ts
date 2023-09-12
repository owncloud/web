export interface AncestorMetaDataValue {
  id: string
  shareTypes: number[]
  parentFolderId: string
  path: string
  name: string
  spaceId: string
}

export type AncestorMetaData = Record<string, AncestorMetaDataValue>
