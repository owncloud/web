import { HttpClient as _HttpClient } from '../../http'
import { client, Graph, OCS } from '@ownclouders/web-client'
import { Auth, AuthParameters } from './auth'
import axios, { AxiosInstance } from 'axios'
import { v4 as uuidV4 } from 'uuid'
import { WebDAV } from '@ownclouders/web-client/src/webdav'
import { OwnCloudSdk } from '@ownclouders/web-client/src/types'
import { Language } from 'vue3-gettext'
import { FetchEventSourceInit } from '@microsoft/fetch-event-source'
import { sse } from '@ownclouders/web-client/src/sse'
import { AuthStore, ConfigStore } from '../../composables'

interface OcClient {
  token: string
  language: string
  graph: Graph
  ocs: OCS
}

interface HttpClient {
  client: _HttpClient
  language: string
  token?: string
}

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

const createAxiosInstance = (authParams: AuthParameters, language: string): AxiosInstance => {
  const auth = new Auth(authParams)
  const axiosClient = axios.create({
    headers: auth.getHeaders()
  })
  axiosClient.interceptors.request.use((config) => {
    config.headers['X-Request-ID'] = uuidV4()
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    config.headers['Accept-Language'] = language
    return config
  })
  return axiosClient
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

  private ocUserContextClient: OcClient
  private ocPublicLinkContextClient: OcClient

  private owncloudSdkClient: OwnCloudSdk
  private webdavClient: WebDAV

  constructor(options: ClientServiceOptions) {
    this.configStore = options.configStore
    this.language = options.language
    this.authStore = options.authStore
  }

  public get httpAuthenticated(): _HttpClient {
    if (this.clientNeedsInit(this.httpAuthenticatedClient)) {
      this.httpAuthenticatedClient = this.getHttpClient(true)
    }
    return this.httpAuthenticatedClient.client
  }

  public get httpUnAuthenticated(): _HttpClient {
    if (this.clientNeedsInit(this.httpUnAuthenticatedClient, false)) {
      this.httpUnAuthenticatedClient = this.getHttpClient()
    }
    return this.httpUnAuthenticatedClient.client
  }

  public get graphAuthenticated(): Graph {
    if (this.clientNeedsInit(this.ocUserContextClient)) {
      this.ocUserContextClient = this.getOcsClient({ accessToken: this.authStore.accessToken })
    }
    return this.ocUserContextClient.graph
  }

  public get sseAuthenticated(): EventSource {
    return sse(
      this.configStore.serverUrl,
      createFetchOptions({ accessToken: this.authStore.accessToken }, this.currentLanguage)
    )
  }

  public get ocsUserContext(): OCS {
    if (this.clientNeedsInit(this.ocUserContextClient)) {
      this.ocUserContextClient = this.getOcsClient({ accessToken: this.authStore.accessToken })
    }
    return this.ocUserContextClient.ocs
  }

  public ocsPublicLinkContext(password?: string): OCS {
    if (this.clientNeedsInit(this.ocPublicLinkContextClient)) {
      this.ocPublicLinkContextClient = this.getOcsClient({
        publicLinkToken: this.authStore.accessToken,
        publicLinkPassword: password
      })
    }
    return this.ocPublicLinkContextClient.ocs
  }

  private getHttpClient(authenticated = false): HttpClient {
    return {
      ...(!!authenticated && { token: this.authStore.accessToken }),
      language: this.currentLanguage,
      client: new _HttpClient({
        baseURL: this.configStore.serverUrl,
        headers: {
          'Accept-Language': this.currentLanguage,
          ...(!!authenticated && { Authorization: 'Bearer ' + this.authStore.accessToken }),
          'X-Requested-With': 'XMLHttpRequest',
          'X-Request-ID': uuidV4()
        }
      })
    }
  }

  private getOcsClient(authParams: AuthParameters): OcClient {
    const { graph, ocs } = client(
      this.configStore.serverUrl,
      createAxiosInstance(authParams, this.currentLanguage)
    )
    return {
      token: this.authStore.accessToken,
      language: this.currentLanguage,
      graph,
      ocs
    }
  }

  private clientNeedsInit(client, hasToken = true) {
    return (
      !client ||
      (hasToken && client.token !== this.authStore.accessToken) ||
      client.language !== this.currentLanguage
    )
  }

  public get owncloudSdk(): OwnCloudSdk {
    return this.owncloudSdkClient
  }

  public set owncloudSdk(owncloudSdk: OwnCloudSdk) {
    this.owncloudSdkClient = owncloudSdk
  }

  public get webdav(): WebDAV {
    return this.webdavClient
  }

  public set webdav(webdav: WebDAV) {
    this.webdavClient = webdav
  }

  get currentLanguage(): string {
    return this.language.current
  }
}
