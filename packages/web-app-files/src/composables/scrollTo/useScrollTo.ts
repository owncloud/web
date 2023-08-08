import { computed, unref } from 'vue'
import { Resource } from 'web-client/src'
import { queryItemAsString } from 'web-pkg/src/composables/appDefaults/useAppNavigation'
import { useStore } from 'web-pkg/src/composables/store/useStore'
import { eventBus } from 'web-pkg/src/services'
import { useRouteQuery } from 'web-pkg/src/composables'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import {
  SortField,
  useRouteName,
  useRouter,
  useSort,
  useViewMode,
  ViewModeConstants
} from 'web-pkg/src/composables'
import { determineSortFields as determineResourceTilesSortFields } from 'web-app-files/src/helpers/ui/resourceTiles'
import { determineSortFields as determineResourceTableSortFields } from 'web-app-files/src/helpers/ui/resourceTable'
import { useRoute } from 'vue-router'
import { findIndex } from 'lodash-es'

export interface ScrollToResult {
  scrollToResource(resourceId: Resource['id'], options?: { forceScroll?: boolean }): void
  scrollToResourceFromRoute(resources: Resource[]): void
}

export const useScrollTo = (): ScrollToResult => {
  const store = useStore()
  const scrollToQuery = useRouteQuery('scrollTo')
  const detailsQuery = useRouteQuery('details')
  const scrollTo = computed(() => {
    return queryItemAsString(unref(scrollToQuery))
  })
  const details = computed(() => {
    return queryItemAsString(unref(detailsQuery))
  })

  const router = useRouter()
  const route = useRoute()
  const files = computed((): Array<Resource> => store.getters['Files/files'])
  const currentRoute = useRouteName()
  const itemsPerPageQuery = useRouteQuery('items-per-page', '1')
  const pageQuery = useRouteQuery('page', '1')
  const currentViewModeQuery = useRouteQuery(
    `${unref(currentRoute)}-view-mode`,
    ViewModeConstants.defaultModeName
  )

  const currentViewMode = computed((): string => queryItemAsString(currentViewModeQuery.value))
  const viewMode = useViewMode(currentViewMode)
  const sortFields = computed((): SortField[] => {
    if (unref(viewMode) === ViewModeConstants.tilesView.name) {
      return determineResourceTilesSortFields(unref(files)[0])
    }
    return determineResourceTableSortFields(unref(files)[0])
  })
  const { items: sortedItems } = useSort({ items: files, fields: sortFields })

  const scrollToResource = async (resourceId: Resource['id'], options = { forceScroll: false }) => {
    if (unref(sortedItems)) {
      const index = findIndex(unref(sortedItems), (item: Resource) => item.id === resourceId)
      if (index >= 0) {
        const page = Math.ceil((index + 1) / Number(unref(itemsPerPageQuery)))
        if (page !== Number(unref(pageQuery))) {
          await router.push({ ...unref(route), query: { ...unref(route).query, page } })
        }
      }
    }

    const resourceElement = document.querySelectorAll(
      `[data-item-id='${resourceId}']`
    )[0] as HTMLElement

    if (!resourceElement) {
      return
    }

    const topbarElement = document.getElementById('files-app-bar')
    // topbar height + th height + height of one row = offset needed when scrolling top
    const topOffset = topbarElement.offsetHeight + resourceElement.offsetHeight * 2

    if (
      resourceElement.getBoundingClientRect().bottom > window.innerHeight ||
      resourceElement.getBoundingClientRect().top < topOffset ||
      options.forceScroll
    ) {
      resourceElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const scrollToResourceFromRoute = (resources: Resource[]) => {
    if (!unref(scrollTo) || !resources.length) {
      return
    }

    const resource = unref(resources).find((r) => r.id === unref(scrollTo))
    if (resource) {
      store.commit('Files/SET_FILE_SELECTION', [resource])
      scrollToResource(resource.id, { forceScroll: true })

      if (unref(details)) {
        eventBus.publish(SideBarEventTopics.openWithPanel, unref(details))
      }
    }
  }

  return {
    scrollToResource,
    scrollToResourceFromRoute
  }
}
