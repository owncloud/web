import { HttpClient } from 'web-pkg/src/http'

export class ClientService {
  private httpAuthenticatedClient: {
    token: string
    instance: HttpClient
  }

  private httpUnAuthenticatedClient: HttpClient

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

  public get owncloudSdk(): any {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return window.Vue.prototype.$client
  }
}

export const clientService = new ClientService()
