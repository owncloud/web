import { MimeType, MimeTypesToAppsSchema } from './schemas'
import { ref, unref } from 'vue'
import { CapabilityStore } from '../../composables'
import { ClientService } from '../client'

export class AppProviderService {
  private _mimeTypes = ref<MimeType[]>([])
  private capabilityStore: CapabilityStore
  private clientService: ClientService

  constructor(capabilityStore: CapabilityStore, clientService: ClientService) {
    this.capabilityStore = capabilityStore
    this.clientService = clientService
  }

  public async loadData(): Promise<void> {
    const appProviderCapability = this.capabilityStore.filesAppProviders.find(
      (appProvider) => appProvider.enabled
    )
    if (!appProviderCapability) {
      return
    }

    const {
      data: { 'mime-types': mimeTypes }
    } = await this.clientService.httpUnAuthenticated.get(appProviderCapability.apps_url, {
      schema: MimeTypesToAppsSchema
    })
    this._mimeTypes.value = mimeTypes
  }

  set mimeTypes(value: MimeType[]) {
    this._mimeTypes.value = value
  }

  get mimeTypes() {
    return unref(this._mimeTypes)
  }

  get appNames(): string[] {
    return [
      ...new Set(
        unref(this._mimeTypes).flatMap((mimeType) =>
          mimeType.app_providers.map((appProvider) => appProvider.name)
        )
      )
    ]
  }

  public getMimeTypesByAppName(appName: string): MimeType[] {
    return unref(this._mimeTypes).filter((mimeType) =>
      mimeType.app_providers.some((appProvider) => appProvider.name === appName)
    )
  }
}
