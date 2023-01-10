<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
      :side-bar-open="sideBarOpen"
      @selectPanel="selectPanel"
      @closeSideBar="closeSideBar"
      @toggleSideBar="toggleSideBar"
    >
      <template #topbarActions>
        <div class="admin-settings-app-bar-actions oc-mt-xs">
          <div v-if="selectedSpaces.length > 1" class="oc-flex oc-flex-middle">
            <oc-button
              id="files-clear-selection"
              v-oc-tooltip="$gettext('Clear selection')"
              :aria-label="$gettext('Clear selection')"
              appearance="outline"
              @click="unselectAllSpaces"
            >
              <oc-icon name="close" />
            </oc-button>
          </div>
        </div>
      </template>
      <template #mainContent>
        <no-content-message
          v-if="!spaces.length"
          id="admin-settings-spaces-empty"
          class="spaces-empty"
          icon="layout-grid"
        >
          <template #message>
            <span v-translate>No spaces in here</span>
          </template>
        </no-content-message>
        <div v-else>
          <SpacesList
            :spaces="spaces"
            :selected-spaces="selectedSpaces"
            :header-position="listHeaderPosition"
            @toggleSelectSpace="toggleSelectSpace"
            @toggleSelectAllSpaces="toggleSelectAllSpaces"
            @toggleUnSelectAllSpaces="unselectAllSpaces"
          />
        </div>
      </template>
    </app-template>
  </div>
</template>

<script lang="ts">
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useAccessToken, useGraphClient, useStore, useTranslations } from 'web-pkg/src/composables'
import { computed, defineComponent, getCurrentInstance, onMounted, ref, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg/src/services/eventBus'
import AppTemplate from '../components/AppTemplate.vue'
import { buildSpace } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg'
import SpacesList from '../components/Spaces/SpacesList.vue'
import DetailsPanel from '../components/Spaces/SideBar/DetailsPanel.vue'
import SpaceDetails from 'web-pkg/src/components/sideBar/Details/SpaceDetails.vue'
import EditSpace from '../components/Spaces/SideBar/EditSpace.vue'

export default defineComponent({
  name: 'SpacesView',
  components: {
    SpacesList,
    AppTemplate,
    NoContentMessage
  },
  setup() {
    const store = useStore()
    const instance = getCurrentInstance().proxy
    const accessToken = useAccessToken({ store })
    const spaces = ref([])
    const { graphClient } = useGraphClient()
    const { $gettext } = useTranslations()

    const template = ref(null)
    const listHeaderPosition = ref(0)
    const selectedSpaces = ref([])
    const sideBarOpen = ref(false)
    const sideBarActivePanel = ref('EditSpace')

    const loadResourcesTask = useTask(function* (signal) {
      const {
        data: { value: drivesResponse }
      } = yield unref(graphClient).drives.listAllDrives('name asc', 'driveType eq project')
      const drives = drivesResponse.map((space) =>
        buildSpace({ ...space, serverUrl: configurationManager.serverUrl })
      )
      spaces.value = drives
    })

    const breadcrumbs = computed(() => [
      { text: $gettext('Administration Settings'), to: { path: '/admin-settings' } },
      {
        text: $gettext('Spaces'),
        onClick: () => eventBus.publish('app.admin-settings.list.load')
      }
    ])

    const allSpacesSelected = computed(() => unref(spaces).length === unref(selectedSpaces).length)

    const calculateListHeaderPosition = () => {
      listHeaderPosition.value = unref(template)?.$refs?.appBar?.getBoundingClientRect()?.height
    }
    const toggleSelectAllSpaces = () => {
      if (unref(allSpacesSelected)) {
        selectedSpaces.value = []
        return
      }
      selectedSpaces.value = [...unref(spaces)]
    }

    const toggleSelectSpace = (toggledSpace) => {
      const isSpaceSelected = unref(selectedSpaces).find((s) => s.id === toggledSpace.id)
      if (!isSpaceSelected) {
        return selectedSpaces.value.push(toggledSpace)
      }

      selectedSpaces.value = unref(selectedSpaces).filter((s) => s.id !== toggledSpace.id)
    }

    const unselectAllSpaces = () => {
      selectedSpaces.value = []
    }

    onMounted(async () => {
      await loadResourcesTask.perform()
      const loadResourcesEventToken = eventBus.subscribe('app.admin-settings.list.load', () => {
        loadResourcesTask.perform()
      })

      calculateListHeaderPosition()
      window.addEventListener('resize', calculateListHeaderPosition)
      instance.$on('beforeUnmount', () => {
        eventBus.unsubscribe('app.admin-settings.list.load', loadResourcesEventToken)
      })
    })

    return {
      spaces,
      loadResourcesTask,
      graphClient,
      accessToken,
      breadcrumbs,
      listHeaderPosition,
      selectedSpaces,
      sideBarOpen,
      sideBarActivePanel,
      template,
      toggleSelectAllSpaces,
      toggleSelectSpace,
      unselectAllSpaces
    }
  },
  computed: {
    sidebarSpacePanelComponent() {
      if (this.selectedSpaces.length > 1 || this.selectedSpaces.length === 0) {
        return DetailsPanel
      }
      return SpaceDetails
    },
    sideBarAvailablePanels() {
      return [
        {
          app: 'SpaceDetails',
          icon: 'layout-grid',
          title: this.$gettext('Space details'),
          component: this.sidebarSpacePanelComponent,
          default: true,
          enabled: true,
          componentAttrs: {
            spaceResource: this.selectedSpaces[0],
            spaceCount: this.selectedSpaces.length
          }
        },
        {
          app: 'EditSpace',
          icon: 'pencil',
          title: this.$gettext('Edit space'),
          component: EditSpace,
          default: true,
          enabled: true // this.selectedGroups.length === 1
          /**
           * Editing groups is currently not supported by backend
           */
        }
      ]
    }
  },
  methods: {
    selectPanel(panel) {
      this.sideBarActivePanel = panel || 'DetailsPanel'
    },
    closeSideBar() {
      this.sideBarOpen = false
    },
    toggleSideBar() {
      this.sideBarOpen = !this.sideBarOpen
    }
  }
})
</script>
