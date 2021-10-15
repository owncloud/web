import { bus } from 'web-pkg/src/instance'
import { Registry } from '../services'
import { mapMutations, mapGetters } from 'vuex'

export default {
  mounted() {
    const { filterSearch } = Registry

    if (!filterSearch || !filterSearch.available) {
      return
    }

    const resetEventToken = filterSearch.subscribe('reset', () => {
      this.CLEAR_FILES_SEARCHED()
    })

    const updateTermEventToken = filterSearch.subscribe('updateTerm', (term) => {
      if (!term) {
        this.CLEAR_FILES_SEARCHED()
      }
    })

    const activateEventToken = filterSearch.subscribe('activate', ({ resources }) => {
      this.LOAD_FILES_SEARCHED(resources)
    })

    this.$on('beforeDestroy', () => {
      filterSearch.unsubscribe('reset', resetEventToken)
      filterSearch.unsubscribe('updateTerm', updateTermEventToken)
      filterSearch.unsubscribe('activate', activateEventToken)
    })
  },
  watch: {
    $route: {
      handler: function (to, from) {
        if (to.name === from?.name && to.params?.item === from?.params?.item) {
          return
        }

        this.CLEAR_FILES_SEARCHED()
      },
      immediate: true
    },
    pages() {
      if (!this.$route.query.page) {
        return
      }

      if (this.$route.query.page <= this.pages) {
        return
      }

      this.$router.push({
        name: this.$route.name,
        query: { ...this.$route.query, page: this.pages },
        params: this.$route.params
      })
    }
  },
  methods: {
    ...mapMutations('Files', ['CLEAR_FILES_SEARCHED', 'LOAD_FILES_SEARCHED'])
  },
  computed: {
    ...mapGetters('Files/pagination', ['pages'])
  }
}
