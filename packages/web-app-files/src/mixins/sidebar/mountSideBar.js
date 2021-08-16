import { mapMutations } from 'vuex'
import { bus } from 'web-pkg/src/instance'

export default {
  methods: {
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACTIVE_PANEL']),
    $_mountSideBar_showDefaultPanel() {
      bus.emit('app.files.sidebar.show')
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(null)
    }
  }
}
