import { Store } from 'vuex'

export const getWebVersion = (): string => {
  const version = process.env.PACKAGE_VERSION
  return `ownCloud Web UI ${version}`
}

export const getBackendVersion = ({ store }: { store: Store<unknown> }): string => {
  const backendVersion = store.getters.user.version
  if (!backendVersion || !backendVersion.string) {
    return undefined
  }
  const product = backendVersion.product || 'ownCloud'
  const version = backendVersion.string
  const edition = backendVersion.edition
  return `${product} ${version} ${edition}`
}
