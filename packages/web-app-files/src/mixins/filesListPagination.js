import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations('Files', ['UPDATE_CURRENT_PAGE']),

    $_filesListPagination_updateCurrentPage() {
      const page = this.$route.params.page || 1

      this.UPDATE_CURRENT_PAGE(page)
    }
  }
}
