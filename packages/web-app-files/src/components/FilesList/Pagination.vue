<template>
  <div class="files-pagination-container">
    <!-- Empty block to center the pagination -->
    <div class="files-pagination-empty" />
    <oc-pagination
      v-if="pages > 1"
      :pages="pages"
      :current-page="currentPage"
      :max-displayed="3"
      :current-route="$_filesListPagination_targetRoute"
      class="files-pagination uk-flex uk-flex-center oc-my-s"
    />
    <oc-page-size
      v-model="$_filesListPagination_pageItemsLimit"
      data-testid="files-pagination-size"
      :label="$gettext('Items per page')"
      :options="[100, 500, 1000, $gettext('All')]"
      class="files-pagination-size"
    />
  </div>
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

<style lang="scss" scoped>
.files-pagination {
  justify-self: center;

  &-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  &-size {
    display: inline-flex;
    justify-self: end;
  }
}
</style>
