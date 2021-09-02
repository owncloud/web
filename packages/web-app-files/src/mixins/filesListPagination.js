import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations('Files/pagination', ['UPDATE_CURRENT_PAGE']),

    $_filesListPagination_updateCurrentPage() {
      const page = this.$route.query.page || 1

      this.UPDATE_CURRENT_PAGE(page)
    }
  }
}
