import { Resource } from 'web-client/src'

export interface ScrollToResult {
  scrollToResource(resourceId: Resource['id'], options?: { forceScroll?: boolean }): void
}

export const useScrollTo = (): ScrollToResult => {
  const scrollToResource = (resourceId: string, options = { forceScroll: false }) => {
    const resourceElement = document.querySelectorAll(
      `[data-item-id='${resourceId}']`
    )[0] as HTMLElement

    if (!resourceElement) {
      return
    }

    const topbarElement = document.getElementById('admin-settings-app-bar')
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

  return {
    scrollToResource
  }
}
