export async function getAvatarSrc(userId, server, token, client) {
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
    return url
  }

  return client.signUrl(url)
}
