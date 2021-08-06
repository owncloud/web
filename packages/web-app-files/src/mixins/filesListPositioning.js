export default {
  data: () => ({
    headerPosition: 0
  }),
  methods: {
    adjustTableHeaderPosition() {
      this.$nextTick(() => {
        const appBar = document.querySelector('#files-app-bar')

        if (!appBar) {
          this.headerPosition = 0
          return
        }

        this.headerPosition = appBar.getBoundingClientRect().height
      })
    }
  }
}
