import { rcompare } from 'semver'
import { RuntimeError } from 'web-runtime/src/container/error'

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

export class ArchiverService {
  serverUrl: string
  capability?: ArchiverCapability

  public initialize(serverUrl: string, archiverCapabilities: ArchiverCapability[] = []): void {
    this.serverUrl = serverUrl
    const archivers = archiverCapabilities
      .filter(a => a.enabled)
      .sort((a1, a2) => rcompare(a1.version, a2.version))
    this.capability = archivers.length ? archivers[0] : null
  }

  public get available(): boolean {
    return !!this.capability?.version
  }

  public get url(): string {
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
