import { Router } from 'vue-router'
import { useTask } from 'vue-concurrency'
import {
  useRouter,
  useClientService,
  useUserStore,
  UserStore,
  SpacesStore,
  useSpacesStore,
  CapabilityStore,
  useCapabilityStore,
  useConfigStore,
  ConfigStore,
  ResourcesStore,
  useResourcesStore,
  SharesStore,
  useSharesStore
} from '@ownclouders/web-pkg'
import { unref } from 'vue'
import { ClientService } from '@ownclouders/web-pkg'

import {
  FolderLoaderSpace,
  FolderLoaderFavorites,
  FolderLoaderSharedViaLink,
  FolderLoaderSharedWithMe,
  FolderLoaderSharedWithOthers,
  FolderLoaderTrashbin
} from './folder/index'

export * from './folder/types'

export type FolderLoaderTask = any

export type TaskContext = {
  clientService: ClientService
  configStore: ConfigStore
  userStore: UserStore
  spacesStore: SpacesStore
  router: Router
  capabilityStore: CapabilityStore
  resourcesStore: ResourcesStore
  sharesStore: SharesStore
}

export interface FolderLoader {
  isEnabled(): boolean
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
    const userStore = useUserStore()
    const spacesStore = useSpacesStore()
    const capabilityStore = useCapabilityStore()
    const router = useRouter()
    const clientService = useClientService()
    const configStore = useConfigStore()
    const resourcesStore = useResourcesStore()
    const sharesStore = useSharesStore()

    const loader = this.loaders.find((l) => l.isEnabled() && l.isActive(unref(router)))
    if (!loader) {
      console.debug('No folder loader found for route')
      return
    }

    return useTask(function* (...args) {
      const context = {
        clientService,
        configStore,
        userStore,
        spacesStore,
        capabilityStore,
        resourcesStore,
        sharesStore,
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
