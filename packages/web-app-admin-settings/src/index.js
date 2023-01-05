import translations from '../l10n/translations'
import Users from './views/Users.vue'
import Groups from './views/Groups.vue'
import Spaces from './views/Spaces.vue'
// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: $gettext('Administration Settings'),
  id: 'admin-settings',
  icon: 'settings-4',
  isFileEditor: false
}

const routes = [
  {
    path: '/',
    redirect: () => {
      const permissionManager = window.Vue.$permissionManager
      if (permissionManager.hasUserManagement()) {
        return { name: 'admin-settings-users' }
      }
      return { name: 'admin-settings-spaces' }
    }
  },
  {
    path: '/users',
    name: 'admin-settings-users',
    component: Users,
    meta: {
      authContext: 'user',
      title: $gettext('Users')
    }
  },
  {
    path: '/groups',
    name: 'admin-settings-groups',
    component: Groups,
    meta: {
      authContext: 'user',
      title: $gettext('Groups')
    }
  },
  {
    path: '/spaces',
    name: 'admin-settings-spaces',
    component: Spaces,
    meta: {
      authContext: 'user',
      title: $gettext('Spaces')
    }
  }
]

const navItems = [
  {
    name: $gettext('Users'),
    icon: 'user',
    route: {
      path: `/${appInfo.id}/users?`
    },
    enabled: () => {
      const permissionManager = window.Vue.$permissionManager
      return permissionManager.hasUserManagement()
    }
  },
  {
    name: $gettext('Groups'),
    icon: 'group-2',
    route: {
      path: `/${appInfo.id}/groups?`
    },
    enabled: () => {
      const permissionManager = window.Vue.$permissionManager
      return permissionManager.hasUserManagement()
    }
  },
  {
    name: $gettext('Spaces'),
    icon: 'layout-grid',
    route: {
      path: `/${appInfo.id}/spaces?`
    },
    enabled: () => {
      const permissionManager = window.Vue.$permissionManager
      return permissionManager.hasSpaceManagement()
    }
  }
]

export default {
  appInfo,
  routes,
  translations,
  navItems
}
