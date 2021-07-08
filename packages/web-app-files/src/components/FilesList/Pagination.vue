<template>
  <oc-pagination
    v-if="pages > 1"
    :pages="pages"
    :current-page="currentPage"
    :max-displayed="3"
    :current-route="$route"
    class="files-pagination uk-flex uk-flex-center oc-my-s"
  />
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState('Files', ['currentPage']),
    ...mapGetters('Files', ['pages'])
  }
}
</script>
