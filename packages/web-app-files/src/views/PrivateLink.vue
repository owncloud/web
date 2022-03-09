<template>
  <div class="oc-height-1-1 oc-link-resolve">
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-card oc-border oc-rounded oc-position-center oc-text-center oc-width-large">
      <template v-if="loading">
        <div class="oc-card-header">
          <h2 key="private-link-loading">
            <translate>Resolving private link…</translate>
          </h2>
        </div>
        <div class="oc-card-body">
          <oc-spinner :aria-hidden="true" />
        </div>
      </template>
      <template v-else-if="errorMessage">
        <div class="oc-card-header oc-link-resolve-error-title">
          <h2 key="private-link-error">
            <translate>An error occurred while resolving the private link</translate>
          </h2>
        </div>
        <div class="oc-card-body oc-link-resolve-error-message">
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
import path from 'path'
import { mapGetters } from 'vuex'
import { buildResource, buildWebDavFilesPath } from '../helpers/resources'
import { createLocationSpaces } from '../router'
import { DavProperties } from 'web-pkg/src/constants'

export default {
  data() {
    return {
      loading: true,
      errorMessage: null
    }
  },
  computed: {
    ...mapGetters(['configuration', 'user']),

    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    }
  },
  async mounted() {
    // query server to translate fileId to real path
    this.loading = true
    try {
      let resourcePath = await this.$client.files.getPathForFileId(this.$route.params.fileId)
      resourcePath = buildWebDavFilesPath(this.user.id, resourcePath)
      let resource = await this.$client.files.fileInfo(resourcePath, DavProperties.Default)
      resource = buildResource(resource)

      const params = {}
      const query = {}
      if (resource.isFolder) {
        // if folder: route directly into it
        params.item = resource.path || ''
      } else {
        // if file: route into parent and highlight file
        params.item = path.dirname(resource.path)
        query.scrollTo = resource.name
      }
      this.$router.push(
        createLocationSpaces('files-spaces-personal-home', {
          params,
          query
        })
      )
    } catch (error) {
      console.error(error)
      this.errorMessage = error
    } finally {
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
.oc-link-resolve {
  .oc-card-header h2,
  .oc-card-footer p {
    margin: 0;
  }
}
</style>
