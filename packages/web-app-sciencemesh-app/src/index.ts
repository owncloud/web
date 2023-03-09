import App from './views/App.vue'
import About from './views/About.vue'

const appInfo = {
  name: 'ScienceMesh',
  id: 'sciencemesh-app',
  icon: 'contacts-book',
  isFileEditor: false
}

const routes = [
  {
    path: '/',
    redirect: () => {
      return { name: 'sciencemesh-app-invitations' }
    }
  },
  // {
  //   path: '/outgoing-invitations',
  //   name: 'sciencemesh-app-outgoing-invitations',
  //   component: OutgoingInvitations,
  //   meta: {
  //     patchCleanPath: true,
  //     title: 'Invitations from me'
  //   }
  // },
  // {
  //   path: '/incoming-invitations',
  //   name: 'sciencemesh-app-incoming-invitations',
  //   component: IncomingInvitations,
  //   meta: {
  //     patchCleanPath: true,
  //     title: 'Invitations to me'
  //   }
  // },
  // {
  //   path: '/connections',
  //   name: 'sciencemesh-app-connections',
  //   component: Connections,
  //   meta: {
  //     patchCleanPath: true,
  //     title: 'My connections'
  //   }
  // },
  {
    path: '/invitations',
    name: 'sciencemesh-app-invitations',
    component: App,
    meta: {
      patchCleanPath: true,
      title: 'Invitations'
    }
  },
  {
    path: '/about',
    name: 'sciencemesh-app-about',
    component: About,
    meta: {
      patchCleanPath: true,
      title: 'About'
    }
  }
]

const navItems = [
  {
    name: 'Invitations',
    icon: 'user-shared',
    route: {
      path: `/${appInfo.id}/invitations?`
    },
    enabled: () => {
      return true
    }
  },
  {
    name: 'About',
    icon: 'information',
    route: {
      path: `/${appInfo.id}/about?`
    },
    enabled: () => {
      return true
    }
  }]
//   {
//     name: 'Invitations from me',
//     icon: 'user-shared',
//     route: {
//       path: `/${appInfo.id}/outgoing-invitations?`
//     },
//     enabled: () => {
//       return true
//     }
//   },
//   {
//     name: 'Invitations to me',
//     icon: 'user-received',
//     route: {
//       path: `/${appInfo.id}/incoming-invitations?`
//     },
//     enabled: () => {
//       return true
//     }
//   },
//   {
//     name: 'My connections',
//     icon: 'user-follow',
//     route: {
//       path: `/${appInfo.id}/connections?`
//     },
//     enabled: () => {
//       return true
//     }
//   }
// ]

export default {
  appInfo,
  routes,
  navItems
}
