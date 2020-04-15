/**
 * Return all absolute parent paths.
 *
 * For example if passing in "a/b/c" it will return
 * ["a/b", "a", ""]

 * If an empty string or "/" is passed in, an empty array is returned.
 *
 * @param {String} path path to process
 * @param {Boolean} includeCurrent whether to include the current path (with leading slash)
 * @return {Array.<String>} parent paths
 */
export function getParentPaths(path, includeCurrent = false) {
  if (path === '' || path === '/') {
    return []
  }

  if (path.charAt(0) !== '/') {
    path = '/' + path
  }

  const paths = []
  const sections = path.split('/')

  if (includeCurrent) {
    paths.push(path)
  }

  sections.pop()
  while (sections.length > 0) {
    paths.push(sections.join('/'))
    sections.pop()
  }

  return paths
}
