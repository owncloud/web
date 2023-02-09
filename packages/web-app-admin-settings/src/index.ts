import translations from '../l10n/translations.json'
import General from './views/General.vue'
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

// FIXME: a better way to access this is needed
const permissionManager = () => (window as any).__$permissionManager

const routes = [
  {
    path: '/',
    redirect: () => {
      if (permissionManager().hasSystemManagement()) {
        return { name: 'admin-settings-general' }
      }
      return { name: 'admin-settings-spaces' }
    }
  },
  {
    path: '/general',
    name: 'admin-settings-general',
    component: General,
    meta: {
      authContext: 'user',
      title: $gettext('General')
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
    name: $gettext('General'),
    icon: 'settings-4',
    route: {
      path: `/${appInfo.id}/general?`
    },
    enabled: () => {
      return permissionManager().hasSystemManagement()
    }
  },
  {
    name: $gettext('Users'),
    icon: 'user',
    route: {
      path: `/${appInfo.id}/users?`
    },
    enabled: () => {
      return permissionManager().hasUserManagement()
    }
  },
  {
    name: $gettext('Groups'),
    icon: 'group-2',
    route: {
      path: `/${appInfo.id}/groups?`
    },
    enabled: () => {
      return permissionManager().hasUserManagement()
    }
  },
  {
    name: $gettext('Spaces'),
    icon: 'layout-grid',
    route: {
      path: `/${appInfo.id}/spaces?`
    },
    enabled: () => {
      return permissionManager().hasSpaceManagement()
    }
  }
]

export default {
  appInfo,
  routes,
  translations,
  navItems
}
