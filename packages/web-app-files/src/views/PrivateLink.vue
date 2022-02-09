<template>
  <div class="oc-height-1-1">
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-card oc-border oc-rounded oc-position-center oc-text-center oc-width-large">
      <template v-if="loading">
        <div class="oc-card-header">
          <h2>
            <translate>Resolving private link…</translate>
          </h2>
        </div>
        <div class="oc-card-body">
          <oc-spinner :aria-hidden="true" />
        </div>
      </template>
      <template v-else-if="errorMessage">
        <div class="oc-card-header">
          <h2>
            <translate>An error occurred while resolving the private link</translate>
          </h2>
        </div>
        <div class="oc-card-body oc-link-resolve-error">
          <p class="oc-text-lead">{{ errorMessage }}</p>
        </div>
      </template>
      <div class="oc-card-footer">
        <p>
          {{ configuration.currentTheme.general.slogan }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { createLocationSpaces } from '../router'

export default {
  data() {
    return {
      loading: true,
      errorMessage: null
    }
  },
  computed: {
    ...mapGetters(['configuration']),

    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    }
  },
  mounted() {
    // query oc10 server to translate fileId to real path
    this.loading = true
    this.$client.files
      .getPathForFileId(this.$route.params.fileId)
      .then((path) => {
        const lastSlash = path.lastIndexOf('/')
        const folder = path.substring(0, lastSlash).replace(/^(\/)/, '')
        const file = path.substring(lastSlash + 1)
        this.$router.push(
          createLocationSpaces('files-spaces-personal-home', {
            params: {
              item: folder || '/'
            },
            query: {
              scrollTo: file
            }
          })
        )
      })
      .catch((error) => {
        this.errorMessage = error
      })
      .finally(() => {
        this.loading = false
      })
  }
}
</script>

<style lang="scss">
.oc-card-header h2,
.oc-card-footer p {
  margin: 0;
}
</style>
