<template>
  <div>
    <app-template
      ref="template"
      :loading="loadResourcesTask.isRunning || !loadResourcesTask.last"
      :breadcrumbs="breadcrumbs"
      :side-bar-active-panel="sideBarActivePanel"
      :side-bar-available-panels="sideBarAvailablePanels"
      :side-bar-open="sideBarOpen"
      @closeSideBar="closeSideBar"
      @toggleSideBar="toggleSideBar"
      @selectPanel="selectPanel"
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
          >
            <template #contextMenu>
              <context-actions :items="selectedSpaces" />
            </template>
          </SpacesList>
        </div>
      </template>
    </app-template>
  </div>
</template>

<script lang="ts">
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useAccessToken, useGraphClient, useStore, useTranslations } from 'web-pkg/src/composables'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, unref } from 'vue'
import { useTask } from 'vue-concurrency'
import { eventBus } from 'web-pkg/src/services/eventBus'
import AppTemplate from '../components/AppTemplate.vue'
import { buildSpace } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg'
import SpacesList from '../components/Spaces/SpacesList.vue'
import SpaceDetails from 'web-pkg/src/components/sideBar/Spaces/Details/SpaceDetails.vue'
import SpaceDetailsMultiple from 'web-pkg/src/components/sideBar/Spaces/Details/SpaceDetailsMultiple.vue'
import SpaceNoSelection from 'web-pkg/src/components/sideBar/Spaces/SpaceNoSelection.vue'
import ContextActions from '../components/Spaces/ContextActions.vue'
import MembersPanel from '../components/Spaces/SideBar/MembersPanel.vue'

export default defineComponent({
  name: 'SpacesView',
  components: {
    SpacesList,
    AppTemplate,
    NoContentMessage,
    ContextActions
  },
  setup() {
    const store = useStore()
    const accessToken = useAccessToken({ store })
    const spaces = ref([])
    const { graphClient } = useGraphClient()
    const { $gettext } = useTranslations()

    const loadResourcesEventToken = ref(null)
    const template = ref(null)
    const listHeaderPosition = ref(0)
    const selectedSpaces = ref([])
    const sideBarOpen = ref(false)
    const selectedPanel = ref(undefined)

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

    const sideBarAvailablePanels = computed(() => {
      return [
        {
          app: 'SpaceNoSelection',
          icon: 'layout-grid',
          title: $gettext('Space details'),
          component: SpaceNoSelection,
          default: true,
          enabled: unref(selectedSpaces).length === 0
        },
        {
          app: 'SpaceDetails',
          icon: 'layout-grid',
          title: $gettext('Space details'),
          component: SpaceDetails,
          default: true,
          enabled: unref(selectedSpaces).length === 1,
          componentAttrs: {
            spaceResource: unref(selectedSpaces)[0]
          }
        },
        {
          app: 'SpaceDetailsMultiple',
          icon: 'layout-grid',
          title: $gettext('Space details'),
          component: SpaceDetailsMultiple,
          default: true,
          enabled: unref(selectedSpaces).length > 1
        },
        {
          app: 'SpaceMembers',
          icon: 'group',
          title: $gettext('Space members'),
          component: MembersPanel,
          default: false,
          enabled: unref(selectedSpaces).length === 1,
          componentAttrs: {
            spaceResource: unref(selectedSpaces)[0]
          }
        }
      ]
    })

    const sideBarActivePanel = computed(() => {
      if (unref(selectedPanel)) {
        return unref(selectedPanel)
      }
      return unref(sideBarAvailablePanels).find((e) => e.enabled).app
    })

    const closeSideBar = () => {
      sideBarOpen.value = false
      selectedPanel.value = false
    }
    const toggleSideBar = () => {
      sideBarOpen.value = !unref(sideBarOpen)
    }
    const selectPanel = (panel) => {
      selectedPanel.value = panel
    }

    onMounted(async () => {
      await loadResourcesTask.perform()
      loadResourcesEventToken.value = eventBus.subscribe('app.admin-settings.list.load', () => {
        loadResourcesTask.perform()
      })

      calculateListHeaderPosition()
      window.addEventListener('resize', calculateListHeaderPosition)
    })

    onBeforeUnmount(() => {
      eventBus.unsubscribe('app.admin-settings.list.load', unref(loadResourcesEventToken))
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
      sideBarAvailablePanels,
      sideBarActivePanel,
      closeSideBar,
      toggleSideBar,
      template,
      selectPanel,
      toggleSelectAllSpaces,
      toggleSelectSpace,
      unselectAllSpaces
    }
  }
})
</script>
