<template>
  <main
    class="oc-height-1-1"
    :class="{
      'oc-flex oc-flex-center oc-flex-middle': loading || loadingError
    }"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" :message="errorMessage" />
    <iframe
      v-if="appUrl && method === 'GET'"
      :src="appUrl"
      class="oc-width-1-1 oc-height-1-1"
      :title="iFrameTitle"
      allowfullscreen
    />
    <div v-if="appUrl && method === 'POST' && formParameters" class="oc-height-1-1">
      <form :action="appUrl" target="app-iframe" method="post">
        <input ref="subm" type="submit" :value="formParameters" class="oc-hidden" />
        <div v-for="(item, key, index) in formParameters" :key="index">
          <input :name="key" :value="item" type="hidden" />
        </div>
      </form>
      <iframe
        name="app-iframe"
        class="oc-width-1-1 oc-height-1-1"
        :title="iFrameTitle"
        allowfullscreen
      />
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import { DavProperties } from 'web-pkg/src/constants'
import { buildResource } from '../../web-app-files/src/helpers/resources'
import { useAppDefaults } from 'web-pkg/src/composables'

// FIXME: hacky, get rid asap, just a workaround
// same as packages/web-app-files/src/views/PublicFiles.vue
const unauthenticatedUserReady = async (router, store) => {
  if (store.getters.userReady) {
    return
  }

  const publicToken = (router.currentRoute.params.filePath || '').split('/')[0]
  const publicLinkPassword = store.getters['Files/publicLinkPassword']

  await store.dispatch('loadCapabilities', {
    publicToken,
    ...(publicLinkPassword && { user: 'public', password: publicLinkPassword })
  })

  store.commit('SET_USER_READY', true)
}

export default {
  name: 'ExternalApp',

  components: {
    ErrorScreen,
    LoadingScreen
  },
  setup() {
    return {
      ...useAppDefaults({
        applicationId: 'external'
      })
    }
  },

  data: () => ({
    loading: false,
    loadingError: false,
    errorMessage: '',
    appUrl: '',
    method: '',
    formParameters: {}
  }),
  computed: {
    ...mapGetters(['capabilities', 'configuration']),

    pageTitle() {
      const translated = this.$gettext('"%{appName}" app page')
      return this.$gettextInterpolate(translated, {
        appName: this.appName
      })
    },
    iFrameTitle() {
      const translated = this.$gettext('"%{appName}" app content area')
      return this.$gettextInterpolate(translated, {
        appName: this.appName
      })
    },
    appName() {
      return this.$route.query.app
    },
    fileId() {
      return this.$route.query.fileId
    }
  },
  mounted() {
    if (this.appName) {
      document.title = [
        this.currentFileContext.fileName,
        this.appName,
        this.configuration.currentTheme.general.name
      ]
        .filter(Boolean)
        .join(' - ')
    }
  },
  async created() {
    await unauthenticatedUserReady(this.$router, this.$store)

    this.loading = true
    try {
      const filePath = this.currentFileContext.path
      const fileId = this.fileId || (await this.getFileInfoResource(filePath)).fileId

      // fetch iframe params for app and file
      const configUrl = this.configuration.server
      const appOpenUrl = this.capabilities.files.app_providers[0].open_url.replace(/^\/+/, '')
      const url =
        configUrl +
        appOpenUrl +
        `?file_id=${fileId}` +
        (this.appName ? `&app_name=${this.appName}` : '')

      const response = await this.makeRequest('POST', url)

      if (response.status !== 200) {
        this.errorMessage = response.message
        this.loading = false
        this.loadingError = true
        console.error('Error fetching app information', response.status, this.errorMessage)
        return
      }

      if (!response.data.app_url || !response.data.method) {
        this.errorMessage = this.$gettext('Error in app server response')
        this.loading = false
        this.loadingError = true
        console.error('Error in app server response')
        return
      }

      this.appUrl = response.data.app_url
      this.method = response.data.method
      if (response.data.form_parameters) this.formParameters = response.data.form_parameters

      if (this.method === 'POST' && this.formParameters) {
        this.$nextTick(() => this.$refs.subm.click())
      }
      this.loading = false
    } catch (error) {
      this.errorMessage = this.$gettext('Error retrieving file information')
      console.error('Error retrieving file information', error)
      this.loading = false
      this.loadingError = true
    }
  },
  methods: {
    async getFileInfoResource(path) {
      const file = await this.getFileInfo(path, DavProperties.Default)
      return buildResource(file)
    }
  }
}
</script>
