/**
 * Removes the path of the resource and returns only its name
 * @param {String} path Full path of the resource containing the resource name
 * @return {String} Resource name
 */
export function getResourceName(path) {
  return path.substring(path.lastIndexOf('/'))
}
