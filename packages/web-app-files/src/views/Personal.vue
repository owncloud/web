<template>
  <div>
    <div v-if="isLightweight && isHomeRoute"><home /></div>
    <div v-else>
      <app-bar
        :has-bulk-actions="true"
        :breadcrumbs="breadcrumbs"
        :breadcrumbs-context-actions-items="[currentFolder]"
        :show-actions-on-selection="true"
      >
        <template #actions>
          <create-and-upload />
        </template>
      </app-bar>
      <app-loading-spinner v-if="loadResourcesTask.isRunning" />
      <template v-else>
        <not-found-message v-if="folderNotFound" class="files-not-found oc-height-1-1" />
        <no-content-message
          v-else-if="isEmpty"
          id="files-personal-empty"
          class="files-empty"
          icon="folder"
        >
          <template #message>
            <span v-translate>There are no resources in this folder</span>
          </template>
          <template #callToAction>
            <span v-translate>
              Drag files and folders here or use the "New" or "Upload" buttons to add files
            </span>
          </template>
        </no-content-message>
        <resource-table
          v-else
          id="files-personal-table"
          v-model="selectedResources"
          class="files-table"
          :class="{ 'files-table-squashed': !sidebarClosed }"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="paginatedResources"
          :target-route="resourceTargetLocation"
          :header-position="fileListHeaderY"
          :drag-drop="true"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @fileDropped="fileDropped"
          @fileClick="$_fileActions_triggerDefaultAction"
          @rowMounted="rowMounted"
          @sort="handleSort"
        >
          <template #quickActions="{ resource }">
            <quick-actions
              :class="resource.preview"
              class="oc-visible@s"
              :item="resource"
              :actions="app.quickActions"
            />
          </template>
          <template #contextMenu="{ resource }">
            <context-actions v-if="isResourceInSelection(resource)" :items="selectedResources" />
          </template>
          <template #footer>
            <pagination :pages="paginationPages" :current-page="paginationPage" />
            <list-info
              v-if="paginatedResources.length > 0"
              class="oc-width-1-1 oc-my-s"
              :files="totalFilesCount.files"
              :folders="totalFilesCount.folders"
              :size="totalFilesSize"
            />
          </template>
        </resource-table>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import isNil from 'lodash-es/isNil'
import debounce from 'lodash-es/debounce'

import MixinAccessibleBreadcrumb from '../mixins/accessibleBreadcrumb'
import MixinFileActions from '../mixins/fileActions'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinFilesListScrolling from '../mixins/filesListScrolling'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import { bus } from 'web-pkg/src/instance'
import { breadcrumbsFromPath, concatBreadcrumbs } from '../helpers/breadcrumbs'

import AppBar from '../components/AppBar/AppBar.vue'
import CreateAndUpload from '../components/AppBar/CreateAndUpload.vue'
import ResourceTable from '../components/FilesList/ResourceTable.vue'
import QuickActions from '../components/FilesList/QuickActions.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesList/NotFoundMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { createLocationSpaces } from '../router'
import { useResourcesViewDefaults } from '../composables'
import { defineComponent, unref, computed } from '@vue/composition-api'
import { Resource, move } from '../helpers/resource'
import { useCapabilityShareJailEnabled, useRouteParam, useStore } from 'web-pkg/src/composables'
import { clientService } from 'web-pkg/src/services'
import Home from './Home.vue'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    AppBar,
    CreateAndUpload,
    ResourceTable,
    QuickActions,
    AppLoadingSpinner,
    NoContentMessage,
    NotFoundMessage,
    ListInfo,
    Pagination,
    ContextActions,
    Home
  },

  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    MixinFilesListScrolling,
    MixinMountSideBar,
    MixinFilesListFilter
  ],
  setup() {
    const store = useStore()
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )
    const storageId = useRouteParam('storageId')
    const resourceTargetLocation = computed(() => {
      return createLocationSpaces('files-spaces-personal', {
        params: {
          storageId: unref(storageId)
        }
      })
    })
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      resourceTargetLocation,
      hasShareJail: useCapabilityShareJailEnabled(),
      graphClient
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['user', 'homeFolder', 'configuration']),

    isLightweight() {
      const windowVue = window.Vue as any
      return windowVue.$store.getters.user.usertype === 'lightweight'
    },
    isHomeRoute() {
      const windowVue = window.Vue as any
      return this.$route.fullPath.includes(
        `/${windowVue.$store.getters.user.id.charAt(0)}/${windowVue.$store.getters.user.id}`
      )
    },
    isEmpty() {
      return this.paginatedResources.length < 1
    },

    breadcrumbs() {
      const personalRouteName = this.hasShareJail
        ? this.$gettext('Personal')
        : this.$gettext('All files')
      return concatBreadcrumbs(
        { text: personalRouteName, to: { path: '/' } },
        ...breadcrumbsFromPath(this.$route, this.$route.params.item)
      )
    },

    folderNotFound() {
      return this.currentFolder === null
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    }
  },

  watch: {
    $route: {
      handler: async function (to, from) {
        // const needsRedirectWithStorageId =
        //   to.params.storageId === 'home' || isNil(to.params.storageId)
        // if (needsRedirectWithStorageId) {
        //   let storageId = this.user.id
        //   if (this.hasShareJail) {
        //     const drivesResponse = await this.graphClient.drives.listMyDrives(
        //       '',
        //       'driveType eq personal'
        //     )
        //     storageId = drivesResponse.data.value[0].id
        //   }

        //   return this.$router.replace({
        //     to,
        //     params: { ...to.params, storageId },
        //     query: to.query
        //   })
        // }

        const needsRedirectToHome =
          this.homeFolder !== '/' && isNil(to.params.item) && !to.path.endsWith('/')
        if (needsRedirectToHome) {
          return this.$router.replace(
            {
              name: to.name,
              params: {
                ...to.params,
                item: this.homeFolder
              },
              query: to.query
            },
            () => {},
            (e) => {
              console.error(e)
            }
          )
        }

        const sameRoute = to.name === from?.name && to.params?.storageId === from?.params?.storageId
        const sameItem = to.params?.item === from?.params?.item
        if (!sameRoute || !sameItem) {
          this.loadResourcesTask.perform(this, sameRoute)
        }
      },
      immediate: true
    }
  },

  mounted() {
    const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this, this.$route.params.item === path, path)
    })

    this.$on('beforeDestroy', () => bus.unsubscribe('app.files.list.load', loadResourcesEventToken))
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapMutations('Files', ['REMOVE_FILE', 'REMOVE_FILE_FROM_SEARCHED', 'REMOVE_FILE_SELECTION']),

    onNewProjectButtonClick() {
      window.open(
        'https://cern.service-now.com/service-portal?id=sc_cat_item&name=EOS-projet-space&se=CERNBox-Service',
        '_blank'
      )
    },
    async fileDropped(fileIdTarget) {
      const selected = [...this.selectedResources]
      const targetInfo = this.paginatedResources.find((e) => e.id === fileIdTarget)
      const isTargetSelected = selected.some((e) => e.id === fileIdTarget)
      if (isTargetSelected) return
      if (targetInfo.type !== 'folder') return
      const movedResources = await move(
        selected,
        targetInfo,
        this.$client,
        this.createModal,
        this.hideModal,
        this.showMessage,
        this.$gettext,
        this.$gettextInterpolate,
        this.$ngettext,
        this.$route.name,
        this.publicLinkPassword
      )
      for (const resource of movedResources) {
        this.REMOVE_FILE(resource)
        this.REMOVE_FILE_FROM_SEARCHED(resource)
        this.REMOVE_FILE_SELECTION(resource)
      }
    },

    rowMounted(resource, component) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          resource,
          isPublic: false,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    },
    scrollToResourceFromRoute() {
      const resourceName = this.$route.query.scrollTo

      if (resourceName && this.paginatedResources.length > 0) {
        this.$nextTick(() => {
          const resource = this.paginatedResources.find((r) => r.name === resourceName)

          if (resource) {
            this.selectedResources = [resource]
            this.$_mountSideBar_showDefaultPanel(resource)
            this.scrollToResource(resource)
          }
        })
      }
    }
  }
})
</script>
