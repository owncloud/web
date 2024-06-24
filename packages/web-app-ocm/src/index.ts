import {
  ComponentLoader,
  defineWebApplication,
  useRouter,
  useUserStore
} from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import { extensions } from './extensions'
import { RouteRecordRaw } from 'vue-router'
import { useGettext } from 'vue3-gettext'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      return { name: 'ocm-app-invitations' }
    }
  },
  {
    path: '/invitations',
    name: 'ocm-app-invitations',
    component: ComponentLoader(async () => (await import('./views/App.vue')).default),
    meta: {
      patchCleanPath: true,
      title: 'Invitations'
    }
  }
]

export default defineWebApplication({
  setup() {
    const { $gettext } = useGettext()
    const router = useRouter()
    const userStore = useUserStore()

    const appInfo = {
      name: $gettext('ScienceMesh'),
      id: 'ocm',
      color: '#AE291D',
      icon: 'contacts-book',
      isFileEditor: false,
      applicationMenu: {
        enabled: () => {
          return !!userStore.user
        }
      }
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
      extensions: extensions(),
      translations
    }
  }
})
