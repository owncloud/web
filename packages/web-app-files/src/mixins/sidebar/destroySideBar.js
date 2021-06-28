import { mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    $_destroySideBar_hideDetails() {
      this.setHighlightedFile(null)
    }
  }
}
