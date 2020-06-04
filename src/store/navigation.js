const state = {
  // static nav items are set during extension loading and will not be modified later on
  staticNavItems: {},
  // dynamic nav items are initially empty and can be created e.g. from loaded data
  dynamicNavItems: {}
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
    const dynamicNavItems = state.dynamicNavItems
    dynamicNavItems[extension] = dynamicNavItems[extension] || []
    const index = dynamicNavItems[extension].findIndex(item => item.name === navItem.name)
    if (index >= 0) {
      dynamicNavItems[extension][index] = navItem
    } else {
      dynamicNavItems[extension].push(navItem)
    }
    state.dynamicNavItems = dynamicNavItems
  }
}

const getters = {
  /**
   * Get all nav items that are associated with the given extension id.
   *
   * @param state
   * @returns {function(*): *[]}
   */
  getNavItems: state => extension => {
    const staticNavItems = state.staticNavItems[extension] || []
    const dynamicNavItems = state.dynamicNavItems[extension] || []
    return [...staticNavItems, ...dynamicNavItems]
  },
  /**
   * Get all extension ids that have at least one navigation item.
   *
   * @param state
   * @returns {*[]}
   */
  getExtensionsWithNavItems: state => {
    // get a unique list of extension ids by collecting the ids in a set and then spreading them into an array.
    const extensions = [
      ...new Set([...Object.keys(state.staticNavItems), ...Object.keys(state.dynamicNavItems)])
    ]
    // return only those extension ids that really have at least one nav item.
    // Context: NavItems can be removed, so the map key could still exist with an empty array of nav items.
    return extensions.filter(extension => {
      return (
        (state.staticNavItems[extension] || []).length > 0 ||
        (state.dynamicNavItems[extension] || []).length > 0
      )
    })
  }
}

export default {
  state,
  mutations,
  getters
}
