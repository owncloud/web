import { OwnCloudInstance } from 'web-app-webfinger/src/discovery/types'
import { ClientService } from 'web-pkg'
import { urlJoin } from 'web-client/src/utils'

interface OidcIssuer {
  rel: string
  href: string
}

interface OidcIssuerResponse {
  subject: string
  links: OidcIssuer[]
}

interface OwnCloudInstancesResponse {
  subject: string
  links: OwnCloudInstance[]
}

export class WebfingerDiscovery {
  private serverUrl: string
  private clientService: ClientService

  constructor(serverUrl: string, clientService: ClientService) {
    this.serverUrl = serverUrl
    this.clientService = clientService
  }

  public async discoverOwnCloudInstances(): Promise<OwnCloudInstance[]> {
    const client = this.clientService.httpAuthenticated
    const url =
      urlJoin(this.serverUrl, '.well-known', 'webfinger') + `?resource=${encodeURI(this.serverUrl)}`
    try {
      const response = await client.get(url)
      return response.data.links.filter(
        (o) => o.rel === 'http://webfinger.owncloud/rel/server-instance'
      )
    } catch (e) {
      console.error(e)
    }
  }
}
