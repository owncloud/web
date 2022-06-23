export class PublicLinkManager {
  private static buildStorageKey(token: string, suffix: string): string {
    return `publicLink.${token}.${suffix}`
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
    return sessionStorage.getItem(PublicLinkManager.buildStorageKey(token, 'password')) || ''
  }

  setPassword(token: string, password: string): void {
    if (password.length) {
      sessionStorage.setItem(PublicLinkManager.buildStorageKey(token, 'password'), password)
    } else {
      sessionStorage.removeItem(PublicLinkManager.buildStorageKey(token, 'password'))
    }
  }
}
