<template>
  <oc-pagination
    v-if="pages > 1"
    :pages="pages"
    :current-page="currentPage"
    :max-displayed="3"
    :current-route="$route"
    class="files-pagination oc-flex oc-flex-center oc-my-s"
  />
</template>

<script>
export default {
  props: {
    pages: {
      type: Number,
      required: true
    },
    currentPage: {
      type: Number,
      required: true
    }
  }
}
</script>
