import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { useRouter, useClientService, useStore } from 'web-pkg/src/composables'
import { unref } from '@vue/composition-api'
import { Store } from 'vuex'
import { ClientService } from 'web-pkg/src/services/client'

import {
  FolderLoaderSpacesProject,
  FolderLoaderSpacesShare,
  FolderLoaderFavorites,
  FolderLoaderLegacyPersonal,
  FolderLoaderPublicFiles,
  FolderLoaderSharedViaLink,
  FolderLoaderSharedWithMe,
  FolderLoaderSharedWithOthers,
  FolderLoaderTrashbin,
  FolderLoaderSpacesPersonal
} from './folder/'

export * from './folder/util'

export type FolderLoaderTask = any

export type TaskContext = {
  clientService: ClientService
  store: Store<any>
  router: Router
}

export interface FolderLoader {
  isEnabled(store: Store<any>): boolean
  isActive(router: Router): boolean
  getTask(options: TaskContext): FolderLoaderTask
}

export class FolderService {
  private readonly loaders: FolderLoader[]

  constructor() {
    this.loaders = [
      // legacy loaders
      new FolderLoaderLegacyPersonal(),
      // spaces loaders
      new FolderLoaderSpacesPersonal(),
      new FolderLoaderSpacesProject(),
      new FolderLoaderSpacesShare(),
      // generic loaders
      new FolderLoaderFavorites(),
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
      const loader = loaders.find((l) => l.isEnabled(unref(store)) && l.isActive(unref(router)))
      if (!loader) {
        console.error('No folder loader found for route')
        return
      }
      const context = {
        clientService,
        store,
        router
      }
      try {
        yield loader.getTask(context).perform(...args)
      } catch (e) {
        console.error(e)
      }
    })
  }
}

export const folderService = new FolderService()
