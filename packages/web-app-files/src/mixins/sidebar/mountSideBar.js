import { mapActions, mapMutations } from 'vuex'

export default {
  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACTIVE_PANEL']),
    $_mountSideBar_showDetails(resource) {
      this.setHighlightedFile(resource)
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(null)
    }
  }
}
