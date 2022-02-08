import { MaybeRef } from '../../utils'
import { LocationParams } from '../router'
export interface FileContext {
  path: MaybeRef<string>
  routeName: MaybeRef<string>
  routeParams: MaybeRef<LocationParams>
}
