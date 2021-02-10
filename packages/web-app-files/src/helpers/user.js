export async function getAvatarSrc(userId, server, token) {
  const headers = new Headers()
  const url = server + 'remote.php/dav/avatars/' + userId + '/128.png'

  headers.append('Authorization', 'Bearer ' + token)

  const response = await fetch(url, {
    method: 'HEAD',
    headers
  })

  if (response.status === 200) {
    const signedUrl = await this.$client.signUrl(url)

    return signedUrl
  }

  return ''
}
