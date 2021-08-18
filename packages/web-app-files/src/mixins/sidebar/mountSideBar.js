import { mapMutations, mapActions } from 'vuex'

export default {
  methods: {
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACTIVE_PANEL']),
    ...mapActions('Files/sidebar', { openSidebar: 'open'}),
    
    $_mountSideBar_showDefaultPanel() {
      this.openSidebar()
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(null)
    }
  }
}
