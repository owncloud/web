import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['getNavItemsByExtension'])
  },
  methods: {
    /**
     * Returns well formed menuItem objects by a list of extensions.
     * The following properties must be accessible in the wrapping code:
     * - applicationsList
     * - $language
     *
     * @param {Array} permittedMenus
     * @param {String} activeRoutePath
     * @returns {*}
     */
    navigation_getMenuItems(permittedMenus, activeRoutePath) {
      return this.applicationsList
        .filter((app) => {
          if (app.type === 'extension') {
            // check if the extension has at least one navItem with a matching menuId
            return (
              this.getNavItemsByExtension(app.id).filter((navItem) =>
                isNavItemPermitted(permittedMenus, navItem)
              ).length > 0
            )
          }
          return isNavItemPermitted(permittedMenus, app)
        })
        .map((item) => {
          const lang = this.$language.current
          // TODO: move language resolution to a common function
          // FIXME: need to handle logic for variants like en_US vs en_GB
          let title = item.title ? item.title.en : item.name
          let icon
          let iconUrl
          if (item.title && item.title[lang]) {
            title = item.title[lang]
          }

          if (!item.icon) {
            icon = 'deprecated' // "broken" icon
          } else if (item.icon.indexOf('.') < 0) {
            // not a file name or URL, treat as a material icon name instead
            icon = item.icon
          } else {
            iconUrl = item.icon
          }

          const app = {
            icon: icon,
            iconUrl: iconUrl,
            title: title
          }

          if (item.url) {
            app.url = item.url
            app.target = ['_blank', '_self', '_parent', '_top'].includes(item.target)
              ? item.target
              : '_blank'
          } else if (item.path) {
            app.path = item.path
            app.active = activeRoutePath?.startsWith(app.path)
          } else {
            app.path = `/${item.id}`
            app.active = activeRoutePath?.startsWith(app.path)
          }

          return app
        })
    }
  }
}

function isNavItemPermitted(permittedMenus, navItem) {
  if (navItem.menu) {
    return permittedMenus.includes(navItem.menu)
  }
  return permittedMenus.includes(null)
}
