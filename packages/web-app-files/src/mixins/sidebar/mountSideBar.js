import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    $_mountSideBar_showDetails(resource) {
      this.setHighlightedFile(resource)
    }
  }
}
