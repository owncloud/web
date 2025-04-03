import { RuntimeError } from '../errors'
import { HttpError } from '@ownclouders/web-client'
import { ClientService } from '../services'
import { urlJoin } from '@ownclouders/web-client'
import { triggerDownloadWithFilename } from '../helpers/download'

import { Ref, ref, computed, unref } from 'vue'
import { ArchiverCapability } from '@ownclouders/web-client/ocs'
import { UserStore } from '../composables'
import { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios'

interface TriggerDownloadOptions {
  dir?: string
  files?: string[]
  fileIds?: string[]
  downloadSecret?: string
  publicToken?: string
  publicLinkPassword?: string
}

function sortArchivers(a: ArchiverCapability, b: ArchiverCapability): number {
  const va = a.version.startsWith('v') ? a.version.slice(1) : a.version
  const vb = b.version.startsWith('v') ? b.version.slice(1) : b.version

  const [releaseA, preReleaseA] = va.split('-') || []
  const [releaseB, preReleaseB] = vb.split('-') || []

  const releaseCompare = releaseB.localeCompare(releaseA)

  if (releaseCompare !== 0) {
    return releaseCompare
  }

  if (preReleaseA && !preReleaseB) {
    return 1
  }

  if (!preReleaseA && preReleaseB) {
    return -1
  }

  return preReleaseB.localeCompare(preReleaseA)
}

export class ArchiverService {
  clientService: ClientService
  userStore: UserStore
  serverUrl: string
  capability: Ref<ArchiverCapability>
  available: Ref<boolean>
  fileIdsSupported = true

  constructor(
    clientService: ClientService,
    userStore: UserStore,
    serverUrl: string,
    archiverCapabilities: Ref<ArchiverCapability[]> = ref([])
  ) {
    this.clientService = clientService
    this.userStore = userStore
    this.serverUrl = serverUrl
    this.capability = computed(() => {
      const archivers = unref(archiverCapabilities)
        .filter((a) => a.enabled)
        .sort(sortArchivers)
      return archivers.length ? archivers[0] : null
    })

    this.available = computed(() => {
      return !!unref(this.capability)?.version
    })
  }

  public async triggerDownload(options: TriggerDownloadOptions): Promise<string> {
    if (!unref(this.available)) {
      throw new RuntimeError('no archiver available')
    }

    if ((options.fileIds?.length || 0) + (options.files?.length || 0) === 0) {
      throw new RuntimeError('requested archive with empty list of resources')
    }

    const downloadUrl = this.buildDownloadUrl({ ...options })
    if (!downloadUrl) {
      throw new RuntimeError('download url could not be built')
    }

    if (options.publicToken && options.publicLinkPassword) {
      try {
        const response = await this.clientService.httpUnAuthenticated.get<Blob>(downloadUrl, {
          headers: {
            ...(!!options.publicLinkPassword && {
              Authorization:
                'Basic ' +
                Buffer.from(['public', options.publicLinkPassword].join(':')).toString('base64')
            })
          },
          responseType: 'blob'
        })

        const objectUrl = URL.createObjectURL(response.data)
        const fileName = this.getFileNameFromResponseHeaders(response.headers)
        triggerDownloadWithFilename(objectUrl, fileName)
        return downloadUrl
      } catch (e) {
        throw new HttpError('archive could not be fetched', e.response)
      }
    }

    const url = options.publicToken
      ? downloadUrl
      : await this.clientService.ocs.signUrl(
          downloadUrl,
          this.userStore.user?.onPremisesSamAccountName
        )

    window.open(url, '_blank')
    return downloadUrl
  }

  private buildDownloadUrl(options: TriggerDownloadOptions): string {
    const queryParams = []
    if (options.publicToken) {
      queryParams.push(`public-token=${options.publicToken}`)
    }

    queryParams.push(...options.fileIds.map((id) => `id=${id}`))
    return this.url + '?' + queryParams.join('&')
  }

  private get url(): string {
    if (!this.available) {
      throw new RuntimeError('no archiver available')
    }
    const capability = unref(this.capability)
    if (/^https?:\/\//i.test(capability.archiver_url)) {
      return capability.archiver_url
    }
    return urlJoin(this.serverUrl, capability.archiver_url)
  }

  private getFileNameFromResponseHeaders(headers: RawAxiosResponseHeaders | AxiosResponseHeaders) {
    const fileName = headers['content-disposition']?.split('"')[1]
    return decodeURI(fileName)
  }
}
