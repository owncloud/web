import translations from '../l10n/translations.json'
import General from './views/General.vue'
import Users from './views/Users.vue'
import Groups from './views/Groups.vue'
import Spaces from './views/Spaces.vue'
import { Ability, urlJoin } from '@ownclouders/web-client'
import {
  ApplicationInformation,
  AppMenuItemExtension,
  AppNavigationItem,
  defineWebApplication,
  useAbility,
  useUserStore
} from '@ownclouders/web-pkg'
import { RouteRecordRaw } from 'vue-router'
import { computed } from 'vue'

// just a dummy function to trick gettext tools
function $gettext(msg: string) {
  return msg
}

const appId = 'admin-settings'

function adminAcrGuard(to, from, next) {
  if (typeof window === 'undefined') {
    next()
    return
  }

  // Avoid re-triggering when returning from step-up or when a request is already in-flight for this route
  const hasStepupParam = !!to.query.stepup
  // const hasGlobalStepupFlag = new URLSearchParams(window.location.search).has('stepupAcr')
  const stepupKey = 'oc.stepup:admin-settings'
  const alreadyRequested = sessionStorage.getItem(stepupKey) === '1'

  // diagnostics
  try {
    console.debug('[adminAcrGuard] enter', {
      to: to.fullPath,
      hasStepupParam,
      // hasGlobalStepupFlag,
      alreadyRequested,
      locationSearch: window.location.search
    })
  } catch (_) {}

  // if (!hasStepupParam && !hasGlobalStepupFlag && !alreadyRequested) {
  if (!hasStepupParam && !alreadyRequested) {
    const redirectUrl = to.fullPath + (to.fullPath.includes('?') ? '&' : '?') + 'stepup=1'
    try {
      sessionStorage.setItem(stepupKey, '1')
    } catch (_) {
      // ignore storage errors
    }
    try {
      console.info('[adminAcrGuard] initiating step-up', { redirectUrl })
    } catch (_) {}
    window.location.assign(`/?stepupAcr=advanced&redirectUrl=${encodeURIComponent(redirectUrl)}`)
    return
  }

  // window.location.assign(`/`)
  // return
  try {
    console.debug('[adminAcrGuard] pass-through')
  } catch (_) {}
  next()
}

function getAvailableRoute(ability: Ability) {
  if (ability.can('read-all', 'Setting')) {
    return { name: 'admin-settings-general' }
  }

  if (ability.can('read-all', 'Account')) {
    return { name: 'admin-settings-users' }
  }

  if (ability.can('read-all', 'Group')) {
    return { name: 'admin-settings-groups' }
  }

  if (ability.can('read-all', 'Drive')) {
    return { name: 'admin-settings-spaces' }
  }

  throw Error('Insufficient permissions')
}

export const routes = ({ $ability }: { $ability: Ability }): RouteRecordRaw[] => [
  {
    path: '/',
    redirect: () => {
      return { name: 'admin-settings-general' }
    }
  },
  {
    path: '/general',
    name: 'admin-settings-general',
    component: General,
    beforeEnter: adminAcrGuard,
    meta: {
      authContext: 'user',
      title: $gettext('General')
    }
  },
  {
    path: '/users',
    name: 'admin-settings-users',
    component: Users,
    beforeEnter: adminAcrGuard,
    meta: {
      authContext: 'user',
      title: $gettext('Users')
    }
  },
  {
    path: '/groups',
    name: 'admin-settings-groups',
    component: Groups,
    beforeEnter: adminAcrGuard,
    meta: {
      authContext: 'user',
      title: $gettext('Groups')
    }
  },
  {
    path: '/spaces',
    name: 'admin-settings-spaces',
    component: Spaces,
    beforeEnter: adminAcrGuard,
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

    const appInfo: ApplicationInformation = {
      name: $gettext('Admin Settings'),
      id: appId,
      icon: 'settings-4',
      color: '#2b2b2b'
    }

    const menuItems = computed<AppMenuItemExtension[]>(() => {
      const items: AppMenuItemExtension[] = []

      const menuItemAvailable =
        userStore.user &&
        (can('read-all', 'Setting') ||
          can('read-all', 'Account') ||
          can('read-all', 'Group') ||
          can('read-all', 'Drive'))

      if (menuItemAvailable) {
        items.push({
          id: `app.${appInfo.id}.menuItem`,
          type: 'appMenuItem',
          label: () => appInfo.name,
          color: appInfo.color,
          icon: appInfo.icon,
          priority: 40,
          path: urlJoin(appInfo.id)
        })
      }

      return items
    })

    return {
      appInfo,
      routes,
      navItems,
      translations,
      extensions: menuItems
    }
  }
})
