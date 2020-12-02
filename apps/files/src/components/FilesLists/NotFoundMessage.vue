<template>
  <div class="uk-text-center">
    <oc-icon :url="iconPath" type="div" size="xxlarge" variation="system" />
    <div class="uk-text-muted uk-text-large">
      <translate>Resource not found</translate>
    </div>
    <div class="uk-text-muted">
      <translate>
        We went looking everywhere, but were unable to find the selected resource.
      </translate>
    </div>
    <div class="oc-mt-s">
      <oc-button v-if="showHomeButton" type="router-link" variation="raw" :to="homeRoute">
        <translate>Go to »All files«</translate>
      </oc-button>
      <oc-button
        v-if="showPublicLinkButton"
        type="router-link"
        variation="raw"
        :to="publicLinkRoute"
      >
        <translate>Reload public link</translate>
      </oc-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import MixinRoutes from '../../mixins/routes'

export default {
  name: 'NotFoundMessage',
  mixins: [MixinRoutes],
  computed: {
    ...mapGetters(['homeFolder', 'configuration']),
    showHomeButton() {
      return this.isListRoute
    },

    homeRoute() {
      return {
        name: 'files-list',
        params: {
          item: this.homeFolder
        }
      }
    },

    showPublicLinkButton() {
      return this.isPublicFilesRoute
    },

    publicLinkRoute() {
      const item = this.$route.params.item
      return {
        name: 'public-files',
        params: {
          item: item.split('/')[1]
        }
      }
    },

    iconPath() {
      return this.configuration.theme.logo.notFound
    }
  }
}
</script>
