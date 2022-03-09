import { nextTick, computed, unref, readonly } from '@vue/composition-api'
import { MaybeReadonlyRef, MaybeRef } from 'web-pkg/src/utils'
import { folderService } from '../../services/folder'
import { fileList } from '../../helpers/ui'
import { usePagination, useFileListHeaderPosition, SortField } from '../'
import { useSort } from '../sort/'

import { useMutationSubscription, useRouteQuery, useStore } from 'web-pkg/src/composables'
import { determineSortFields } from '../../helpers/ui/resourceTable'
import { Resource } from '../../helpers/resource'

interface ResourcesViewDefaultsOptions {
  loadResourcesTask?()
}

export const useResourcesViewDefaults = (options: ResourcesViewDefaultsOptions = {}): any => {
  const loadResourcesTask = options.loadResourcesTask || folderService.getTask()

  const store = useStore()
  const { refresh: refreshFileListHeaderPosition, y: fileListHeaderY } = useFileListHeaderPosition()

  const storeItems: MaybeReadonlyRef<Resource[]> = computed(
    (): Resource[] => store.getters['Files/activeFiles'] || []
  )
  const fields: MaybeRef<SortField[]> = computed((): SortField[] => {
    return determineSortFields(unref(storeItems)[0])
  })

  const { sortBy, sortDir, items, handleSort } = useSort<Resource>({
    items: storeItems,
    fields
  })

  const paginationPageQuery = useRouteQuery('page', '1')
  const paginationPage = computed(() => parseInt(String(paginationPageQuery.value)))
  const { items: paginatedResources, total: paginationPages } = usePagination({
    page: paginationPage,
    items
  })

  useMutationSubscription(['Files/UPSERT_RESOURCE'], async ({ payload }) => {
    await nextTick()
    fileList.accentuateItem(payload.id)
  })

  return {
    fileListHeaderY,
    refreshFileListHeaderPosition,
    loadResourcesTask,
    storeItems,
    fields,
    paginatedResources,
    paginationPages,
    paginationPage,
    handleSort,
    sortBy,
    sortDir
  }
}
