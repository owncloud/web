/**
 * URI-Encodes a file path but keep the path slashes.
 *
 * @param path path
 * @return encoded path
 */
export default function(path) {
  if (!path) {
    return path
  }

  const parts = path.split('/').map(part => encodeURIComponent(part))

  return parts.join('/')
}
