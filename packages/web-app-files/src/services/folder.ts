import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import {
  useRouter,
  useClientService,
  useStore,
  useConfigurationManager,
  useUserStore,
  UserStore
} from '@ownclouders/web-pkg'
import { unref } from 'vue'
import { Store } from 'vuex'
import { ClientService } from '@ownclouders/web-pkg'

import {
  FolderLoaderSpace,
  FolderLoaderFavorites,
  FolderLoaderSharedViaLink,
  FolderLoaderSharedWithMe,
  FolderLoaderSharedWithOthers,
  FolderLoaderTrashbin
} from './folder/index'
import { ConfigurationManager } from '@ownclouders/web-pkg'

export * from './folder/types'

export type FolderLoaderTask = any

export type TaskContext = {
  clientService: ClientService
  configurationManager: ConfigurationManager
  store: Store<any>
  userStore: UserStore
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
      new FolderLoaderSpace(),
      new FolderLoaderFavorites(),
      new FolderLoaderSharedViaLink(),
      new FolderLoaderSharedWithMe(),
      new FolderLoaderSharedWithOthers(),
      new FolderLoaderTrashbin()
    ]
  }

  public getTask(): FolderLoaderTask {
    const store = useStore()
    const userStore = useUserStore()
    const router = useRouter()
    const clientService = useClientService()
    const configurationManager = useConfigurationManager()
    const loader = this.loaders.find((l) => l.isEnabled(unref(store)) && l.isActive(unref(router)))
    if (!loader) {
      console.error('No folder loader found for route')
      return
    }

    return useTask(function* (...args) {
      const context = {
        clientService,
        configurationManager,
        store,
        userStore,
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
