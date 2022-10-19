import { Registry } from '../services'
import { mapMutations } from 'vuex'
import { onBeforeUnmount } from 'vue'

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

    onBeforeUnmount(() => {
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
    }
  },
  methods: {
    ...mapMutations('Files', ['CLEAR_FILES_SEARCHED', 'LOAD_FILES_SEARCHED'])
  }
}
