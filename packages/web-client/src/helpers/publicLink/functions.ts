export function buildWebDavPublicPath(publicLinkToken, path = '') {
  return '/' + `public-files/${publicLinkToken}/${path}`.split('/').filter(Boolean).join('/')
}
