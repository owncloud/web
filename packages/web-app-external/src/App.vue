<template>
  <main
    class="oc-height-1-1"
    :class="{
      'oc-flex oc-flex-center oc-flex-middle': loading || loadingError
    }"
  >
  <oc-modal
      v-if="modal"
      :icon="'alarm-warning'"
      :title="'Microsoft debug'"
      :button-cancel-text="'Cancel'"
      :button-confirm-text="'Force reload'"
      @cancel="
        () => {
          this.modal = false
        }
      "
      @confirm="
        () => {
          this.debugMicrosoft = true
          this.modal = false
        }
      "
    >
      <template #content>
        <p>
          If you are facing problems with editing the document, please force
          reload
        </p>
        <p>
          OTG:
          <a href="https://cern.service-now.com/service-portal?id=outage&n=OTG0074523"
            >OTG0074523</a
          >
        </p>
      </template>
    </oc-modal>
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
import { computed, unref } from '@vue/composition-api'
import { queryItemAsString, useAppDefaults, useRouteQuery } from 'web-pkg/src/composables'
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'ExternalApp',

  components: {
    ErrorScreen,
    LoadingScreen
  },
  setup() {
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
    debugMicrosoft: false,
    modal: false,
    viewmodeWrite: false
  }),
  computed: {
    ...mapGetters(['capabilities', 'configuration']),

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
  watch: {
    debugMicrosoft(n, o) {
      if (n === true) {
        this.onCreate()
      }
    }
  },
  async created() {
    await this.onCreate()
    this.catchMicrosoftError()
  },
  methods: {
    ...mapActions([
      'createModal',
      'hideModal'
    ]),
    catchMicrosoftError() {
      const events = []
      this.func = (event) => {events.push(JSON.parse(event.data))}
      if (window.location.href.includes('app=MS') ){ //&& this.viewmodeWrite) {
        
        window.addEventListener('message', this.func)   
        
        setTimeout(() => {
          if (
            !events.some((e) => {
              return e.MessageId === 'App_LoadingStatus'
            })
          ) {
            this.modal = true
            setTimeout(()=>{
              if (
            !events.some((e) => {
              return e.MessageId === 'App_LoadingStatus'
            })
          )
          window.removeEventListener('message', this.func)

            }, 10*1000)
            
          }
        }, 10 * 1000)
      }
      },
    async onCreate() {
      this.loading = true
      try {
        const filePath = this.currentFileContext.path
        const fileId = this.fileId || (await this.getFileResource(filePath)).fileId

        // fetch iframe params for app and file
        const configUrl = this.configuration.server
        const appOpenUrl = this.capabilities.files.app_providers[0].open_url.replace(/^\/+/, '')
        const url =
          configUrl +
          appOpenUrl +
          `?file_id=${fileId}` +
          `&lang=${this.$language.current}` +
          (this.applicationName ? `&app_name=${this.applicationName}` : '') +
          (this.debugMicrosoft ? '&forcelock=1' : '')

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
        
        //
        //if (JSON.parse(atob(response["form_parameters"]?.accessToken?.split(".")[1]))?.viewmode ==="VIEW_MODE_READ_WRITE")
          this.viewmodeWrite = true
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
    }
  }

})
</script>
