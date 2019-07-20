<template>
  <div class="oc-login" uk-height-viewport>
    <div class="oc-login-card uk-position-center">
      <h1 class="oc-login-logo" v-translate>
        ownCloud
      </h1>
      <div class="oc-login-card-body" v-if="loading">
        <h3 class="oc-login-card-title"><translate>Resolving private link…</translate></h3>
        <oc-spinner></oc-spinner>
      </div>
      <div class="oc-login-card-body" v-if="errorMessage">
        <h3 class="oc-login-card-title"><translate>An error occurred while resolving the private link</translate></h3>
        <span>{{ errorMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: true,
      errorMessage: null
    }
  },
  mounted () {
    // query oc10 server to translate fileId to real path
    this.loading = true
    this.$client.files.getPathForFileId(this.$route.params.fileId).then(path => {
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
    }).catch(error => {
      this.errorMessage = error
    }).finally(() => {
      this.loading = false
    })
  }

}
</script>
