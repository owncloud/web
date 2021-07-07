import { mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapState('Files', ['filesPageLimit']),

    $_filesListPagination_targetRoute() {
      return { name: this.$route.name, query: this.$route.query, params: this.$route.params }
    },

    $_filesListPagination_pageItemsLimit: {
      get() {
        return this.filesPageLimit
      },

      set(value) {
        this.SET_FILES_PAGE_LIMIT(value)
        this.$_filesListPagination_updateQuery(value)
      }
    }
  },

  watch: {
    $route: {
      handler(route) {
        if (Object.prototype.hasOwnProperty.call(route.query, 'items-limit')) {
          this.SET_FILES_PAGE_LIMIT(route.query['items-limit'])

          return
        }

        this.$_filesListPagination_updateQuery()
      },
      immediate: true
    }
  },

  methods: {
    ...mapMutations('Files', ['UPDATE_CURRENT_PAGE', 'SET_FILES_PAGE_LIMIT']),

    $_filesListPagination_updateCurrentPage() {
      const page = this.$route.params.page || 1

      this.UPDATE_CURRENT_PAGE(page)
    },

    $_filesListPagination_updateQuery(limit = this.$_filesListPagination_pageItemsLimit) {
      const query = { ...this.$route.query, 'items-limit': limit }

      this.SET_FILES_PAGE_LIMIT(limit)
      this.$router.replace({ query }).catch(() => {})
    }
  }
}
