<template>
  <oc-pagination
    v-if="pages > 1"
    :pages="pages"
    :current-page="currentPage"
    :max-displayed="3"
    :current-route="$_filesListPagination_targetRoute"
    class="files-pagination uk-flex uk-flex-center oc-my-s"
  />
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import MixinFilesListPagination from '../../mixins/filesListPagination'

export default {
  mixins: [MixinFilesListPagination],

  computed: {
    ...mapState('Files', ['currentPage']),
    ...mapGetters('Files', ['pages'])
  },

  watch: {
    $route: {
      handler: '$_filesListPagination_updateCurrentPage',
      immediate: true
    }
  }
}
</script>
