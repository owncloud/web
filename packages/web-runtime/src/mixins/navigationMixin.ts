import { some } from 'lodash-es'
import { mapGetters } from 'vuex'
import { LinkConfig, Link } from '../store/config'

const applicationContainerTarget = 'application-container'

// FIXME: do not use english title but a name or an id
// We cannot do that right now because oCIS does not pass through id or name
export const getLinkIdentifier = (link: LinkConfig) => link.title.en
// FIXME: see above
const checkLink = (link: LinkConfig) => {
  // if (link.target === applicationContainerTarget) {
  //   if (!link.name) {
  //     console.warn(
  //       `Error: Menu Item with target "${applicationContainerTarget}" needs "name" specified and will not show up until it's added.`,
  //       link
  //     )
  //     return false
  //   }
  // }
  return true
}

export const getTranslatedTitle = (link: LinkConfig, lang: string): string => {
  // TODO: move language resolution to a common function
  // FIXME: need to handle logic for variants like en_US vs en_GB
  return link?.title?.[lang] || link?.title?.['en'] || link.name
}

export default {
  computed: {
    ...mapGetters(['getNavItemsByExtension', 'user'])
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
        .filter(checkLink)
        .filter((link: LinkConfig) => {
          if (link.groupsEnabled) {
            return some(this.user.groups, (g) => link.groupsEnabled.includes(g.displayName))
          }

          if (link.rolesEnabled) {
            return link.rolesEnabled.includes(this.user.role?.name)
          }

          return true
        })
        .map((item): Link => {
          let icon
          let iconUrl

          if (!item.icon) {
            icon = 'deprecated' // "broken" icon
          } else if (item.icon.indexOf('.') < 0) {
            // not a file name or URL, treat as a material icon name instead
            icon = item.icon
          } else {
            iconUrl = item.icon
          }

          const app: Link = {
            icon: icon,
            iconUrl: iconUrl,
            title: getTranslatedTitle(item, this.$language.current),
            groupsEnabled: item.groupsEnabled,
            rolesEnabled: item.rolesEnabled
          }

          if (item.url) {
            if (item.target === applicationContainerTarget) {
              app.target = '_self'
              app.path = `/e/${getLinkIdentifier(item)}`
            } else {
              app.url = item.url
              app.target = ['_blank', '_self', '_parent', '_top'].includes(item.target)
                ? item.target
                : '_blank'
            }
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
