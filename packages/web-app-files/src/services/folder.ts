import Router, { Route } from 'vue-router'
import { useTask } from 'vue-concurrency'
import { useRoute, useRouter } from 'web-pkg/src/composables/router'
import { unref } from '@vue/composition-api'
import { useStore } from '../../../web-pkg/src/composables'
import { Store } from 'vuex'

import {
  FolderLoaderFavorites,
  FolderLoaderPersonal,
  FolderLoaderProject,
  FolderLoaderPublicFiles,
  FolderLoaderSharedViaLink,
  FolderLoaderSharedWithMe,
  FolderLoaderSharedWithOthers,
  FolderLoaderTrashbin
} from './folder/'

export type FolderLoaderTask = any

export type TaskContext = {
  store: Store<any>
  router: Router
  route: Route
}

export interface FolderLoader {
  isEnabled(router: Router): boolean
  getTask(options: TaskContext): FolderLoaderTask
}

export class FolderService {
  private loaders: FolderLoader[]

  constructor() {
    this.loaders = [
      new FolderLoaderFavorites(),
      new FolderLoaderPersonal(),
      new FolderLoaderProject(),
      new FolderLoaderPublicFiles(),
      new FolderLoaderSharedViaLink(),
      new FolderLoaderSharedWithMe(),
      new FolderLoaderSharedWithOthers(),
      new FolderLoaderTrashbin()
    ]
  }

  public getTask(): FolderLoaderTask {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const loaders = this.loaders

    return useTask(function* (...args) {
      const loader = loaders.find((l) => l.isEnabled(unref(router)))
      if (!loader) {
        throw new Error('No folder loader found for route')
      }
      const context = {
        store,
        router,
        route: unref(route)
      }
      yield loader.getTask(context).perform(...args)
    })
  }
}

export const folderService = new FolderService()
