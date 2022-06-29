import { Registry } from './services'
import translations from '../l10n/translations'
import Users from './views/Users.vue'
import Groups from './views/Groups.vue'
import { FilterSearch } from './search'
import { bus } from 'web-pkg/src/instance'
import { PermissionManagerService } from 'web-pkg/src/services'
// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const user = window.Vue.$store.getters.user
const permissionManagerService = new PermissionManagerService(user)

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
    component: Users
  },
  {
    path: '/groups',
    name: 'user-management-groups',
    component: Groups
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
      return permissionManagerService.hasUserManagement()
    }
  },
  {
    name: $gettext('Groups'),
    icon: 'group-2',
    route: {
      path: `/${appInfo.id}/groups?`
    },
    enabled: () => {
      return permissionManagerService.hasUserManagement()
    }
  }
]

export default {
  appInfo,
  routes,
  translations,
  navItems,
  ready({ router }) {
    Registry.search = new FilterSearch(router)
    bus.publish('app.search.register.provider', Registry.search)
  }
}
