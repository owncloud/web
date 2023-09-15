import { computed, unref } from 'vue'
import { Resource } from 'web-client/src'
import { queryItemAsString } from 'web-pkg/src/composables/appDefaults/useAppNavigation'
import { useStore } from 'web-pkg/src/composables/store/useStore'
import { eventBus } from 'web-pkg/src/services'
import { useRouteQuery } from 'web-pkg/src/composables'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export interface ScrollToResult {
  scrollToResource(
    resourceId: Resource['id'],
    options?: { forceScroll?: boolean; topbarElement: string }
  ): void
  scrollToResourceFromRoute(resources: Resource[], topbarElement: string): void
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

  const scrollToResource = (
    resourceId: Resource['id'],
    options = { forceScroll: false, topbarElement: null }
  ) => {
    const resourceElement = document.querySelectorAll(
      `[data-item-id='${resourceId}']`
    )[0] as HTMLElement

    if (!resourceElement) {
      return
    }

    // files-app-bar, admin-settings-app-bar
    const topbarElement = document.getElementById(options.topbarElement)
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

  const scrollToResourceFromRoute = (resources: Resource[], topbarElement: null) => {
    if (!unref(scrollTo) || !resources.length) {
      return
    }

    const resource = unref(resources).find((r) => r.id === unref(scrollTo))
    if (resource && resource.processing !== true) {
      store.commit('Files/SET_FILE_SELECTION', [resource])
      scrollToResource(resource.id, { forceScroll: true, topbarElement })

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
