export default {
  methods: {
    scrollToResource(resource) {
      const resourceElement = document.querySelectorAll(`[data-item-id='${resource.id}']`)[0]
      resourceElement.scrollIntoView({ block: 'end' })
    }
  }
}
