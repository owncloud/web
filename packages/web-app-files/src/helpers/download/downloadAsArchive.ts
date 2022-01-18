import { ArchiverService, archiverService as defaultArchiverService } from '../../services'
import { ClientService, clientService as defaultClientService } from 'web-pkg/src/services'
import { major } from 'semver'
import { RuntimeError } from 'web-runtime/src/container/error'

interface TriggerDownloadAsArchiveOptions {
  fileIds: string[]
  archiverService?: ArchiverService
  clientService?: ClientService
  publicToken?: string
}

export const triggerDownloadAsArchive = async (
  options: TriggerDownloadAsArchiveOptions
): Promise<void> => {
  const archiverService = options.archiverService || defaultArchiverService
  const clientService = options.clientService || defaultClientService

  if (!isDownloadAsArchiveAvailable(archiverService)) {
    throw new RuntimeError('no archiver capability available')
  }

  if (options.fileIds.length === 0) {
    throw new RuntimeError('requested archive with empty list of resources')
  }

  const majorVersion = major(archiverService.capability.version)
  if (majorVersion !== 2) {
    return
  }

  const queryParams = [
    options.publicToken ? `public-token=${options.publicToken}` : '',
    ...options.fileIds.map((id) => `id=${id}`)
  ].filter(Boolean)
  const archiverUrl = archiverService.url + '?' + queryParams.join('&')

  window.location = options.publicToken
    ? (archiverUrl as any)
    : await clientService.owncloudSdk.signUrl(archiverUrl)
}

export const isDownloadAsArchiveAvailable = (
  service: ArchiverService = defaultArchiverService
): boolean => {
  return service.available
}
