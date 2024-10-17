import { MimeType, MimeTypesToAppsSchema } from './schemas'
import { ref, unref } from 'vue'
import { ClientService } from '../client'
import { urlJoin } from '@ownclouders/web-client'

export class AppProviderService {
  private _mimeTypes = ref<MimeType[]>([])
  private readonly serverUrl: string
  private readonly clientService: ClientService

  constructor(serverUrl: string, clientService: ClientService) {
    this.serverUrl = serverUrl
    this.clientService = clientService
  }

  public async loadData(): Promise<void> {
    const appListUrl = urlJoin(this.serverUrl, 'app', 'list')
    const {
      data: { 'mime-types': mimeTypes }
    } = await this.clientService.httpUnAuthenticated.get(appListUrl, {
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

  get templateMimeTypes() {
    return unref(this._mimeTypes).filter(
      (mimeType) => !!mimeType.app_providers.some((appProvider) => !!appProvider.target_ext)
    )
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
