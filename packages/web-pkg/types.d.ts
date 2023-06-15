import { Ability } from 'web-client/src/helpers/resource/types'
import { ClientService, LoadingService, PreviewService, ArchiverService } from './src/services'

export * from './src'

declare module 'vue' {
  interface ComponentCustomProperties {
    $ability: Ability
    $archiverService: ArchiverService
    $clientService: ClientService
    $loadingService: LoadingService
    $previewService: PreviewService
  }
}
