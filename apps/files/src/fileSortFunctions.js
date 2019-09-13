/**
 * Compare two strings to provide a natural sort
 * @param a first string to compare
 * @param b second string to compare
 * @return -1 if b comes before a, 1 if a comes before b
 * or 0 if the strings are identical
 */
function _chunkify (t) {
  // Adapted from http://my.opera.com/GreyWyvern/blog/show.dml/1671288
  const tz = []; let x = 0; let y = -1; let n = 0; let c

  while (x < t.length) {
    c = t.charAt(x)
    // only include the dot in strings
    const m = ((!n && c === '.') || (c >= '0' && c <= '9'))
    if (m !== n) {
      // next chunk
      y++
      tz[y] = ''
      n = m
    }
    tz[y] += c
    x++
  }
  return tz
}

function _naturalSortCompare (a, b) {
  const aa = _chunkify(a)
  const bb = _chunkify(b)
  let x, aNum, bNum

  for (x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      aNum = Number(aa[x])
      bNum = Number(bb[x])
      // note: == is correct here
      // eslint-disable-next-line eqeqeq
      if (aNum == aa[x] && bNum == bb[x]) {
        return aNum - bNum
      } else {
        // Forcing 'en' locale to match the server-side locale which is
        // always 'en'.
        //
        // Note: This setting isn't supported by all browsers but for the ones
        // that do there will be more consistency between client-server sorting
        return aa[x].localeCompare(bb[x], 'en')
      }
    }
  }
  return aa.length - bb.length
}

function name (fileInfo1, fileInfo2) {
  if (fileInfo1.type === 'folder' && fileInfo2.type !== 'folder') {
    return -1
  }
  if (fileInfo1.type !== 'folder' && fileInfo2.type === 'folder') {
    return 1
  }
  return _naturalSortCompare(fileInfo1.name, fileInfo2.name)
}

export const fileSortFunctions = {
  name
}
