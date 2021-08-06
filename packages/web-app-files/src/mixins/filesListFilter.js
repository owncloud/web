import { Registry } from '../services'
import { mapMutations, mapGetters } from 'vuex'

export default {
  mounted() {
    const { filterSearch } = Registry

    if (!filterSearch || !filterSearch.available) {
      return
    }

    filterSearch.on('reset', () => {
      this.CLEAR_FILES_SEARCHED()
    })
    filterSearch.on('updateTerm', term => {
      if (!term) {
        this.CLEAR_FILES_SEARCHED()
      }
    })
    filterSearch.on('activate', ({ resources }) => {
      this.LOAD_FILES_SEARCHED(resources)
    })
  },
  watch: {
    $route: {
      handler: function(to, from) {
        if (to.name === from?.name && to.params?.item === from?.params?.item) {
          return
        }

        this.CLEAR_FILES_SEARCHED()
      },
      immediate: true
    },
    pages() {
      if (!this.$route.params.page) {
        return
      }

      if (this.$route.params.page <= this.pages) {
        return
      }

      this.$router.push({
        name: this.$route.name,
        query: this.$route.query,
        params: { ...this.$route.params, page: this.pages }
      })
    }
  },
  methods: {
    ...mapMutations('Files', ['CLEAR_FILES_SEARCHED', 'LOAD_FILES_SEARCHED'])
  },
  computed: {
    ...mapGetters('Files', ['pages'])
  }
}
