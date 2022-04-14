import { MaybeRef } from '../../utils'
import { LocationParams, LocationQuery } from '../router'
export interface FileContext {
  path: MaybeRef<string>
  fileName: MaybeRef<string>
  routeName: MaybeRef<string>
  routeParams: MaybeRef<LocationParams>
  routeQuery: MaybeRef<LocationQuery>
}
