import { MaybeRef } from '../../utils'

export interface FileContext {
  path: MaybeRef<string>
  routeName: MaybeRef<string>
}
