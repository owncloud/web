const state = {
  // static nav items are set during extension loading and will not be modified later on
  staticNavItems: {},
  // dynamic nav items are initially empty and can be created e.g. from loaded data
  dynamicNavItems: {},
  closed: false
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
  },
  /**
   * Use this mutation to dynamically add nav items after initialization phase, e.g. from loaded
   * data. If there already is a nav item with the same name, that one will be replaced.
   *
   * @param state
   * @param extension
   * @param navItem
   * @constructor
   */
  ADD_NAV_ITEM(state, { extension, navItem }) {
    const dynamicNavItems = { ...state.dynamicNavItems }
    dynamicNavItems[extension] = dynamicNavItems[extension] || []
    const index = dynamicNavItems[extension].findIndex(
      (item) => item.route.path === navItem.route.path
    )
    if (index >= 0) {
      dynamicNavItems[extension][index] = navItem
    } else {
      dynamicNavItems[extension].push(navItem)
    }
    state.dynamicNavItems = dynamicNavItems
  },
  SET_CLOSED(state, closed) {
    state.closed = closed
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
    const dynamicNavItems = state.dynamicNavItems[extension] || []
    return [...staticNavItems, ...dynamicNavItems].filter((navItem) => {
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
  },
  getExtensionsWithNavItems: (state, getters) => {
    // get a unique list of extension ids by collecting the ids in a set and then spreading them into an array.
    const extensions = [
      ...new Set([...Object.keys(state.staticNavItems), ...Object.keys(state.dynamicNavItems)])
    ]
    // return only those extension ids that really have at least one nav item.
    // Context: NavItems can be removed, so the map key could still exist with an empty array of nav items.
    return extensions.filter((extension) => getters.getNavItemsByExtension(extension).length > 0)
  }
}

const actions = {
  openNavigation({ commit }) {
    commit('SET_CLOSED', false)
  },
  closeNavigation({ commit }) {
    commit('SET_CLOSED', true)
  }
}
export default {
  state,
  mutations,
  getters,
  actions
}
