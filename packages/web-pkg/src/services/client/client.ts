import { HttpClient as _HttpClient } from '../../http'
import { client, Graph, OCS } from '@ownclouders/web-client'
import { Auth, AuthParameters } from './auth'
import axios, { AxiosInstance } from 'axios'
import { v4 as uuidV4 } from 'uuid'
import { WebDAV } from '@ownclouders/web-client/src/webdav'
import { OwnCloudSdk } from '@ownclouders/web-client/src/types'
import { ConfigurationManager } from '../../configuration'
import { Store } from 'vuex'
import { Language } from 'vue3-gettext'

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
  configurationManager: ConfigurationManager
  language: Language
  store: Store<any>
}

export class ClientService {
  private configurationManager: ConfigurationManager
  private language: Language
  private store: Store<any>

  private httpAuthenticatedClient: HttpClient
  private httpUnAuthenticatedClient: HttpClient

  private ocUserContextClient: OcClient
  private ocPublicLinkContextClient: OcClient

  private owncloudSdkClient: OwnCloudSdk
  private webdavClient: WebDAV

  constructor(options: ClientServiceOptions) {
    this.configurationManager = options.configurationManager
    this.language = options.language
    this.store = options.store
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
      this.ocUserContextClient = this.getOcsClient({ accessToken: this.token })
    }
    return this.ocUserContextClient.graph
  }

  public get ocsUserContext(): OCS {
    if (this.clientNeedsInit(this.ocUserContextClient)) {
      this.ocUserContextClient = this.getOcsClient({ accessToken: this.token })
    }
    return this.ocUserContextClient.ocs
  }

  public ocsPublicLinkContext(password?: string): OCS {
    if (this.clientNeedsInit(this.ocPublicLinkContextClient)) {
      this.ocPublicLinkContextClient = this.getOcsClient({
        publicLinkToken: this.token,
        publicLinkPassword: password
      })
    }
    return this.ocPublicLinkContextClient.ocs
  }

  private getHttpClient(authenticated = false): HttpClient {
    return {
      ...(!!authenticated && { token: this.token }),
      language: this.currentLanguage,
      client: new _HttpClient({
        baseURL: this.configurationManager.serverUrl,
        headers: {
          'Accept-Language': this.currentLanguage,
          ...(!!authenticated && { Authorization: 'Bearer ' + this.token }),
          'X-Requested-With': 'XMLHttpRequest',
          'X-Request-ID': uuidV4()
        }
      })
    }
  }

  private getOcsClient(authParams: AuthParameters): OcClient {
    const { graph, ocs } = client(
      this.configurationManager.serverUrl,
      createAxiosInstance(authParams, this.currentLanguage)
    )
    return {
      token: this.token,
      language: this.currentLanguage,
      graph,
      ocs
    }
  }

  private clientNeedsInit(client, hasToken = true) {
    return (
      !client ||
      (hasToken && client.token !== this.token) ||
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

  get token(): string {
    return this.store.getters['runtime/auth/accessToken']
  }

  get currentLanguage(): string {
    return this.language.current
  }
}
