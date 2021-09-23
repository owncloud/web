import { archiverService, clientService } from '../../services'
import { AxiosResponse } from 'axios'
import { major } from 'semver'

interface TriggerDownloadAsArchiveOptions {
  folderPath: string
  fileNames?: string[]
  token: string // TODO: solve download from a) public link b) public link with password
}

export const triggerDownloadAsArchive = async (
  options: TriggerDownloadAsArchiveOptions
): Promise<AxiosResponse> => {
  if (!isDownloadAsArchiveAvailable()) {
    return
  }
  const majorVersion = major(archiverService.capability.version)
  switch (majorVersion) {
    case 2: {
      const queryParams = [
        'dir=' + options.folderPath,
        ...(options.fileNames || []).map(f => 'file=' + f)
      ]
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
