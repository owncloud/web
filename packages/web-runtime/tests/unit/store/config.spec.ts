import { loadTheme } from 'web-runtime/src/helpers/theme'
import Store from 'web-runtime/src/store'
import { objectKeys } from '@ownclouders/web-pkg'
import get from 'lodash-es/get'
import difference from 'lodash-es/difference'
import { getStoreInstance } from 'web-test-helpers'
import { cloneDeep } from 'lodash-es'

describe('config theme bootstrap', () => {
  it('should be able to loadTheme', async () => {
    const store = getStoreInstance(cloneDeep(Store))
    const { web } = await loadTheme()
    const defaultTheme = web.default

    await store.dispatch('loadTheme', { defaultTheme })
    objectKeys(defaultTheme).forEach((k) => {
      expect(get(store.getters.configuration.theme, k)).toBe(get(web, k))
    })
  })

  it('should not overwrite keys that are not part of theme', async () => {
    const store = getStoreInstance(cloneDeep(Store))
    const initialStoreTheme = { ...store.getters.configuration.theme }
    const { web } = await loadTheme()
    const defaultTheme = web.default

    const storeThemeKeys = objectKeys(store.getters.configuration.currentTheme)
    const loadedThemeKeys = objectKeys(defaultTheme)
    const diffThemeKeys = difference(storeThemeKeys, loadedThemeKeys)
    await store.dispatch('loadTheme', { defaultTheme })

    diffThemeKeys.forEach((k) => {
      expect(get(store.getters.configuration.theme, k)).toBe(get(initialStoreTheme, k))
    })
  })
})
