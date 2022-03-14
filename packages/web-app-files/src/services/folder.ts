import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { useRouter, useClientService, useStore } from 'web-pkg/src/composables'
import { unref } from '@vue/composition-api'
import { Store } from 'vuex'
import { ClientService } from 'web-pkg/src/services/client'

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
  clientService: ClientService
  store: Store<any>
  router: Router
}

export interface FolderLoader {
  isActive(router: Router): boolean
  getTask(options: TaskContext): FolderLoaderTask
}

export class FolderService {
  private readonly loaders: FolderLoader[]

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
    const clientService = useClientService()
    const loaders = this.loaders

    return useTask(function* (...args) {
      const loader = loaders.find((l) => l.isActive(unref(router)))
      if (!loader) {
        throw new Error('No folder loader found for route')
      }
      const context = {
        clientService,
        store,
        router
      }
      yield loader.getTask(context).perform(...args)
    })
  }
}

export const folderService = new FolderService()
