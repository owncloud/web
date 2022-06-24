export class PublicLinkManager {
  private static buildStorageKey(token: string, suffix: string): string {
    return `publicLink.${token}.${suffix}`
  }

  clear(token: string): void {
    ;['resolved', 'passwordRequired', 'password'].forEach((key) => {
      sessionStorage.removeItem(PublicLinkManager.buildStorageKey(token, key))
    })
  }

  isResolved(token: string): boolean {
    const resolved = sessionStorage.getItem(PublicLinkManager.buildStorageKey(token, 'resolved'))
    return resolved === 'true'
  }

  setResolved(token: string, resolved: boolean): void {
    sessionStorage.setItem(PublicLinkManager.buildStorageKey(token, 'resolved'), resolved + '')
  }

  isPasswordRequired(token: string): boolean {
    const passwordRequired = sessionStorage.getItem(
      PublicLinkManager.buildStorageKey(token, 'passwordRequired')
    )
    console.log('type of isPasswordRequired from session storage: ', typeof passwordRequired)
    return passwordRequired === 'true'
  }

  setPasswordRequired(token: string, required: boolean): void {
    sessionStorage.setItem(
      PublicLinkManager.buildStorageKey(token, 'passwordRequired'),
      required + ''
    )
  }

  getPassword(token: string): string {
    const password = sessionStorage.getItem(PublicLinkManager.buildStorageKey(token, 'password'))
    if (password) {
      try {
        return Buffer.from(password, 'base64').toString()
      } catch (e) {
        this.clear(token)
      }
    }
    return ''
  }

  setPassword(token: string, password: string): void {
    if (password.length) {
      const encodedPassword = Buffer.from(password).toString('base64')
      sessionStorage.setItem(PublicLinkManager.buildStorageKey(token, 'password'), encodedPassword)
    } else {
      sessionStorage.removeItem(PublicLinkManager.buildStorageKey(token, 'password'))
    }
  }
}
