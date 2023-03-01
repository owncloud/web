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
      <div>
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
          :data="orderedSpaces"
          :sticky="true"
          :hover="true"
          @sort="handleSort"
        >
          <template #icon="{ item }">
            <oc-icon v-if="item.driveType === 'personal'" name="folder" />
            <oc-icon v-else name="layout-grid" />
          </template>
          <template #name="{ item }">
            <oc-button
              type="router-link"
              appearance="raw"
              :to="getTrashLink(item)"
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
      </div>
    </files-view-wrapper>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, ref, unref, watch } from 'vue'
import { buildSpace } from 'web-client/src/helpers'
import Mark from 'mark.js'
import Fuse from 'fuse.js'
import { useGettext } from 'vue3-gettext'
import { useTask } from 'vue-concurrency'
import { configurationManager, eventBus, useGraphClient } from 'web-pkg'
import { createLocationTrash } from 'web-app-files/src/router'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import AppBar from 'web-app-files/src/components/AppBar/AppBar.vue'
import FilesViewWrapper from 'web-app-files/src/components/FilesViewWrapper.vue'

export default defineComponent({
  name: 'TrashOverview',
  components: { FilesViewWrapper, AppBar },
  methods: { createLocationTrash },
  setup: function (props) {
    const { $gettext } = useGettext()
    const sortBy = ref('name')
    const sortDir = ref('asc')
    const filterTerm = ref('')
    const markInstance = ref(undefined)
    const tableRef = ref(undefined)
    const spaces = ref([])
    const { graphClient } = useGraphClient()

    const loadResourcesTask = useTask(function* (signal) {
      const {
        data: { value: drivesResponse }
      } = yield unref(graphClient).drives.listMyDrives()
      const drives = drivesResponse
        .map((space) => buildSpace({ ...space, serverUrl: configurationManager.serverUrl }))
        .filter((space) => space.driveType === 'project' || space.driveType === 'personal')
      spaces.value = orderBy(drives, 'name', 'asc')
    })

    const footerTextTotal = computed(() => {
      return $gettext('%{spaceCount} trashes in total', {
        spaceCount: unref(spaces).length.toString()
      })
    })
    const footerTextFilter = computed(() => {
      return $gettext('%{spaceCount} matching trashes', {
        spaceCount: unref(orderedSpaces).length
      })
    })

    const breadcrumbs = computed(() => [
      { text: $gettext('Deleted files'), onClick: () => loadResourcesTask.perform() }
    ])

    const orderBy = (list, prop, desc) => {
      return [...list].sort((s1, s2) => {
        let a, b

        if (prop === 'name') {
          if (s1.driveType === 'personal') {
            return s1
          }
          if (s2.driveType === 'personal') {
            return s2
          }
        }

        a = s1[prop]
        b = s2[prop]

        return desc ? b.localeCompare(a) : a.localeCompare(b)
      })
    }
    const orderedSpaces = computed(() =>
      orderBy(filter(unref(spaces), unref(filterTerm)), unref(sortBy), unref(sortDir) === 'desc')
    )
    const handleSort = (event) => {
      sortBy.value = event.sortBy
      sortDir.value = event.sortDir
    }
    const filter = (spaces, filterTerm) => {
      if (!(filterTerm || '').trim()) {
        return spaces
      }
      const searchEngine = new Fuse(spaces, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: ['name']
      })

      return searchEngine.search(filterTerm).map((r) => r.item)
    }

    const fields = computed(() => [
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

    const getSpaceName = (space) => {
      return space.driveType === 'personal' ? $gettext('Personal') : space.name
    }

    const getTrashLink = (space) => {
      return createLocationTrash('files-trash-generic', {
        ...createFileRouteOptions(space, { fileId: space.fileId })
      })
    }

    onMounted(async () => {
      await loadResourcesTask.perform()

      nextTick(() => {
        markInstance.value = new Mark(unref(tableRef).$el)
      })
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
      orderedSpaces,
      breadcrumbs,
      getSpaceName,
      getTrashLink
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
