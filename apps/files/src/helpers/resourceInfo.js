/**
 * Removes the path of the resource and returns only its name
 * @param {String} path Full path of the resource containing the resource name
 * @return {String} Resource name
 */
export function getResourceName(path) {
  if (path.lastIndexOf('/') > -1) {
    return path.substring(path.lastIndexOf('/'))
  }

  return path
}
