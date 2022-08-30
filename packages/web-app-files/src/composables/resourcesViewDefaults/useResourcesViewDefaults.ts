import {
  nextTick,
  computed,
  unref,
  Ref,
  ComputedRef,
  WritableComputedRef
} from '@vue/composition-api'
import { folderService } from '../../services/folder'
import { fileList } from '../../helpers/ui'
import { usePagination, useFileListHeaderPosition, SortField } from '../'
import { useSort, SortDir } from '../sort/'
import { useSideBar } from '../sidebar'

import { useMutationSubscription, useRouteQuery, useStore } from 'web-pkg/src/composables'
import { determineSortFields } from '../../helpers/ui/resourceTable'
import { Task } from 'vue-concurrency'
import { Resource } from 'web-client'
import { useSelectedResources } from '../selection'

interface ResourcesViewDefaultsOptions<T, U extends any[]> {
  loadResourcesTask?: Task<T, U>
}

interface ResourcesViewDefaultsResult<T, TT, TU extends any[]> {
  fileListHeaderY: Ref<any>
  refreshFileListHeaderPosition(): void
  loadResourcesTask: Task<TT, TU>
  areResourcesLoading: ComputedRef<boolean>
  storeItems: ComputedRef<T[]>
  fields: ComputedRef<SortField[]>
  paginatedResources: ComputedRef<T[]>
  paginationPages: ComputedRef<number>
  paginationPage: ComputedRef<number>
  handleSort({ sortBy, sortDir }: { sortBy: string; sortDir: SortDir }): void
  sortBy: ComputedRef<string>
  sortDir: ComputedRef<SortDir>

  selectedResources: WritableComputedRef<Resource[]>
  selectedResourcesIds: WritableComputedRef<(string | number)[]>
  isResourceInSelection(resource: Resource): boolean

  sideBarOpen: Ref<boolean>
  sideBarActivePanel: Ref<string>
}

export const useResourcesViewDefaults = <T, TT, TU extends any[]>(
  options: ResourcesViewDefaultsOptions<TT, TU> = {}
): ResourcesViewDefaultsResult<T, TT, TU> => {
  const loadResourcesTask = options.loadResourcesTask || folderService.getTask()
  const areResourcesLoading = computed(() => {
    return loadResourcesTask.isRunning || !loadResourcesTask.last
  })

  const store = useStore()
  const { refresh: refreshFileListHeaderPosition, y: fileListHeaderY } = useFileListHeaderPosition()

  const storeItems = computed((): T[] => store.getters['Files/activeFiles'] || [])
  const fields = computed((): SortField[] => {
    return determineSortFields(unref(storeItems)[0])
  })

  const { sortBy, sortDir, items, handleSort } = useSort<T>({
    items: storeItems,
    fields
  })

  const paginationPageQuery = useRouteQuery('page', '1')
  const paginationPage = computed((): number => parseInt(String(paginationPageQuery.value)))
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
    areResourcesLoading,
    storeItems,
    fields,
    paginatedResources,
    paginationPages,
    paginationPage,
    handleSort,
    sortBy,
    sortDir,
    ...useSelectedResources({ store }),
    ...useSideBar()
  }
}
