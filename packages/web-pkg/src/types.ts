export interface AncestorMetaDataValue {
  id: string
  shareTypes: number[]
  parentFolderId: string
  spaceId: string
  path: string
}

export type AncestorMetaData = Record<string, AncestorMetaDataValue>
