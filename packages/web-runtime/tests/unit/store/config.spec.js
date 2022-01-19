import Vue from 'vue'
import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'

import { loadTheme } from 'web-runtime/src/helpers/theme'
import Store from 'web-runtime/src/store'
import { objectKeys } from 'web-pkg/src/utils'
import get from 'lodash-es/get'
import difference from 'lodash-es/difference'

describe('config theme bootstrap', () => {
  Vue.use(Vuex)

  const store = createStore(Vuex.Store, { ...Store })
  const initialStoreTheme = { ...store.getters.configuration.theme }

  beforeEach(() => {
    store.reset()
  })

  it('should be able to loadTheme', async () => {
    const { theme } = await loadTheme()
    const defaultTheme = theme.default

    await store.dispatch('loadTheme', { defaultTheme })
    objectKeys(defaultTheme).forEach((k) => {
      expect(get(store.getters.configuration.theme, k)).toBe(get(theme, k))
    })
  })

  it('should not overwrite keys that are not part of theme', async () => {
    const { theme } = await loadTheme()
    const defaultTheme = theme.default

    const storeThemeKeys = objectKeys(store.getters.configuration.currentTheme)
    const loadedThemeKeys = objectKeys(defaultTheme)
    const diffThemeKeys = difference(storeThemeKeys, loadedThemeKeys)
    await store.dispatch('loadTheme', { defaultTheme })

    diffThemeKeys.forEach((k) => {
      expect(get(store.getters.configuration.theme, k)).toBe(get(initialStoreTheme, k))
    })
  })
})
