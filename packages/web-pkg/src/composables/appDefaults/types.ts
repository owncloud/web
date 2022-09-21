import { MaybeRef } from '../../utils'
import { LocationParams, LocationQuery } from '../router'
import { Resource } from 'web-client'
export interface FileContext {
  path: MaybeRef<string>
  driveAliasAndItem: MaybeRef<string>
  space: MaybeRef<Resource>
  fileName: MaybeRef<string>
  routeName: MaybeRef<string>
  routeParams: MaybeRef<LocationParams>
  routeQuery: MaybeRef<LocationQuery>
}

export type AppConfigObject = Record<string, any>
