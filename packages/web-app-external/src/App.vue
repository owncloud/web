<template>
  <main
    class="uk-height-1-1"
    :class="{
      'uk-flex uk-flex-center uk-flex-middle': loading || loadingError
    }"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" :message="errorMessage" />
    <iframe
      v-if="appUrl && method === 'GET'"
      :src="appUrl"
      class="uk-width-1-1 uk-height-1-1"
      :title="iFrameTitle"
    />
    <div v-if="appUrl && method === 'POST' && formParameters" class="uk-height-1-1">
      <form :action="appUrl" target="app-iframe" method="post">
        <input ref="subm" type="submit" :value="formParameters" class="oc-hidden" />
        <div v-for="(item, key, index) in formParameters" :key="index">
          <input :name="key" :value="item" type="hidden" />
        </div>
      </form>
      <iframe name="app-iframe" class="uk-width-1-1 uk-height-1-1" :title="iFrameTitle" />
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'

// FIXME: hacky, get rid asap, just a workaround
// same as packages/web-app-files/src/views/PublicFiles.vue
const unauthenticatedUserReady = async (router, store) => {
  if (store.getters.userReady) {
    return
  }

  const publicToken = router.currentRoute.query['public-token']
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

  data: () => ({
    loading: false,
    loadingError: false,
    errorMessage: false,
    appUrl: '',
    method: '',
    formParameters: {}
  }),
  computed: {
    ...mapGetters(['getToken', 'capabilities', 'configuration']),
    ...mapGetters('Files', ['publicLinkPassword']),

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
      return this.$route.params.app
    },
    fileId() {
      return this.$route.params.file_id
    }
  },
  async created() {
    await unauthenticatedUserReady(this.$router, this.$store)

    this.loading = true

    // build headers with respect to the actual auth situation
    const { 'public-token': publicToken } = this.$route.query
    const publicLinkPassword = this.publicLinkPassword
    const accessToken = this.getToken
    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      ...(publicToken && { 'public-token': publicToken }),
      ...(publicLinkPassword && {
        Authorization:
          'Basic ' + Buffer.from(['public', publicLinkPassword].join(':')).toString('base64')
      }),
      ...(accessToken && {
        Authorization: 'Bearer ' + accessToken
      })
    }

    // fetch iframe params for app and file
    const configUrl = this.configuration.server
    const appOpenUrl = this.capabilities.files.app_providers[0].open_url.replace(/^\/+/, '')
    const url =
      configUrl +
      appOpenUrl +
      `?file_id=${this.fileId}` +
      (this.appName ? `&app_name=${this.appName}` : '')

    const response = await fetch(url, {
      method: 'POST',
      headers
    })

    if (response.status !== 200) {
      const err = await response.json()
      this.errorMessage = err.message
      this.loading = false
      this.loadingError = true
      console.error('Error fetching app information', response.status, this.errorMessage)
      return
    }

    const data = await response.json()

    if (!data.app_url || !data.method) {
      this.loading = false
      this.loadingError = true
      console.error('Error in app server response')
      return
    }

    this.appUrl = data.app_url
    this.method = data.method
    if (data.form_parameters) this.formParameters = data.form_parameters

    if (this.method === 'POST' && this.formParameters) {
      this.$nextTick(() => this.$refs.subm.click())
    }
    this.loading = false
  }
}
</script>
