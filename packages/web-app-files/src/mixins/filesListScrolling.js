export default {
  methods: {
    scrollToResource(resource) {
      const appBar = document.querySelector('#files-app-bar')
      let offset = appBar.getBoundingClientRect().bottom

      const tableHeader = document.querySelector('.files-table thead')
      offset += tableHeader.getBoundingClientRect().height

      this.$scrollTo(`.oc-tbody-tr-${resource.id}`, 300, { offset: -offset })
    }
  }
}
