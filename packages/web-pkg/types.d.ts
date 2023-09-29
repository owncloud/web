import { Ability } from '@ownclouders/web-client/src/helpers/resource/types'
import {
  ArchiverService,
  ClientService,
  LoadingService,
  PreviewService,
  PasswordPolicyService
} from './src/services'

export * from './src'

declare module 'vue' {
  interface ComponentCustomProperties {
    $ability: Ability
    $archiverService: ArchiverService
    $clientService: ClientService
    $loadingService: LoadingService
    $previewService: PreviewService
    $passwordPolicyService: PasswordPolicyService
  }
}
