export default {
  methods: {
    scrollToResource(resource) {
      const resourceElement = document.querySelectorAll(`[data-item-id='${resource.id}']`)[0]

      // bottom reached
      if (resourceElement.getBoundingClientRect().bottom > window.innerHeight) {
        resourceElement.scrollIntoView(false)
        return
      }

      const topbarElement = document.getElementsByClassName('files-topbar')[0]
      // topbar height + th height + height of one row = offset needed when scrolling top
      const topOffset = topbarElement.offsetHeight + resourceElement.offsetHeight * 2

      // top reached
      if (resourceElement.getBoundingClientRect().top < topOffset) {
        const fileListWrapperElement = document.getElementsByClassName('files-view-wrapper')[0]
        fileListWrapperElement.scrollBy(0, -resourceElement.offsetHeight)
      }
    }
  }
}
