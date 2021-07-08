<template>
  <oc-pagination
    v-if="pages > 1"
    :pages="pages"
    :current-page="currentPage"
    :max-displayed="3"
    :current-route="targetRoute"
    class="files-pagination uk-flex uk-flex-center oc-my-s"
  />
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState('Files', ['currentPage']),
    ...mapGetters('Files', ['pages']),

    targetRoute() {
      return { name: this.$route.name, query: this.$route.query, params: this.$route.params }
    }
  }
}
</script>
