import { major, rcompare } from 'semver'
import { RuntimeError } from 'web-runtime/src/container/error'
import { clientService as defaultClientService, ClientService } from 'web-pkg/src/services'

/**
 * Archiver struct within the capabilities as defined in reva
 * @see https://github.com/cs3org/reva/blob/41d5a6858c2200a61736d2c165e551b9785000d1/internal/http/services/owncloud/ocs/data/capabilities.go#L105
 */
interface ArchiverCapability {
  enabled: boolean
  version: string // version is just a major version, e.g. `v2`
  formats: string[]
  // eslint-disable-next-line camelcase
  archiver_url: string
}

interface TriggerDownloadOptions {
  dir?: string
  files?: string[]
  fileIds?: string[]
  downloadSecret?: string
  publicToken?: string
  clientService?: ClientService
}

export class ArchiverService {
  serverUrl: string
  urlSigningEnabled: boolean
  capability?: ArchiverCapability

  public initialize(
    serverUrl: string,
    archiverCapabilities: ArchiverCapability[] = [],
    urlSigningEnabled = true
  ): void {
    this.serverUrl = serverUrl
    this.urlSigningEnabled = urlSigningEnabled
    const archivers = archiverCapabilities
      .filter((a) => a.enabled)
      .sort((a1, a2) => rcompare(a1.version, a2.version))
    this.capability = archivers.length ? archivers[0] : null
  }

  public get available(): boolean {
    return !!this.capability?.version
  }

  public get fileIdsSupported(): boolean {
    return major(this.capability?.version) >= 2
  }

  public async triggerDownload(options: TriggerDownloadOptions): Promise<string> {
    const clientService = options.clientService || defaultClientService

    if (!this.available) {
      throw new RuntimeError('no archiver available')
    }

    if ((options.fileIds?.length || 0) + (options.files?.length || 0) === 0) {
      throw new RuntimeError('requested archive with empty list of resources')
    }

    const downloadUrl = this.buildDownloadUrl({
      ...options,
      clientService
    })
    if (!downloadUrl) {
      throw new RuntimeError('download url could not be built')
    }

    let url
    if (options.publicToken) {
      url = downloadUrl
    } else if (this.urlSigningEnabled) {
      url = await clientService.owncloudSdk.signUrl(downloadUrl)
    } else {
      url = downloadUrl + '&access_token=' + (window.Vue as any).$store.state.user.token
    }
    window.location = url
    return url
  }

  private buildDownloadUrl(options: TriggerDownloadOptions): string {
    const queryParams = []
    if (options.publicToken) {
      queryParams.push(`public-token=${options.publicToken}`)
    }

    const majorVersion = major(this.capability.version)
    switch (majorVersion) {
      case 2: {
        queryParams.push(...options.fileIds.map((id) => `id=${id}`))
        return this.url + '?' + queryParams.join('&')
      }
      case 1: {
        // see https://github.com/owncloud/core/blob/e285879a8a79e692497937ebf340bc6b9c925b4f/apps/files/js/files.js#L315 for reference
        // classic ui does a check whether the download started. not implemented here (yet?).
        const downloadStartSecret = Math.random().toString(36).substring(2)
        queryParams.push(
          `dir=${encodeURIComponent(options.dir)}`,
          ...options.files.map((name) => `files[]=${encodeURIComponent(name)}`),
          `downloadStartSecret=${downloadStartSecret}`
        )
        return this.url + '?' + queryParams.join('&')
      }
      default: {
        return undefined
      }
    }
  }

  private get url(): string {
    if (!this.available) {
      throw new RuntimeError('no archiver available')
    }
    if (/^https?:\/\//i.test(this.capability.archiver_url)) {
      return this.capability.archiver_url
    }
    return [
      this.serverUrl.replace(/\/+$/, ''),
      this.capability.archiver_url.replace(/^\/+/, '')
    ].join('/')
  }
}

export const archiverService = new ArchiverService()
