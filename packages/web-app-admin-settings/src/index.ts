import translations from '../l10n/translations.json'
import { Ability } from '@ownclouders/web-client'
import {
  AppNavigationItem,
  ComponentLoader,
  defineWebApplication,
  useAbility,
  useUserStore
} from '@ownclouders/web-pkg'
import { RouteRecordRaw } from 'vue-router'

// just a dummy function to trick gettext tools
function $gettext(msg: string) {
  return msg
}

const appId = 'admin-settings'

export const routes = ({ $ability }: { $ability: Ability }): RouteRecordRaw[] => [
  {
    path: '/',
    redirect: () => {
      if ($ability.can('read-all', 'Setting')) {
        return { name: 'admin-settings-general' }
      }
      if ($ability.can('read-all', 'Account')) {
        return { name: 'admin-settings-users' }
      }
      if ($ability.can('read-all', 'Group')) {
        return { name: 'admin-settings-groups' }
      }
      if ($ability.can('read-all', 'Drive')) {
        return { name: 'admin-settings-spaces' }
      }
      throw Error('Insufficient permissions')
    }
  },
  {
    path: '/general',
    name: 'admin-settings-general',
    component: ComponentLoader(async () => (await import('./views/General.vue')).default),
    beforeEnter: (to, from, next) => {
      if (!$ability.can('read-all', 'Setting')) {
        next({ path: '/' })
      }
      next()
    },
    meta: {
      authContext: 'user',
      title: $gettext('General')
    }
  },
  {
    path: '/users',
    name: 'admin-settings-users',
    component: ComponentLoader(async () => (await import('./views/Users.vue')).default),
    beforeEnter: (to, from, next) => {
      if (!$ability.can('read-all', 'Account')) {
        next({ path: '/' })
      }
      next()
    },
    meta: {
      authContext: 'user',
      title: $gettext('Users')
    }
  },
  {
    path: '/groups',
    name: 'admin-settings-groups',
    component: ComponentLoader(async () => (await import('./views/Groups.vue')).default),
    beforeEnter: (to, from, next) => {
      if (!$ability.can('read-all', 'Group')) {
        next({ path: '/' })
      }
      next()
    },
    meta: {
      authContext: 'user',
      title: $gettext('Groups')
    }
  },
  {
    path: '/spaces',
    name: 'admin-settings-spaces',
    component: ComponentLoader(async () => (await import('./views/Spaces.vue')).default),
    beforeEnter: (to, from, next) => {
      if (!$ability.can('read-all', 'Drive')) {
        next({ path: '/' })
      }
      next()
    },
    meta: {
      authContext: 'user',
      title: $gettext('Spaces')
    }
  }
]

export const navItems = ({ $ability }: { $ability: Ability }): AppNavigationItem[] => [
  {
    name: $gettext('General'),
    icon: 'settings-4',
    route: {
      path: `/${appId}/general?`
    },
    isVisible: () => {
      return $ability.can('read-all', 'Setting')
    },
    priority: 10
  },
  {
    name: $gettext('Users'),
    icon: 'user',
    route: {
      path: `/${appId}/users?`
    },
    isVisible: () => {
      return $ability.can('read-all', 'Account')
    },
    priority: 20
  },
  {
    name: $gettext('Groups'),
    icon: 'group-2',
    route: {
      path: `/${appId}/groups?`
    },
    isVisible: () => {
      return $ability.can('read-all', 'Group')
    },
    priority: 30
  },
  {
    name: $gettext('Spaces'),
    icon: 'layout-grid',
    route: {
      path: `/${appId}/spaces?`
    },
    isVisible: () => {
      return $ability.can('read-all', 'Drive')
    },
    priority: 40
  }
]

export default defineWebApplication({
  setup() {
    const { can } = useAbility()
    const userStore = useUserStore()

    return {
      appInfo: {
        name: $gettext('Admin Settings'),
        id: appId,
        icon: 'settings-4',
        color: '#2b2b2b',
        isFileEditor: false,
        applicationMenu: {
          enabled: () => {
            return (
              userStore.user &&
              (can('read-all', 'Setting') ||
                can('read-all', 'Account') ||
                can('read-all', 'Group') ||
                can('read-all', 'Drive'))
            )
          },
          priority: 40
        }
      },
      routes,
      navItems,
      translations
    }
  }
})
