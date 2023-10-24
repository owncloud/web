<template>
  <main
    class="oc-height-1-1"
    :class="{
      'oc-flex oc-flex-center oc-flex-middle': loading || loadingError
    }"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <app-top-bar v-if="!loading && !loadingError" :resource="resource" @close="closeApp" />
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
import { stringify } from 'qs'
import { mapGetters } from 'vuex'
import { computed, defineComponent, unref } from 'vue'
import { urlJoin } from 'web-client/src/utils'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import {
  queryItemAsString,
  useAppDefaults,
  useClientService,
  useRoute,
  useRouteParam,
  useRouteQuery,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { configurationManager } from 'web-pkg/src/configuration'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import {
  Resource,
  SpaceResource,
  buildShareSpaceResource,
  isMountPointSpaceResource
} from 'web-client/src/helpers'
import { useLoadFileInfoById } from 'web-pkg/src/composables/fileInfo'

export default defineComponent({
  name: 'ExternalApp',
  components: {
    AppTopBar,
    ErrorScreen,
    LoadingScreen
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const currentRoute = useRoute()
    const clientService = useClientService()
    const { loadFileInfoByIdTask } = useLoadFileInfoById({ clientService })
    const appName = useRouteQuery('app')
    const applicationName = computed(() => queryItemAsString(unref(appName)))

    const fileIdQueryItem = useRouteQuery('fileId')
    const fileId = computed(() => {
      return queryItemAsString(unref(fileIdQueryItem))
    })

    const driveAliasAndItem = useRouteParam('driveAliasAndItem')

    const getMatchingSpaceByFileId = (id): SpaceResource => {
      return store.getters['runtime/spaces/spaces'].find((space) => id.startsWith(space.id))
    }
    const getMatchingMountPoint = (id: string | number): SpaceResource => {
      return store.getters['runtime/spaces/spaces'].find(
        (space) => isMountPointSpaceResource(space) && space.root?.remoteItem?.id === id
      )
    }

    const addMissingDriveAliasAndItem = async () => {
      const id = unref(fileId)
      let path: string
      let matchingSpace = getMatchingSpaceByFileId(id)
      if (matchingSpace) {
        path = await clientService.owncloudSdk.files.getPathForFileId(id)
        const driveAliasAndItem = matchingSpace.getDriveAliasAndItem({ path } as Resource)
        return router.push({
          params: {
            ...unref(currentRoute).params,
            driveAliasAndItem
          },
          query: {
            ...(unref(currentRoute).query?.app && { app: unref(currentRoute).query?.app }),
            contextRouteName: 'files-spaces-generic'
          }
        })
      }

      // no matching space found => the file doesn't lie in own spaces => it's a share.
      // do PROPFINDs on parents until root of accepted share is found in `mountpoint` spaces
      await store.dispatch('runtime/spaces/loadMountPoints', {
        graphClient: clientService.graphAuthenticated
      })
      let mountPoint = getMatchingMountPoint(id)
      const resource = await loadFileInfoByIdTask.perform(id)
      const sharePathSegments = mountPoint ? [] : [unref(resource).name]
      let tmpResource = unref(resource)
      while (!mountPoint) {
        try {
          tmpResource = await loadFileInfoByIdTask.perform(tmpResource.parentFolderId)
        } catch (e) {
          throw Error(e)
        }
        mountPoint = getMatchingMountPoint(tmpResource.id)
        if (!mountPoint) {
          sharePathSegments.unshift(tmpResource.name)
        }
      }
      matchingSpace = buildShareSpaceResource({
        shareId: mountPoint.nodeId,
        shareName: mountPoint.name,
        serverUrl: configurationManager.serverUrl
      })
      path = urlJoin(...sharePathSegments)

      const driveAliasAndItem = matchingSpace.getDriveAliasAndItem({ path } as Resource)
      return router.push({
        params: {
          ...unref(currentRoute).params,
          driveAliasAndItem
        },
        query: {
          shareId: matchingSpace.shareId,
          ...(unref(currentRoute).query?.app && { app: unref(currentRoute).query?.app }),
          contextRouteName: 'files-shares-with-me'
        }
      })
    }

    return {
      ...useAppDefaults({
        applicationId: 'external',
        applicationName
      }),
      applicationName,
      driveAliasAndItem,
      addMissingDriveAliasAndItem
    }
  },

  data: () => ({
    appUrl: '',
    errorMessage: '',
    formParameters: {},
    loading: false,
    loadingError: false,
    method: '',
    resource: null
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
    fileIdFromRoute() {
      return this.$route.query.fileId
    }
  },
  async created() {
    this.loading = true
    try {
      if (!this.driveAliasAndItem) {
        await this.addMissingDriveAliasAndItem()
      }

      this.resource = await this.getFileInfo(this.currentFileContext, {
        davProperties: []
      })

      const fileId = this.fileIdFromRoute || this.resource.fileId

      // fetch iframe params for app and file
      const baseUrl = urlJoin(
        configurationManager.serverUrl,
        this.capabilities.files.app_providers[0].open_url
      )
      const query = stringify({
        file_id: fileId,
        lang: this.$language.current,
        ...(this.applicationName && { app_name: this.applicationName })
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
        this.$nextTick(() => (this.$refs.subm as HTMLInputElement).click())
      }
      this.loading = false
    } catch (error) {
      this.errorMessage = this.$gettext('Error retrieving file information')
      console.error('Error retrieving file information', error)
      this.loading = false
      this.loadingError = true
    }
  }
})
</script>
