import { computed, unref } from 'vue'
import { Resource } from 'web-client/src'
import { eventBus, useStore } from 'web-pkg/src'
import { queryItemAsString } from 'web-pkg/src/composables/appDefaults'
import { useRouteQuery } from 'web-pkg/src/composables'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export interface ScrollToResult {
  scrollToResource(resource: Resource): void
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

  const scrollToResource = (resource) => {
    const resourceElement = document.querySelectorAll(
      `[data-item-id='${resource.id}']`
    )[0] as HTMLElement

    if (!resourceElement) {
      return
    }

    // bottom reached
    if (resourceElement.getBoundingClientRect().bottom > window.innerHeight) {
      resourceElement.scrollIntoView(false)
      return
    }

    const topbarElement = document.getElementsByClassName('files-topbar')[0] as HTMLElement
    // topbar height + th height + height of one row = offset needed when scrolling top
    const topOffset = topbarElement.offsetHeight + resourceElement.offsetHeight * 2

    // top reached
    if (resourceElement.getBoundingClientRect().top < topOffset) {
      const fileListWrapperElement = document.getElementsByClassName('files-view-wrapper')[0]
      fileListWrapperElement.scrollBy(0, -resourceElement.offsetHeight)
    }
  }

  const scrollToResourceFromRoute = (resources: Resource[]) => {
    if (!unref(scrollTo) || !resources.length) {
      return
    }

    const resource = unref(resources).find((r) => r.id === unref(scrollTo))
    if (resource) {
      store.commit('Files/SET_FILE_SELECTION', [resource])
      scrollToResource(resource)

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
