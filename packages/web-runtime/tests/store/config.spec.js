import Vue from 'vue'
import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'

import { loadTheme } from 'web-runtime/src/helpers/theme'
import Store from 'web-runtime/src/store'
import { keysDeep } from 'web-pkg/src/utils/object'
import get from 'lodash-es/get'
import difference from 'lodash-es/difference'

Vue.use(Vuex)

const store = createStore(Vuex.Store, { ...Store })

describe('config theme bootstrap', () => {
  const initialStoreTheme = { ...store.getters.configuration.theme }

  beforeEach(() => {
    store.reset()
  })

  it('should be able to loadTheme', async () => {
    const { theme, name } = await loadTheme()

    await store.dispatch('loadTheme', { theme, name })
    keysDeep(theme).forEach(k => {
      expect(get(store.getters.configuration.theme, k)).toBe(get(theme, k))
    })
  })

  it('should not overwrite keys that are not part of theme', async () => {
    const { theme, name } = await loadTheme()
    const storeThemeKeys = keysDeep(store.getters.configuration.theme)
    const loadedThemeKeys = keysDeep(theme)
    const diffThemeKeys = difference(storeThemeKeys, loadedThemeKeys)
    await store.dispatch('loadTheme', { theme, name })

    diffThemeKeys.forEach(k => {
      expect(get(store.getters.configuration.theme, k)).toBe(get(initialStoreTheme, k))
    })
  })
})
