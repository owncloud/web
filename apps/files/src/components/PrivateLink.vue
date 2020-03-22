<template>
  <div class="oc-login" uk-height-viewport>
    <div class="oc-login-card uk-position-center">
      <h1 v-translate class="oc-login-logo">
        ownCloud
      </h1>
      <div v-if="loading" class="oc-login-card-body">
        <h3 class="oc-login-card-title" :aria-hidden="true">{{ $_resolvingPrivateLinkTitle }}</h3>
        <oc-spinner :aria-label="$_resolvingPrivateLinkTitle"></oc-spinner>
      </div>
      <div v-if="errorMessage" class="oc-login-card-body">
        <h3 class="oc-login-card-title">
          <translate>An error occurred while resolving the private link</translate>
        </h3>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      errorMessage: null
    }
  },
  computed: {
    $_resolvingPrivateLinkTitle() {
      return this.$gettext('Resolving private link…')
    }
  },
  mounted() {
    // query oc10 server to translate fileId to real path
    this.loading = true
    this.$client.files
      .getPathForFileId(this.$route.params.fileId)
      .then(path => {
        const lastSlash = path.lastIndexOf('/')
        const folder = path.substring(0, lastSlash).replace(/^(\/)/, '')
        const file = path.substring(lastSlash + 1)
        this.$router.push({
          name: 'files-list',
          params: {
            item: folder
          },
          query: {
            scrollTo: file
          }
        })
      })
      .catch(error => {
        this.errorMessage = error
      })
      .finally(() => {
        this.loading = false
      })
  }
}
</script>
