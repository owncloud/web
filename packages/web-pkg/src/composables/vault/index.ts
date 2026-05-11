/**
 * This composable is used for various vault-related functionality.
 */
interface VaultComposable {
  /**
   * Checks whether the user is currently in the vault.
   * This is not reactive value because a full page reload is required to switch between regular and vault mode.
   */
  isInVault: boolean
}

export function useVault(): VaultComposable {
  const isInVault = (() => {
    const { pathname, hash } = window.location

    if (pathname.startsWith('/vault')) {
      return true
    }

    if (hash) {
      const vaultHashPattern = /^#\/vault(?:\/|$)/
      return vaultHashPattern.test(hash)
    }

    return false
  })()

  return {
    isInVault
  }
}
