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
      this.$router.push({
        'name': 'files-list',
        'params': {
          'item': encodeURIComponent(path)
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
