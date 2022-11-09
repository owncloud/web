class WebDavHelper {
  webDavPath: string

  constructor() {
    this.webDavPath = 'https://host.docker.internal:9200/remote.php/dav'
  }

  async propfind(path: string, spaceId: string, token: string) {
    return fetch(`${this.webDavPath}/spaces/${spaceId}/${path}`, {
      method: 'PROPFIND',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        authorization: `Bearer ${token}`,
        'OCS-APIREQUEST': 'true'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    })
  }
  async moveFile(
    sourceSpaceId: string,
    sourcePath: string,
    targetSpaceId: string,
    targetPath: string,
    token: string
  ) {
    return fetch(`${this.webDavPath}/spaces/${sourceSpaceId}/${sourcePath}`, {
      method: 'COPY',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        authorization: `Bearer ${token}`,
        overwrite: 'F',
        destination: `${this.webDavPath}/spaces/${targetSpaceId}/${targetPath}`,
        'OCS-APIREQUEST': 'true'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    })
  }
}

export const WebDavClient = new WebDavHelper()
