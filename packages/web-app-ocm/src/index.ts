import App from './views/App.vue'
import Wayf from './views/Wayf.vue'
import { ApplicationInformation, defineWebApplication, useRouter } from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import { extensions } from './extensions'
import { RouteRecordRaw } from 'vue-router'
import { useGettext } from 'vue3-gettext'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      return { name: 'open-cloud-mesh-invitations' }
    }
  },
  {
    path: '/invitations',
    name: 'open-cloud-mesh-invitations',
    component: App,
    meta: {
      patchCleanPath: true,
      title: 'Invitations'
    }
  },
  {
    path: '/accept-invite',
    name: 'open-cloud-mesh-accept-invite',
    component: App,
    meta: {
      patchCleanPath: true,
      title: 'Accept Invitation'
    }
  },
  {
    path: '/wayf',
    name: 'open-cloud-mesh-wayf',
    component: Wayf,
    meta: {
      patchCleanPath: true,
      title: 'Where Are You From',
      /*
      How authentication context works:
      authContext: 'user'         requires full authentication (default)
      authContext: 'anonymous'    no authentication required
      authContext: 'hybrid'       works with or without authentication (didn't work without login for me)
      authContext: 'idp'          requires IdP authentication only
      authContext: 'publicLink'   for public link contexts
      */
      authContext: 'anonymous'
    }
  }
]

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()
    const router = useRouter()

    const appInfo: ApplicationInformation = {
      name: $gettext('ScienceMesh'),
      id: 'open-cloud-mesh',
      color: '#AE291D',
      icon: 'contacts-book'
    }

    router.addRoute({
      path: '/accept',
      redirect: () => {
        return { path: `/${appInfo.id}` }
      }
    })

    const navItems = [
      {
        name: $gettext('Invitations'),
        icon: 'user-shared',
        route: {
          path: `/${appInfo.id}/invitations?`
        },
        enabled: () => true
      }
    ]

    return {
      appInfo,
      routes,
      navItems,
      extensions: extensions(appInfo),
      translations
    }
  }
})
