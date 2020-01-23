import { textUtils } from './helpers/textUtils'

function name (fileInfo1, fileInfo2) {
  if (fileInfo1.type === 'folder' && fileInfo2.type !== 'folder') {
    return -1
  }
  if (fileInfo1.type !== 'folder' && fileInfo2.type === 'folder') {
    return 1
  }
  return textUtils.naturalSortCompare(fileInfo1.name, fileInfo2.name)
}

export const fileSortFunctions = {
  name
}
