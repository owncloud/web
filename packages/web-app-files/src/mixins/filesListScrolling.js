export default {
  methods: {
    scrollToResource(resource) {
      const resourceElement = document.querySelectorAll(`[data-item-id='${resource.id}']`)[0]

      // scroll to the middle of page
      resourceElement.scrollIntoView({ block: 'center' })
    }
  }
}
