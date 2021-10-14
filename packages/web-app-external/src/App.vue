<template>
  <main
    class="uk-height-viewport"
    :class="{
      'uk-flex uk-flex-center uk-flex-middle': loading || loadingError
    }"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <iframe
      v-if="appUrl && method === 'GET'"
      :src="appUrl"
      class="uk-width-1-1 uk-height-viewport"
      :title="iFrameTitle"
    />
    <div v-if="appUrl && method === 'POST' && formParameters">
      <form :action="appUrl" target="app-iframe" method="post">
        <input ref="subm" type="submit" :value="formParameters" class="oc-hidden" />
        <div v-for="(item, key, index) in formParameters" :key="index">
          <input :name="key" :value="item" type="hidden" />
        </div>
      </form>
      <iframe name="app-iframe" class="uk-width-1-1 uk-height-viewport" :title="iFrameTitle" />
    </div>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'

export default {
  name: 'ExternalApp',

  components: {
    ErrorScreen,
    LoadingScreen
  },

  data: () => ({
    loading: false,
    loadingError: false,
    appUrl: '',
    method: '',
    formParameters: {}
  }),
  computed: {
    ...mapGetters(['getToken', 'capabilities', 'configuration']),

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
    this.loading = true

    // TODO: Enable externalApp usage on public routes below
    // initialize headers()

    // if (this.isPublicRoute) {
    //   // send auth header here if public route
    //   // if password exists send it via basicauth public:password

    //   // headers.append('public-token', 'uUCPJghnVUspjxe')
    //   // const password = this.publicLinkPassword

    //   // if (password) {
    //   //  headers.append( Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64') }
    //   // }
    // } else {
    //   - check for token
    //   - abort if falsy
    //   - build headers as below
    // }

    if (!this.getToken) {
      this.loading = false
      this.loadingError = true
      return
    }

    const headers = new Headers()
    headers.append('Authorization', 'Bearer ' + this.getToken)
    headers.append('X-Requested-With', 'XMLHttpRequest')

    const configUrl = this.configuration.server
    const appOpenUrl = this.capabilities.files.app_providers[0].open_url.replace('/app', 'app')
    const url = configUrl + appOpenUrl + '?file_id=' + this.fileId + '&app_name=' + this.appName

    const response = await fetch(url, {
      method: 'POST',
      headers
    })

    if (response.status !== 200) {
      this.loading = false
      this.loadingError = true
      console.error('Error fetching app information', response.status, response.message)
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
