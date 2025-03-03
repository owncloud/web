import { HttpClient } from '../../http'
import { graph, ocs, webdav } from '@ownclouders/web-client'
import { Graph } from '@ownclouders/web-client/graph'
import { OCS } from '@ownclouders/web-client/ocs'
import { AuthParameters } from './auth'
import axios, { AxiosResponse } from 'axios'
import { v4 as uuidV4 } from 'uuid'
import { WebDAV } from '@ownclouders/web-client/webdav'
import { Language } from 'vue3-gettext'
import { FetchEventSourceInit } from '@microsoft/fetch-event-source'
import { sse } from '@ownclouders/web-client/sse'
import { AuthStore, ConfigStore } from '../../composables'
import { shouldResponseTriggerMaintenance } from '@ownclouders/web-client'

const createFetchOptions = (authParams: AuthParameters, language: string): FetchEventSourceInit => {
  return {
    headers: {
      Authorization: `Bearer ${authParams.accessToken}`,
      'Accept-Language': language,
      'X-Request-ID': uuidV4(),
      'X-Requested-With': 'XMLHttpRequest'
    }
  }
}

export interface ClientServiceOptions {
  configStore: ConfigStore
  language: Language
  authStore: AuthStore
}

export class ClientService {
  private configStore: ConfigStore
  private language: Language
  private authStore: AuthStore

  private httpAuthenticatedClient: HttpClient
  private httpUnAuthenticatedClient: HttpClient

  private graphClient: Graph
  private ocsClient: OCS
  private webDavClient: WebDAV

  public initiatorId = uuidV4()

  private staticHeaders: Record<string, string> = {
    'Initiator-ID': this.initiatorId,
    'X-Requested-With': 'XMLHttpRequest'
  }

  constructor(options: ClientServiceOptions) {
    this.configStore = options.configStore
    this.language = options.language
    this.authStore = options.authStore

    this.initGraphClient()
    this.initOcsClient()
    this.initWebDavClient()

    this.httpAuthenticatedClient = new HttpClient({
      config: { baseURL: this.configStore.serverUrl, headers: this.staticHeaders },
      requestInterceptor: (config) => {
        Object.assign(config.headers, this.getDynamicHeaders())
        return config
      }
    })
    this.httpUnAuthenticatedClient = new HttpClient({
      config: { baseURL: this.configStore.serverUrl, headers: this.staticHeaders },
      requestInterceptor: (config) => {
        Object.assign(config.headers, this.getDynamicHeaders({ useAuth: false }))
        return config
      },
      responseInterceptor: [this.#handleAxiosResponse.bind(this), this.#handleAxiosError.bind(this)]
    })
  }

  public get httpAuthenticated() {
    return this.httpAuthenticatedClient
  }

  public get httpUnAuthenticated() {
    return this.httpUnAuthenticatedClient
  }

  public get graphAuthenticated() {
    return this.graphClient
  }

  public get sseAuthenticated(): EventSource {
    return sse(
      this.configStore.serverUrl,
      createFetchOptions({ accessToken: this.authStore.accessToken }, this.currentLanguage)
    )
  }

  public get ocs() {
    return this.ocsClient
  }

  /** @deprecated use `ocs()` instead */
  public get ocsUserContext() {
    return this.ocs
  }

  /** @deprecated use `ocs()` instead */
  public ocsPublicLinkContext(password?: string) {
    return this.ocs
  }

  public get webdav() {
    return this.webDavClient
  }

  get currentLanguage() {
    return this.language.current
  }

  private initGraphClient() {
    const axiosClient = axios.create({ headers: this.staticHeaders })
    axiosClient.interceptors.request.use((config) => {
      Object.assign(config.headers, this.getDynamicHeaders())
      return config
    })

    axiosClient.interceptors.response.use(
      this.#handleAxiosResponse.bind(this),
      this.#handleAxiosError.bind(this)
    )

    this.graphClient = graph(this.configStore.serverUrl, axiosClient)
  }

  private initOcsClient() {
    const axiosClient = axios.create({ headers: this.staticHeaders })
    axiosClient.interceptors.request.use((config) => {
      Object.assign(config.headers, this.getDynamicHeaders())
      return config
    })
    this.ocsClient = ocs(this.configStore.serverUrl, axiosClient)
  }

  private initWebDavClient() {
    this.webDavClient = webdav(
      this.configStore.serverUrl,
      this.configStore.setMaintenanceMode,
      () => {
        const headers = { ...this.staticHeaders, ...this.getDynamicHeaders() }

        if (this.authStore.publicLinkToken) {
          headers['public-token'] = this.authStore.publicLinkToken
        }

        if (this.authStore.publicLinkPassword) {
          headers['Authorization'] =
            'Basic ' +
            Buffer.from(['public', this.authStore.publicLinkPassword].join(':')).toString('base64')
        }

        return headers
      }
    )
  }

  /**
   * Dynamic headers that should be provided via callback or interceptor because they may
   * change during the lifetime of the application (e.g. token renewal).
   */
  private getDynamicHeaders({ useAuth = true }: { useAuth?: boolean } = {}): Record<
    string,
    string
  > {
    return {
      'Accept-Language': this.currentLanguage,
      'X-Request-ID': uuidV4(),
      ...(useAuth && { Authorization: 'Bearer ' + this.authStore.accessToken })
    }
  }

  #handleAxiosResponse(response: AxiosResponse<any, any>) {
    if (response.status !== 503) {
      this.configStore.setMaintenanceMode(false)
    }

    return response
  }

  #handleAxiosError(error: any) {
    if (shouldResponseTriggerMaintenance(error.response?.status || 500, error.config.url)) {
      this.configStore.setMaintenanceMode(true)
    }

    return Promise.reject(error)
  }
}
