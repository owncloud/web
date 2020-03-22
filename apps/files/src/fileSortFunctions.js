import { textUtils } from './helpers/textUtils'

function name(fileInfo1, fileInfo2) {
  if (fileInfo1.type === 'folder' && fileInfo2.type !== 'folder') {
    return -1
  }
  if (fileInfo1.type !== 'folder' && fileInfo2.type === 'folder') {
    return 1
  }
  return textUtils.naturalSortCompare(fileInfo1.name, fileInfo2.name)
}

function size(fileInfo1, fileInfo2) {
  if (fileInfo1.size === fileInfo2.size) {
    return name(fileInfo1, fileInfo2)
  }
  return fileInfo1.size - fileInfo2.size
}

function _getMomentComparator(field) {
  return function(fileInfo1, fileInfo2) {
    const isUndef1 = typeof fileInfo1[field] === 'undefined'
    const isUndef2 = typeof fileInfo2[field] === 'undefined'
    if (!isUndef1 && isUndef2) {
      return -1
    }
    if (isUndef1 && !isUndef2) {
      return -1
    }
    if ((isUndef1 && isUndef2) || fileInfo1[field].isSame(fileInfo2[field])) {
      return name(fileInfo1, fileInfo2)
    }
    return fileInfo1[field].isAfter(fileInfo2[field]) ? 1 : -1
  }
}

function _reverseComparator(func) {
  return (a, b) => -func(a, b)
}

export const fileSortFunctions = {
  name: {
    asc: name,
    desc: _reverseComparator(name)
  },
  size: {
    asc: size,
    desc: _reverseComparator(size)
  },
  mdateMoment: {
    asc: _getMomentComparator('mdateMoment'),
    desc: _reverseComparator(_getMomentComparator('mdateMoment'))
  },
  shareTimeMoment: {
    asc: _getMomentComparator('shareTimeMoment'),
    desc: _reverseComparator(_getMomentComparator('shareTimeMoment'))
  },
  deleteTimestampMoment: {
    asc: _getMomentComparator('deleteTimestampMoment'),
    desc: _reverseComparator(_getMomentComparator('deleteTimestampMoment'))
  }
}
