import { mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  computed: mapGetters('Files', ['highlightedFile']),
  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACTIVE_PANEL']),
    $_destroySideBar_hideDetails() {
      if (this.highlightedFile !== null) {
        this.setHighlightedFile(null)
      }
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(null)
    }
  }
}
