import { nextTick, computed, unref, Ref } from 'vue'
import { folderService } from '../../services/folder'
import { fileList } from '../../helpers/ui'
import { usePagination, useSort, SortDir, SortField, useRouteName } from '@ownclouders/web-pkg'
import { useSideBar } from '@ownclouders/web-pkg'

import {
  queryItemAsString,
  useMutationSubscription,
  useRouteQuery,
  useStore
} from '@ownclouders/web-pkg'
import { determineSortFields as determineResourceTableSortFields } from '@ownclouders/web-pkg'
import { determineSortFields as determineResourceTilesSortFields } from '../../helpers/ui/resourceTiles'
import { Task } from 'vue-concurrency'
import { Resource } from '@ownclouders/web-client'
import { useSelectedResources, SelectedResourcesResult } from '@ownclouders/web-pkg'
import { ReadOnlyRef } from '@ownclouders/web-pkg'
import {
  useFileListHeaderPosition,
  useViewMode,
  useViewSize,
  ViewModeConstants
} from '@ownclouders/web-pkg'

import { ScrollToResult, useScrollTo } from '@ownclouders/web-pkg'

interface ResourcesViewDefaultsOptions<T, U extends any[]> {
  loadResourcesTask?: Task<T, U>
}

type ResourcesViewDefaultsResult<T, TT, TU extends any[]> = {
  fileListHeaderY: Ref<any>
  refreshFileListHeaderPosition(): void
  loadResourcesTask: Task<TT, TU>
  areResourcesLoading: ReadOnlyRef<boolean>
  storeItems: ReadOnlyRef<T[]>
  sortFields: ReadOnlyRef<SortField[]>
  paginatedResources: Ref<T[]>
  paginationPages: ReadOnlyRef<number>
  paginationPage: ReadOnlyRef<number>
  handleSort({ sortBy, sortDir }: { sortBy: string; sortDir: SortDir }): void
  sortBy: ReadOnlyRef<string>
  sortDir: ReadOnlyRef<SortDir>
  viewMode: ReadOnlyRef<string>
  viewSize: ReadOnlyRef<number>
  selectedResources: Ref<Resource[]>
  selectedResourcesIds: Ref<(string | number)[]>
  isResourceInSelection(resource: Resource): boolean

  isSideBarOpen: Ref<boolean>
  sideBarActivePanel: Ref<string>
} & SelectedResourcesResult &
  ScrollToResult

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

  const currentRoute = useRouteName()
  const currentViewModeQuery = useRouteQuery(
    `${unref(currentRoute)}-view-mode`,
    ViewModeConstants.defaultModeName
  )
  const currentViewMode = computed((): string => queryItemAsString(currentViewModeQuery.value))
  const viewMode = useViewMode(currentViewMode)

  const currentTilesSizeQuery = useRouteQuery('tiles-size', '1')
  const currentTilesSize = computed((): string => String(currentTilesSizeQuery.value))
  const viewSize = useViewSize(currentTilesSize)

  const sortFields = computed((): SortField[] => {
    if (unref(viewMode) === ViewModeConstants.tilesView.name) {
      return determineResourceTilesSortFields(unref(storeItems)[0])
    }
    return determineResourceTableSortFields(unref(storeItems)[0])
  })

  const { sortBy, sortDir, items, handleSort } = useSort({ items: storeItems, fields: sortFields })
  const {
    items: paginatedResources,
    total: paginationPages,
    page: paginationPage
  } = usePagination({ items, perPageStoragePrefix: 'files' })

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
    sortFields,
    viewMode,
    viewSize,
    paginatedResources,
    paginationPages,
    paginationPage,
    handleSort,
    sortBy,
    sortDir,
    ...useSelectedResources({ store }),
    ...useSideBar(),
    ...useScrollTo()
  }
}
