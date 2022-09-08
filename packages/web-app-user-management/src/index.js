import translations from '../l10n/translations'
import Users from './views/Users.vue'
import Groups from './views/Groups.vue'
// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: $gettext('User management'),
  id: 'user-management',
  icon: 'user-settings',
  isFileEditor: false
}

const routes = [
  {
    path: '/',
    redirect: () => {
      return { name: 'user-management-users' }
    }
  },
  {
    path: '/users',
    name: 'user-management-users',
    component: Users,
    meta: {
      title: $gettext('Users')
    }
  },
  {
    path: '/groups',
    name: 'user-management-groups',
    component: Groups,
    meta: {
      title: $gettext('Groups')
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
  }
]

export default {
  appInfo,
  routes,
  translations,
  navItems,
}
