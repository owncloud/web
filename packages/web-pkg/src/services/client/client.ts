import { HttpClient as _HttpClient } from '../../http'
import { client, Graph, OCS } from '@ownclouders/web-client'
import { Auth, AuthParameters } from './auth'
import axios, { AxiosInstance } from 'axios'
import { v4 as uuidV4 } from 'uuid'
import { WebDAV } from '@ownclouders/web-client/src/webdav'
import { Language } from 'vue3-gettext'
import { FetchEventSourceInit } from '@microsoft/fetch-event-source'
import { sse } from '@ownclouders/web-client/src/sse'
import { AuthStore, ClientStore, ConfigStore } from '../../composables'

interface ClientContext {
  language: string
  token: string
  publicLinkToken?: string
  publicLinkPassword?: string
}

interface HttpClient extends ClientContext {
  client: _HttpClient
}

interface OcClient extends ClientContext {
  graph: Graph
  ocs: OCS
  webdav: WebDAV
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

const createAxiosInstance = (
  authParams: AuthParameters,
  language: string,
  initiatorId: string
): AxiosInstance => {
  const auth = new Auth(authParams)
  const axiosClient = axios.create({
    headers: { ...auth.getHeaders(), 'Accept-Language': language, 'Initiator-ID': initiatorId }
  })
  axiosClient.interceptors.request.use((config) => {
    config.headers['X-Request-ID'] = uuidV4()
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    return config
  })
  return axiosClient
}

export interface ClientServiceOptions {
  configStore: ConfigStore
  language: Language
  authStore: AuthStore
  clientStore: ClientStore
}

export class ClientService {
  private configStore: ConfigStore
  private language: Language
  private authStore: AuthStore
  private clientStore: ClientStore

  private httpAuthenticatedClient: HttpClient
  private httpUnAuthenticatedClient: HttpClient

  private ocUserContextClient: OcClient
  private ocPublicLinkContextClient: OcClient
  private ocWebdavContextClient: OcClient

  constructor(options: ClientServiceOptions) {
    this.configStore = options.configStore
    this.language = options.language
    this.authStore = options.authStore
    this.clientStore = options.clientStore
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
      this.ocUserContextClient = this.getOcClient({ accessToken: this.authStore.accessToken })
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
      this.ocUserContextClient = this.getOcClient({ accessToken: this.authStore.accessToken })
    }
    return this.ocUserContextClient.ocs
  }

  public ocsPublicLinkContext(password?: string): OCS {
    if (this.clientNeedsInit(this.ocPublicLinkContextClient)) {
      this.ocPublicLinkContextClient = this.getOcClient({
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
          'X-Request-ID': uuidV4(),
          'Initiator-ID': this.clientStore.clientInitiatorId
        }
      })
    }
  }

  private getOcClient(authParams: AuthParameters): OcClient {
    const { graph, ocs, webdav } = client({
      axiosClient: createAxiosInstance(
        authParams,
        this.currentLanguage,
        this.clientStore.clientInitiatorId
      ),
      baseURI: this.configStore.serverUrl
    })

    return {
      token: this.authStore.accessToken,
      language: this.currentLanguage,
      graph,
      ocs,
      webdav
    }
  }

  private clientNeedsInit(client: ClientContext, hasToken = true) {
    return (
      !client ||
      (hasToken && client.token !== this.authStore.accessToken) ||
      client.publicLinkPassword !== this.authStore.publicLinkPassword ||
      client.publicLinkToken !== this.authStore.publicLinkToken ||
      client.language !== this.currentLanguage
    )
  }

  public get webdav(): WebDAV {
    const hasToken = !!this.authStore.accessToken
    if (this.clientNeedsInit(this.ocWebdavContextClient, hasToken)) {
      this.ocWebdavContextClient = this.getOcClient({
        accessToken: this.authStore.accessToken,
        publicLinkPassword: this.authStore.publicLinkPassword,
        publicLinkToken: this.authStore.publicLinkToken
      })
    }
    return this.ocWebdavContextClient.webdav
  }

  get currentLanguage(): string {
    return this.language.current
  }
}
