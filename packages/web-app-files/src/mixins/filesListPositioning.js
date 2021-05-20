export default {
  data: () => ({
    headerPosition: 0
  }),
  methods: {
    adjustTableHeaderPosition() {
      this.$nextTick(() => {
        const appBar = document.querySelector('#files-app-bar')
        this.headerPosition = appBar.getBoundingClientRect().height
      })
    }
  }
}
