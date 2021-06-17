import { mapMutations } from 'vuex'

export default {
  computed: {
    $_filesListPagination_targetRoute() {
      return { name: this.$route.name, query: this.$route.query, params: this.$route.params }
    }
  },

  methods: {
    ...mapMutations('Files', ['UPDATE_CURRENT_PAGE']),

    $_filesListPagination_updateCurrentPage() {
      const page = this.$route.params.page || 1

      this.UPDATE_CURRENT_PAGE(page)
    }
  }
}
