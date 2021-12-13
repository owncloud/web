import { MaybeRef } from 'web-pkg/src/utils'

export interface FileContext {
    path: MaybeRef<string>
    routeName: MaybeRef<string>
}
