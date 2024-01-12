const state = {
  // static nav items are set during extension loading and will not be modified later on
  staticNavItems: {}
}

const mutations = {
  /**
   * Sets the nav items that are statically provided through extension configuration,
   * i.e. the appInfo json.
   *
   * @param state
   * @param extension
   * @param navItems
   * @constructor
   */
  SET_NAV_ITEMS_FROM_CONFIG(state, { extension, navItems }) {
    const staticNavItems = state.staticNavItems
    staticNavItems[extension] = navItems
    state.staticNavItems = staticNavItems
  }
}

const getters = {
  /**
   * Get all nav items that are associated with the given extension id.
   *
   * @param state
   * @param getters
   * @returns {function(*): *[]}
   */
  getNavItemsByExtension: (state, getters) => (extension) => {
    const staticNavItems = state.staticNavItems[extension] || []
    return staticNavItems.filter((navItem) => {
      if (!navItem.enabled) {
        // when `enabled` callback not provided: count as enabled.
        return true
      }
      try {
        return navItem.enabled(getters.capabilities || {})
      } catch (e) {
        console.error('`enabled` callback on navItem ' + navItem.name + ' threw an error', e)
        return false
      }
    })
  }
}

const actions = {}
export default {
  state,
  mutations,
  getters,
  actions
}
