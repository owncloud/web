import App from './views/App.vue'
import { defineWebApplication, useRouter } from '@ownclouders/web-pkg'
import translations from '../l10n/translations.json'
import { extensions } from './extensions'
import { RouteRecordRaw } from 'vue-router'
import { useGettext } from 'vue3-gettext'

const appInfo = {
  name: 'ScienceMesh',
  id: 'sciencemesh-app',
  icon: 'contacts-book',
  isFileEditor: false
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      return { name: 'sciencemesh-app-invitations' }
    }
  },
  {
    path: '/invitations',
    name: 'sciencemesh-app-invitations',
    component: App,
    meta: {
      patchCleanPath: true,
      title: 'Invitations'
    }
  }
]

export default defineWebApplication({
  setup(args) {
    const { $gettext } = useGettext()
    const router = useRouter()

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
      extensions: extensions(args),
      translations
    }
  }
})
