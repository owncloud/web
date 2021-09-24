import { archiverService, clientService } from '../../services'
import { AxiosResponse } from 'axios'
import { major } from 'semver'
import { RuntimeError } from 'web-runtime/src/container/error'

interface TriggerDownloadAsArchiveOptions {
  fileIds: string[]
  token: string // TODO: solve download from a) public link b) public link with password
}

export const triggerDownloadAsArchive = async (
  options: TriggerDownloadAsArchiveOptions
): Promise<AxiosResponse> => {
  if (!isDownloadAsArchiveAvailable()) {
    throw new RuntimeError('no archiver capability available')
  }
  if (options.fileIds.length === 0) {
    throw new RuntimeError('requested archive with empty list of resources')
  }
  const majorVersion = major(archiverService.capability.version)
  switch (majorVersion) {
    case 2: {
      const queryParams = [...options.fileIds.map(id => `file=${id}`)]
      const url = archiverService.url + '?' + queryParams.join('&')
      return await clientService.httpAuthenticated(options.token).get(url)
    }
    default:
    // do nothing for unknown versions
  }
}

export const isDownloadAsArchiveAvailable = (): boolean => {
  return archiverService.available
}
