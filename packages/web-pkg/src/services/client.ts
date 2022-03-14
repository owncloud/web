import { HttpClient } from '../http'
import { client, Graph } from 'web-client'

export type OwnCloudSdk = any

export class ClientService {
  private httpAuthenticatedClient: {
    token: string
    instance: HttpClient
  }

  private httpUnAuthenticatedClient: HttpClient

  private graphAuthenticatedClient: {
    token: string
    instance: Graph
  }

  private owncloudSdkClient: OwnCloudSdk

  public httpAuthenticated(token: string): HttpClient {
    if (!this.httpAuthenticatedClient || this.httpAuthenticatedClient.token !== token) {
      this.httpAuthenticatedClient = {
        token,
        instance: new HttpClient({
          headers: {
            Authorization: 'Bearer ' + token,
            'X-Requested-With': 'XMLHttpRequest'
          }
        })
      }
    }

    return this.httpAuthenticatedClient.instance
  }

  public graphAuthenticated(serverUrl: string, token: string): Graph {
    if (!this.graphAuthenticatedClient || this.graphAuthenticatedClient.token !== token) {
      const { graph } = client(serverUrl, token)
      this.graphAuthenticatedClient = {
        token,
        instance: graph
      }
    }

    return this.graphAuthenticatedClient.instance
  }

  public get httpUnAuthenticated(): HttpClient {
    if (!this.httpUnAuthenticatedClient) {
      this.httpUnAuthenticatedClient = new HttpClient({
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
    }

    return this.httpUnAuthenticatedClient
  }

  public get owncloudSdk(): OwnCloudSdk {
    return this.owncloudSdkClient
  }

  public set owncloudSdk(owncloudSdk: OwnCloudSdk) {
    this.owncloudSdkClient = owncloudSdk
  }
}

export const clientService = new ClientService()
