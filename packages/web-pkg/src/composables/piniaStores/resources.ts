import { defineStore } from 'pinia'
import { Ref, computed, ref, unref } from 'vue'
import {
  extractNodeId,
  isProjectSpaceResource,
  isPublicSpaceResource,
  SpaceResource,
  urlJoin,
  type Resource
} from '@ownclouders/web-client'
import { getIndicators } from '../../helpers'
import { AncestorMetaData, AncestorMetaDataValue } from '../../types'
import { WebDAV } from '@ownclouders/web-client/webdav'
import { useUserStore } from './user'

export const useResourcesStore = defineStore('resources', () => {
  const userStore = useUserStore()

  const resources = ref<Resource[]>([]) as Ref<Resource[]>
  const currentFolder = ref<Resource>()
  const ancestorMetaData = ref<AncestorMetaData>({})

  const activeResources = computed(() => {
    let res = unref(resources)

    if (!unref(areHiddenFilesShown)) {
      res = res.filter((file) => !file.name.startsWith('.'))
    }

    return res
  })

  const totalResourcesSize = computed(() => {
    return unref(resources)
      .map((r) => (r.size ? parseInt(r.size.toString()) : 0))
      .reduce((x, y) => x + y, 0)
  })

  const totalResourcesCount = computed(() => {
    const fileCount = unref(resources).filter(({ type }) => type === 'file').length
    const hiddenFileCount = unref(resources).filter(
      ({ type, name }) => type === 'file' && name.startsWith('.')
    ).length
    const folderCount = unref(resources).filter(({ type }) => type === 'folder').length
    const hiddenFolderCount = unref(resources).filter(
      ({ type, name }) => type === 'folder' && name.startsWith('.')
    ).length
    const spaceCount = unref(resources).filter(isProjectSpaceResource).length

    return {
      files: fileCount,
      hiddenFiles: hiddenFileCount,
      folders: folderCount,
      hiddenFolders: hiddenFolderCount,
      spaces: spaceCount
    }
  })

  const setResources = (file: Resource[]) => {
    resources.value = file
  }

  const removeResources = (values: Resource[]) => {
    resources.value = unref(resources).filter((file) => !values.find(({ id }) => id === file.id))
  }

  const clearResources = () => {
    resources.value = []
  }

  const upsertResource = (resource: Resource) => {
    const existing = unref(resources).find(({ id }) => id === resource.id)
    if (existing) {
      Object.assign(existing, resource)
      return
    }
    unref(resources).push(resource)
  }

  const upsertResources = (values: Resource[]) => {
    const other = unref(resources).filter((f) => !values.some((r) => r.path === f.path))
    resources.value = [...other, ...values]
  }

  const updateResourceField = <T extends Resource>({
    id,
    field,
    value
  }: {
    id: T['id']
    field: keyof T
    value: T[keyof T]
  }) => {
    const resource = unref(resources).find((resource) => id === resource.id) as T
    if (resource) {
      resource[field] = value
    }
  }

  const setCurrentFolder = (value: Resource) => {
    currentFolder.value = value
  }

  const clearCurrentFolder = () => {
    currentFolder.value = undefined
  }

  const initResourceList = <T extends Resource>(data: { resources: T[]; currentFolder: T }) => {
    resources.value = data.resources
    currentFolder.value = data.currentFolder
  }

  const clearResourceList = () => {
    resources.value = []
    currentFolder.value = undefined
    selectedIds.value = []
  }

  const selectedIds = ref<string[]>([])
  const latestSelectedId = ref<string>(null)

  const selectedResources = computed(() => {
    return unref(resources).filter((f) => unref(selectedIds).includes(f.id))
  })

  const setSelection = (ids: string[]) => {
    const latestSelected = ids.find((id) => !unref(selectedIds).includes(id))

    if (latestSelected) {
      latestSelectedId.value = latestSelected
    }
    selectedIds.value = ids
  }

  const addSelection = (id: string) => {
    latestSelectedId.value = id
    if (!unref(selectedIds).includes(id)) {
      unref(selectedIds).push(id)
    }
  }

  const removeSelection = (id: string) => {
    latestSelectedId.value = id
    if (unref(selectedIds).includes(id)) {
      selectedIds.value = unref(selectedIds).filter((i) => i !== id)
    }
  }

  const toggleSelection = (id: string) => {
    if (unref(selectedIds).includes(id)) {
      removeSelection(id)
    } else {
      addSelection(id)
    }
  }

  const resetSelection = () => {
    selectedIds.value = []
  }

  const setLastSelectedId = (id: string) => {
    latestSelectedId.value = id
  }

  const areHiddenFilesShown = ref(true)
  const areFileExtensionsShown = ref(true)
  const areWebDavDetailsShown = ref(false)

  const setAreHiddenFilesShown = (value: boolean) => {
    areHiddenFilesShown.value = value
    window.localStorage.setItem('oc_hiddenFilesShown', value.toString())
  }
  const setAreFileExtensionsShown = (value: boolean) => {
    areFileExtensionsShown.value = value
    window.localStorage.setItem('oc_fileExtensionsShown', value.toString())
  }
  const setAreWebDavDetailsShown = (value: boolean) => {
    areWebDavDetailsShown.value = value
    window.localStorage.setItem('oc_webDavDetailsShown', value.toString())
  }

  const loadIndicators = (space: SpaceResource, id: string) => {
    const files = unref(resources).filter((f) => [f.id, f.parentFolderId].includes(id))
    for (const resource of files) {
      const indicators = getIndicators({
        space,
        resource,
        ancestorMetaData: unref(ancestorMetaData),
        user: userStore.user
      })
      if (!indicators.length && !resource.indicators.length) {
        continue
      }

      updateResourceField({ id: resource.id, field: 'indicators', value: indicators })
    }
  }

  const setAncestorMetaData = (value: AncestorMetaData) => {
    ancestorMetaData.value = value
  }

  const updateAncestorField = <
    T extends AncestorMetaDataValue,
    K extends keyof AncestorMetaDataValue
  >({
    path,
    field,
    value
  }: {
    path: T['path']
    field: K
    value: T[K]
  }) => {
    const resource = unref(ancestorMetaData)[path] ?? null
    if (resource) {
      resource[field] = value
    }
  }

  const loadAncestorMetaData = async ({
    folder,
    space,
    client
  }: {
    folder: Resource
    space: SpaceResource
    client: WebDAV
  }) => {
    const currentFolderData: AncestorMetaDataValue = {
      id: folder.fileId,
      shareTypes: folder.shareTypes,
      parentFolderId: folder.parentFolderId,
      spaceId: space.id,
      name: folder.name,
      storageId: folder.storageId,
      // gets injected later, we don't know that yet because id-based dav requests return '/' as path
      path: undefined
    }

    let isSpaceRoot = folder.parentFolderId === folder.storageId
    if (isPublicSpaceResource(space)) {
      // space root on public spaces has a 3-part parentFolderId
      const spaceId = folder.storageId.split('$').pop()
      const fullStorageId = `${folder.storageId}!${spaceId}`
      isSpaceRoot = folder.parentFolderId === fullStorageId
    }

    if (isSpaceRoot) {
      currentFolderData.path = '/'
      // folder is space root, meaning there are no other ancestors
      setAncestorMetaData({ ['/']: currentFolderData })
      return
    }

    const data: AncestorMetaDataValue[] = [currentFolderData]

    if (folder.parentFolderId) {
      const cache = Object.values(unref(ancestorMetaData))

      const loadDataForAncestor = async (parentFolderId: string) => {
        const isSpaceRoot = space.id.endsWith(extractNodeId(parentFolderId))

        let resource: Resource
        const cachedResource = cache.find(({ id }) => id === parentFolderId)
        if (cachedResource?.spaceId === space.id) {
          resource = cachedResource
        } else if (isSpaceRoot) {
          // const nodeId = space.id.split('$').pop()
          // resource = { ...space, id: `${space.id}!${nodeId}` }
          resource = space
        } else {
          const response = await client.listFiles(space, { fileId: parentFolderId }, { depth: 0 })
          resource = response.resource
        }

        data.push({
          id: resource.id,
          shareTypes: resource.shareTypes,
          parentFolderId: resource.parentFolderId,
          spaceId: space.id,
          name: resource.name,
          storageId: resource.storageId,
          path: ''
        } as AncestorMetaDataValue)

        if (resource.parentFolderId !== resource.storageId && !isSpaceRoot) {
          return loadDataForAncestor(resource.parentFolderId)
        }
      }

      await loadDataForAncestor(folder.parentFolderId)
    }

    let path = ''
    const dataWithPathInjected = data.reverse().map((d, i) => {
      path = i === 0 ? '/' : urlJoin(path, d.name)
      return { ...d, path }
    })

    const ancestorData: AncestorMetaData = {}
    dataWithPathInjected.forEach((ancestor) => {
      ancestorData[ancestor.path] = ancestor
    })

    setAncestorMetaData(ancestorData)
  }

  return {
    resources,
    currentFolder,
    activeResources,
    totalResourcesCount,
    totalResourcesSize,

    setResources,
    removeResources,
    clearResources,
    upsertResource,
    upsertResources,
    updateResourceField,

    setCurrentFolder,
    clearCurrentFolder,

    initResourceList,
    clearResourceList,

    selectedIds,
    latestSelectedId,
    selectedResources,
    setSelection,
    addSelection,
    removeSelection,
    toggleSelection,
    resetSelection,
    setLastSelectedId,

    areHiddenFilesShown,
    areFileExtensionsShown,
    areWebDavDetailsShown,
    setAreHiddenFilesShown,
    setAreFileExtensionsShown,
    setAreWebDavDetailsShown,

    loadIndicators,

    ancestorMetaData,
    setAncestorMetaData,
    updateAncestorField,
    loadAncestorMetaData
  }
})

export type ResourcesStore = ReturnType<typeof useResourcesStore>
