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
