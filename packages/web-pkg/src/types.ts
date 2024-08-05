export interface AncestorMetaDataValue {
  id: string
  shareTypes: number[]
  parentFolderId: string
  spaceId: string
  path: string
}

export type AncestorMetaData = Record<string, AncestorMetaDataValue>

export type FederatedUser = {
  display_name: string
  idp: string
  mail: string
  user_id: string
}

export type FederatedConnection = FederatedUser & {
  id: string
}

export enum MouseEventButton {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2
}
