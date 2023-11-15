export function buildWebDavPublicPath(publicLinkToken, path = '') {
  return `/public-files/${publicLinkToken}/${path}`.split('/').filter(Boolean).join('/')
}

export function buildWebDavOcmPath(publicLinkToken, path = '') {
  return `/ocm/${publicLinkToken}/${path}`.split('/').filter(Boolean).join('/')
}
