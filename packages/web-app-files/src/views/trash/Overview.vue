<template>
  <div class="oc-flex">
    <files-view-wrapper>
      <app-bar
        :breadcrumbs="breadcrumbs"
        :has-sidebar-toggle="false"
        :has-view-options="false"
        :has-hidden-files="false"
        :has-file-extensions="false"
        :has-pagination="false"
      />
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <no-content-message v-if="!spaces.length" icon="delete-bin-5">
          <template #message>
            <span v-text="$gettext('You don\'t have access to any trashbins')"></span>
          </template>
        </no-content-message>
        <template v-else>
          <oc-text-input
            id="spaces-filter"
            v-model="filterTerm"
            class="oc-ml-m oc-my-s"
            :label="$gettext('Search')"
            autocomplete="off"
          />
          <oc-table
            ref="tableRef"
            class="spaces-table"
            :sort-by="sortBy"
            :sort-dir="sortDir"
            :fields="fields"
            :data="displaySpaces"
            :header-position="fileListHeaderY"
            :sticky="true"
            :hover="true"
            @sort="handleSort"
          >
            <template #icon="{ item }">
              <oc-icon v-if="isPersonalSpaceResource(item)" class="oc-pl-m" name="folder" />
              <oc-icon v-else class="oc-pl-m" name="layout-grid" />
            </template>
            <template #name="{ item }">
              <oc-button
                class="oc-display-block"
                appearance="raw"
                v-bind="getSpaceAttributes(item)"
                v-text="getSpaceName(item)"
              />
            </template>
            <template #footer>
              <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
                <p class="oc-text-muted">{{ footerTextTotal }}</p>
                <p v-if="filterTerm" class="oc-text-muted">{{ footerTextFilter }}</p>
              </div>
            </template>
          </oc-table>
        </template>
      </template>
    </files-view-wrapper>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, unref, watch } from 'vue'
import Mark from 'mark.js'
import Fuse from 'fuse.js'
import { useGettext } from 'vue3-gettext'
import { useTask } from 'vue-concurrency'
import { defaultFuseOptions, useClientService, useRouter, useStore } from 'web-pkg'
import { createLocationTrash } from 'web-pkg/src/router'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import AppBar from 'web-pkg/src/components/AppBar/AppBar.vue'
import FilesViewWrapper from 'web-app-files/src/components/FilesViewWrapper.vue'
import {
  isPersonalSpaceResource,
  isProjectSpaceResource,
  SpaceResource
} from 'web-client/src/helpers'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { FieldType } from 'design-system/src/components/OcTable/OcTable.vue'
import { useFileListHeaderPosition } from 'web-pkg/src/composables'

export default defineComponent({
  name: 'TrashOverview',
  components: { FilesViewWrapper, AppBar, AppLoadingSpinner, NoContentMessage },
  setup() {
    const store = useStore()
    const router = useRouter()
    const { $gettext } = useGettext()
    const clientService = useClientService()
    const { y: fileListHeaderY } = useFileListHeaderPosition()
    const sortBy = ref('name')
    const sortDir = ref('asc')
    const filterTerm = ref('')
    const markInstance = ref(undefined)
    const tableRef = ref(undefined)

    const spaces = computed<SpaceResource[]>(() =>
      store.getters['runtime/spaces/spaces'].filter(
        (s: SpaceResource) =>
          (isPersonalSpaceResource(s) && s.isOwner(store.getters.user)) || isProjectSpaceResource(s)
      )
    )

    const loadResourcesTask = useTask(function* () {
      store.commit('Files/CLEAR_FILES_SEARCHED')
      store.commit('Files/CLEAR_CURRENT_FILES_LIST')
      yield store.dispatch('runtime/spaces/reloadProjectSpaces', {
        graphClient: clientService.graphAuthenticated
      })
      store.commit('Files/LOAD_FILES', { currentFolder: null, files: unref(spaces) })
    })

    const areResourcesLoading = computed(() => {
      return loadResourcesTask.isRunning || !loadResourcesTask.last
    })

    const footerTextTotal = computed(() => {
      return $gettext('%{spaceCount} trashes in total', {
        spaceCount: unref(spaces).length.toString()
      })
    })
    const footerTextFilter = computed(() => {
      return $gettext('%{spaceCount} matching trashes', {
        spaceCount: unref(displaySpaces).length.toString()
      })
    })

    const breadcrumbs = computed(() => [
      { text: $gettext('Deleted files'), onClick: () => loadResourcesTask.perform() }
    ])

    const sort = (list: SpaceResource[], propName: string, desc: boolean) => {
      return [...list].sort((s1, s2) => {
        if (isPersonalSpaceResource(s1)) {
          return -1
        }
        if (isPersonalSpaceResource(s2)) {
          return +1
        }

        const a = s1[propName]
        const b = s2[propName]

        return desc ? b.localeCompare(a) : a.localeCompare(b)
      })
    }
    const displaySpaces = computed(() =>
      sort(filter(unref(spaces), unref(filterTerm)), unref(sortBy), unref(sortDir) === 'desc')
    )
    const handleSort = (event) => {
      sortBy.value = event.sortBy
      sortDir.value = event.sortDir
    }
    const filter = (spaces: SpaceResource[], filterTerm: string) => {
      if (!(filterTerm || '').trim()) {
        return spaces
      }
      const searchEngine = new Fuse(spaces, { ...defaultFuseOptions, keys: ['name'] })
      return searchEngine.search(filterTerm).map((r) => r.item)
    }

    const fields = computed((): FieldType[] => [
      {
        name: 'icon',
        title: '',
        type: 'slot',
        width: 'shrink'
      },
      {
        name: 'name',
        title: $gettext('Name'),
        type: 'slot',
        sortable: true
      }
    ])

    const getSpaceName = (space: SpaceResource) => {
      if (isPersonalSpaceResource(space)) {
        return $gettext('Personal')
      }
      if (space.disabled === true) {
        return $gettext('%{spaceName} (disabled)', { spaceName: space.name })
      }

      return space.name
    }

    const getSpaceAttributes = (space: SpaceResource) => {
      if (isProjectSpaceResource(space) && space.disabled === true) {
        return {
          disabled: true
        }
      }

      return {
        type: 'router-link',
        to: getTrashLink(space)
      }
    }

    const getTrashLink = (space: SpaceResource) => {
      return createLocationTrash('files-trash-generic', {
        ...createFileRouteOptions(space, { fileId: space.fileId })
      })
    }

    onMounted(async () => {
      if (unref(spaces).length === 1 && !isProjectSpaceResource(unref(spaces)[0])) {
        return router.push(getTrashLink(unref(spaces).pop()))
      }

      await loadResourcesTask.perform()
      await nextTick()
      markInstance.value = new Mark(unref(tableRef)?.$el)
    })

    watch(filterTerm, () => {
      const instance = unref(markInstance)
      if (!instance) {
        return
      }
      instance.unmark()
      instance.mark(unref(filterTerm), {
        element: 'span',
        className: 'highlight-mark',
        exclude: ['th *', 'tfoot *']
      })
    })

    return {
      sortBy,
      sortDir,
      filterTerm,
      footerTextTotal,
      footerTextFilter,
      fields,
      tableRef,
      spaces,
      filter,
      handleSort,
      displaySpaces,
      breadcrumbs,
      getSpaceName,
      getTrashLink,
      getSpaceAttributes,
      loadResourcesTask,
      areResourcesLoading,
      isPersonalSpaceResource,
      fileListHeaderY
    }
  }
})
</script>

<style lang="scss">
#spaces-filter {
  width: 16rem;
}

.highlight-mark {
  font-weight: 600;
}
</style>
