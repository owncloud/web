import { defineStore } from 'pinia'
import { App, AppStoreRepository, RawAppListSchema } from '../types'
import { ref } from 'vue'
import { APPID } from '../appid'
import { useRepositoriesStore } from './repositories'

export const useAppsStore = defineStore(`${APPID}-apps`, () => {
  const apps = ref<App[]>([])

  const repositoriesStore = useRepositoriesStore()

  const loadApps = async () => {
    const loadAppsByRepo = async (repo: AppStoreRepository): Promise<App[]> => {
      try {
        const data = await fetch(repo.url)
        const appsListData = await data.json()
        const appsList = RawAppListSchema.parse(appsListData)
        return appsList.apps.map((app) => {
          return {
            ...app,
            repository: repo
          }
        })
      } catch (e) {
        console.error(e)
        return []
      }
    }

    const loadAppsPromises: Promise<App[]>[] = []
    for (const repo of repositoriesStore.repositories) {
      loadAppsPromises.push(loadAppsByRepo(repo))
    }
    apps.value = (await Promise.all(loadAppsPromises)).flat()
  }

  return {
    apps,
    loadApps
  }
})
