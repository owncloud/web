import { Ability } from 'web-client/src/helpers/resource/types'
import { ArchiverService, ClientService, LoadingService, PreviewService } from './src/services'
import { ExtensionRegistry } from './src/composables/piniaStores'

export * from './src'

declare module 'vue' {
  interface ComponentCustomProperties {
    $ability: Ability
    $archiverService: ArchiverService
    $clientService: ClientService
    $loadingService: LoadingService
    $previewService: PreviewService
    $extensionRegistry: ExtensionRegistry
  }
}
