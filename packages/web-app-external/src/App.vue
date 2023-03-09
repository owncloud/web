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

<script lang="ts">
import { mapActions, mapGetters } from 'vuex'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import {
  queryItemAsString,
  useClientService,
  useAppDefaults,
  useRouteQuery,
  useRouteParam,
  useRoute
} from 'web-pkg/src/composables'
import { DavProperty } from 'web-client/src/webdav/constants'
import { urlJoin } from 'web-client/src/utils'
import { stringify } from 'qs'
import { configurationManager } from 'web-pkg/src/configuration'
import { authService } from 'web-runtime/src/services/auth'
import { unref, computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'ExternalApp',

  components: {
    ErrorScreen,
    LoadingScreen
  },
  setup() {
    const clientService = useClientService()
    const route = useRoute()
    const token = useRouteParam('token')

    if (unref(route).name === 'external-apps-remote') {
      const passwordRequired = false
      const password = ''

      // onMounted(async () => {
      //   await authService.initializeContext(unref(route))
      //   await authService.resolveOcmLink(unref(token))
      //   console.log("do what you want")
      // })
    }

    const appName = useRouteQuery('app')
    const applicationName = computed(() => queryItemAsString(unref(appName)))
    return {
      ...useAppDefaults({
        applicationId: 'external',
        applicationName
      }),
      applicationName
    }
  },

  data: () => ({
    loading: false,
    loadingError: false,
    errorMessage: '',
    appUrl: '',
    method: '',
    formParameters: {},
    viewmodeWrite: false,
    fileInfo: {},
    reloadWithwriteOnEdit: undefined
  }),
  computed: {
    ...mapGetters(['capabilities']),

    pageTitle() {
      const translated = this.$gettext('"%{appName}" app page')
      return this.$gettextInterpolate(translated, {
        appName: this.applicationName
      })
    },
    iFrameTitle() {
      const translated = this.$gettext('"%{appName}" app content area')
      return this.$gettextInterpolate(translated, {
        appName: this.applicationName
      })
    },
    fileId() {
      return this.$route.query.fileId
    }
  },
  async created() {
    await this.onCreate(false)
  },
  methods: {
    async catchClickMicrosoftEdit() {
      if (!this.reloadWithwriteOnEdit)
        this.reloadWithwriteOnEdit = async (event) => {
          if (JSON.parse(event.data).MessageId === 'UI_Edit') {
            await this.onCreate(true)
          }
        }
      window.removeEventListener('message', this.reloadWithwriteOnEdit)
      window.addEventListener('message', await this.reloadWithwriteOnEdit)
    },
    async onCreate(editMode) {
      this.loading = true
      try {
        let defaultApplication = undefined
        let fileId
        let filePath

        if (this.$route.name !== 'external-apps-remote') {
          if (!editMode)
            this.fileInfo = await this.getFileInfo(this.currentFileContext, {
              davProperties: [DavProperty.FileId, DavProperty.Permissions, DavProperty.Name]
            })
          fileId = this.fileId || this.fileInfo.fileId
        } else {
          await authService.initializeContext(unref(this.$route))
          await authService.resolveOcmLink(unref(this.$route.params.token))
          sessionStorage.setItem('ocmToken', this.$route.params.token)

          filePath = this.$route.params.remote_path
        }

        // fetch iframe params for app and file
        const baseUrl = urlJoin(
          configurationManager.serverUrl,
          this.capabilities.files.app_providers[0].open_url
        )

        const viewMode = editMode
          ? 'write'
          : this.fileInfo.isReceivedShare() ||
            window.location.pathname.startsWith('/external/public/')
          ? 'preview'
          : false

        const query = stringify({
          ...(fileId && { file_id: fileId }),
          ...(filePath && { path: '/ocm/' + this.$route.params.token + '/' + filePath }),
          lang: this.$language.current,
          ...(this.applicationName && { app_name: this.applicationName }),
          ...(viewMode && { view_mode: viewMode })
        })
        const url = `${baseUrl}?${query}`
        const response = await this.makeRequest('POST', url, {
          validateStatus: () => true
        })

        if (response.status !== 200) {
          switch (response.status) {
            case 425:
              this.errorMessage = this.$gettext(
                'This file is currently being processed and is not yet available for use. Please try again shortly.'
              )
              break
            default:
              this.errorMessage = response.data?.message
          }

          this.loading = false
          this.loadingError = true
          console.error('Error fetching app information', response.status, response.data.message)
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
        if (response.data.form_parameters) {
          this.formParameters = response.data.form_parameters
        }

        if (this.method === 'POST' && this.formParameters) {
          this.$nextTick(() => this.$refs.subm.click())
        }
        this.loading = false
        if (window.location.href.includes('app=MS')) {
          await this.catchClickMicrosoftEdit()
        }
      } catch (error) {
        this.errorMessage = this.$gettext('Error retrieving file information')
        console.error('Error retrieving file information', error)
        this.loading = false
        this.loadingError = true
      }
    }
  }
})
</script>
