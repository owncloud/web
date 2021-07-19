import { mapActions, mapMutations } from 'vuex'

export default {
  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACTIVE_PANEL']),
    $_destroySideBar_hideDetails() {
      this.setHighlightedFile(null)
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(null)
    }
  }
}
