import type { Resource, SpaceResource } from '@ownclouders/web-client'

export enum ResolveStrategy {
  SKIP,
  REPLACE,
  KEEP_BOTH,
  MERGE
}
export interface ResolveConflict {
  strategy: ResolveStrategy
  doForAllConflicts: boolean
}

export enum TransferType {
  COPY,
  MOVE
}

export type TransferData = {
  resource: Resource
  sourceSpace: SpaceResource
  targetSpace: SpaceResource
  targetFolder: Resource
  targetName: string
  overwrite: boolean
  transferType: TransferType
}
