import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('Files/sidebar', { openSidebar: 'open' }),

    $_mountSideBar_showDefaultPanel() {
      this.openSidebar()
    }
  }
}
