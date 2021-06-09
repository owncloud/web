const urlCache = new Map()
const ttl = 60 * 1000
const addUrl = (userId, url) => {
  urlCache.set(userId, {
    ts: Date.now() + ttl,
    url
  })

  return url
}
const getUrl = userId => {
  if (urlCache.has(userId)) {
    const { ts, url } = urlCache.get(userId)
    if (Date.now() <= ts) {
      return url
    }
  }
}

export async function getAvatarSrc(userId, server, token, client) {
  const cachedUrl = getUrl(userId)

  if (cachedUrl) {
    return cachedUrl
  }

  const url = server + 'remote.php/dav/avatars/' + userId + '/128.png'
  const headers = new Headers()
  headers.append('Authorization', 'Bearer ' + token)

  const response = await fetch(url, {
    method: 'HEAD',
    headers
  })

  if (response.status !== 200) {
    throw new Error(response.statusText)
  }

  if (!client || typeof client.signUrl !== 'function') {
    return addUrl(userId, url)
  }

  const signedUrl = await client.signUrl(url)
  return addUrl(userId, signedUrl)
}
