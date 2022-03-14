import Router from 'vue-router'
import { useTask } from 'vue-concurrency'
import { useRouter, useClientService, useStore } from 'web-pkg/src/composables'
import { unref } from '@vue/composition-api'
import { Store } from 'vuex'
import { ClientService } from 'web-pkg/src/services/client'

import {
  FolderLoaderFavorites,
  FolderLoaderLegacyPersonal,
  FolderLoaderSpacesProject,
  FolderLoaderPublicFiles,
  FolderLoaderSharedViaLink,
  FolderLoaderSharedWithMe,
  FolderLoaderSharedWithOthers,
  FolderLoaderTrashbin,
  FolderLoaderSpacesSharedWithMe
} from './folder/'

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
      new FolderLoaderSharedWithMe(),
      // spaces loaders
      new FolderLoaderSpacesProject(),
      new FolderLoaderSpacesSharedWithMe(),
      // generic loaders
      new FolderLoaderFavorites(),
      new FolderLoaderPublicFiles(),
      new FolderLoaderSharedViaLink(),
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
