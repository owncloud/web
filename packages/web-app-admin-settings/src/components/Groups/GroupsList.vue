<template>
  <div id="group-list">
    <div class="group-filters oc-flex oc-flex-right oc-flex-wrap oc-flex-bottom oc-mx-m oc-mb-m">
      <oc-text-input
        id="groups-filter"
        v-model="filterTerm"
        :label="$gettext('Search')"
        autocomplete="off"
      />
    </div>
    <oc-table
      :sort-by="sortBy"
      :sort-dir="sortDir"
      :fields="fields"
      :data="paginatedItems"
      :highlighted="highlighted"
      :sticky="true"
      :header-position="fileListHeaderY"
      :hover="true"
      @sort="handleSort"
      @contextmenu-clicked="showContextMenuOnRightClick"
      @highlight="rowClicked"
    >
      <template #selectHeader>
        <oc-checkbox
          size="large"
          class="oc-ml-s"
          :label="$gettext('Select all groups')"
          :model-value="allGroupsSelected"
          hide-label
          @update:model-value="
            allGroupsSelected ? $emit('unSelectAllGroups') : $emit('selectGroups', paginatedItems)
          "
        />
      </template>
      <template #select="rowData">
        <oc-checkbox
          class="oc-ml-s"
          size="large"
          :model-value="isGroupSelected(rowData.item)"
          :option="rowData.item"
          :label="getSelectGroupLabel(rowData.item)"
          hide-label
          @update:model-value="toggleGroup(rowData.item)"
          @click.stop="rowClicked([rowData.item, $event])"
        />
      </template>
      <template #avatar="rowData">
        <avatar-image :width="32" :userid="rowData.item.id" :user-name="rowData.item.displayName" />
      </template>
      <template #displayName="rowData">
        <div class="oc-flex oc-flex-middle">
          {{ rowData.item.displayName }}
          <oc-icon
            v-if="rowData.item.groupTypes?.includes('ReadOnly')"
            v-oc-tooltip="readOnlyLabel"
            name="lock"
            size="small"
            fill-type="line"
            class="oc-ml-s"
            :accessible-label="readOnlyLabel"
          />
        </div>
      </template>
      <template #members="rowData">
        {{ rowData.item.members.length }}
      </template>
      <template #actions="{ item }">
        <oc-button
          v-oc-tooltip="$gettext('Details')"
          appearance="raw"
          class="oc-mr-xs groups-table-btn-details oc-p-xs"
          @click="showDetails(item)"
        >
          <oc-icon name="information" fill-type="line" />
        </oc-button>
        <oc-button
          v-if="!item.groupTypes?.includes('ReadOnly')"
          v-oc-tooltip="$gettext('Edit')"
          appearance="raw"
          class="oc-mr-xs quick-action-button oc-p-xs groups-table-btn-edit"
          @click="showEditPanel(item)"
        >
          <oc-icon name="pencil" fill-type="line" />
        </oc-button>
        <context-menu-quick-action
          ref="contextMenuButtonRef"
          :item="item"
          class="groups-table-btn-action-dropdown"
          @quick-action-clicked="showContextMenuOnBtnClick($event, item)"
        >
          <template #contextMenu>
            <slot name="contextMenu" :group="item" />
          </template>
        </context-menu-quick-action>
      </template>
      <template #footer>
        <pagination :pages="totalPages" :current-page="currentPage" />
        <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
          <p class="oc-text-muted">{{ footerTextTotal }}</p>
          <p v-if="filterTerm" class="oc-text-muted">{{ footerTextFilter }}</p>
        </div>
      </template>
    </oc-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, unref, computed, watch } from 'vue'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import {
  displayPositionedDropdown,
  eventBus,
  SortDir,
  useRoute,
  useRouter
} from '@ownclouders/web-pkg'
import { SideBarEventTopics } from '@ownclouders/web-pkg'
import { Group } from '@ownclouders/web-client/src/generated'
import { ContextMenuQuickAction } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { defaultFuseOptions } from '@ownclouders/web-pkg'
import { useFileListHeaderPosition, usePagination } from '@ownclouders/web-pkg'
import { Pagination } from '@ownclouders/web-pkg'
import { perPageDefault, perPageStoragePrefix } from 'web-app-admin-settings/src/defaults'
import { useKeyboardActions } from '@ownclouders/web-pkg'
import {
  useKeyboardTableMouseActions,
  useKeyboardTableNavigation
} from 'web-app-admin-settings/src/composables/keyboardActions'
import { findIndex } from 'lodash-es'

export default defineComponent({
  name: 'GroupsList',
  components: { ContextMenuQuickAction, Pagination },
  props: {
    groups: {
      type: Array as PropType<Group[]>,
      required: true
    },
    selectedGroups: {
      type: Array as PropType<Group[]>,
      required: true
    }
  },
  emits: ['selectGroups', 'unSelectAllGroups', 'toggleSelectGroup'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    const { y: fileListHeaderY } = useFileListHeaderPosition('#admin-settings-app-bar')
    const contextMenuButtonRef = ref(undefined)
    const sortBy = ref<string>('displayName')
    const sortDir = ref<string>(SortDir.Asc)
    const filterTerm = ref<string>('')
    const router = useRouter()
    const route = useRoute()
    const markInstance = ref(null)

    const lastSelectedGroupIndex = ref(0)
    const lastSelectedGroupId = ref(null)

    const isGroupSelected = (group) => {
      return props.selectedGroups.some((s) => s.id === group.id)
    }
    const selectGroup = (group) => {
      emit('unSelectAllGroups')
      emit('toggleSelectGroup', group)
    }

    const showDetails = (group) => {
      if (!isGroupSelected(group)) {
        selectGroup(group)
      }
      eventBus.publish(SideBarEventTopics.open)
    }
    const rowClicked = (data) => {
      const resource = data[0]
      const eventData = data[1]
      const isCheckboxClicked = eventData?.target.getAttribute('type') === 'checkbox'

      const contextActionClicked = eventData?.target?.closest('div')?.id === 'oc-files-context-menu'
      if (contextActionClicked) {
        return
      }

      if (eventData?.metaKey) {
        return eventBus.publish('app.resources.list.clicked.meta', resource)
      }
      if (eventData?.shiftKey) {
        return eventBus.publish('app.resources.list.clicked.shift', {
          resource,
          skipTargetSelection: isCheckboxClicked
        })
      }
      if (isCheckboxClicked) {
        return
      }
      toggleGroup(resource, true)
    }
    const showContextMenuOnBtnClick = (data, group) => {
      const { dropdown, event } = data
      if (dropdown?.tippy === undefined) {
        return
      }
      if (!isGroupSelected(group)) {
        selectGroup(group)
      }
      displayPositionedDropdown(dropdown.tippy, event, unref(contextMenuButtonRef))
    }
    const showContextMenuOnRightClick = (row, event, group) => {
      event.preventDefault()
      const dropdown = row.$el.getElementsByClassName('groups-table-btn-action-dropdown')[0]
      if (dropdown === undefined) {
        return
      }
      if (!isGroupSelected(group)) {
        selectGroup(group)
      }
      displayPositionedDropdown(dropdown._tippy, event, unref(contextMenuButtonRef))
    }

    const showEditPanel = (group) => {
      if (!isGroupSelected(group)) {
        selectGroup(group)
      }
      eventBus.publish(SideBarEventTopics.openWithPanel, 'EditPanel')
    }

    const readOnlyLabel = computed(() => $gettext("This group is read-only and can't be edited"))

    const filter = (groups: Group[], filterTerm: string) => {
      if (!(filterTerm || '').trim()) {
        return groups
      }
      const groupsSearchEngine = new Fuse(groups, { ...defaultFuseOptions, keys: ['displayName'] })
      return groupsSearchEngine.search(filterTerm).map((r) => r.item)
    }

    const orderBy = (list, prop, desc) => {
      return [...list].sort((a, b) => {
        a = a[prop]?.toString() || ''
        b = b[prop]?.toString() || ''
        return desc ? b.localeCompare(a) : a.localeCompare(b)
      })
    }

    const items = computed(() => {
      return orderBy(
        filter(props.groups, unref(filterTerm)),
        unref(sortBy),
        unref(sortDir) === SortDir.Desc
      )
    })

    const {
      items: paginatedItems,
      page: currentPage,
      total: totalPages
    } = usePagination({ items, perPageDefault, perPageStoragePrefix })

    const keyActions = useKeyboardActions()
    useKeyboardTableNavigation(
      keyActions,
      paginatedItems,
      props.selectedGroups,
      lastSelectedGroupIndex,
      lastSelectedGroupId
    )
    useKeyboardTableMouseActions(
      keyActions,
      paginatedItems,
      props.selectedGroups,
      lastSelectedGroupIndex,
      lastSelectedGroupId
    )

    const toggleGroup = (group, deselect = false) => {
      lastSelectedGroupIndex.value = findIndex(props.groups, (u) => u.id === group.id)
      lastSelectedGroupId.value = group.id
      keyActions.resetSelectionCursor()
      emit('toggleSelectGroup', group, deselect)
    }

    watch(currentPage, () => {
      emit('unSelectAllGroups')
    })

    watch(filterTerm, async () => {
      await unref(router).push({ ...unref(route), query: { ...unref(route).query, page: '1' } })
    })

    watch([filterTerm, paginatedItems], () => {
      unref(markInstance)?.unmark()
      unref(markInstance)?.mark(unref(filterTerm), {
        element: 'span',
        className: 'highlight-mark'
      })
    })

    return {
      showDetails,
      rowClicked,
      isGroupSelected,
      showContextMenuOnBtnClick,
      showContextMenuOnRightClick,
      toggleGroup,
      fileListHeaderY,
      contextMenuButtonRef,
      showEditPanel,
      readOnlyLabel,
      filterTerm,
      sortBy,
      sortDir,
      items,
      paginatedItems,
      currentPage,
      totalPages,
      filter,
      orderBy,
      markInstance
    }
  },
  computed: {
    fields() {
      return [
        {
          name: 'select',
          title: '',
          type: 'slot',
          width: 'shrink',
          headerType: 'slot'
        },
        {
          name: 'avatar',
          title: '',
          type: 'slot',
          width: 'shrink'
        },
        {
          name: 'displayName',
          title: this.$gettext('Group name'),
          type: 'slot',
          sortable: true
        },
        {
          name: 'members',
          title: this.$gettext('Members'),
          type: 'slot',
          sortable: true
        },
        {
          name: 'actions',
          title: this.$gettext('Actions'),
          sortable: false,
          type: 'slot',
          alignH: 'right'
        }
      ]
    },
    allGroupsSelected() {
      return this.paginatedItems.length === this.selectedGroups.length
    },
    footerTextTotal() {
      return this.$gettext('%{groupCount} groups in total', {
        groupCount: this.groups.length.toString()
      })
    },
    footerTextFilter() {
      return this.$gettext('%{groupCount} matching groups', {
        groupCount: this.items.length.toString()
      })
    },
    highlighted() {
      return this.selectedGroups.map((group) => group.id)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.markInstance = new Mark('td.oc-table-data-cell-displayName')
    })
  },
  methods: {
    handleSort(event) {
      this.sortBy = event.sortBy
      this.sortDir = event.sortDir
    },
    getSelectGroupLabel(group) {
      return this.$gettext('Select %{ group }', { group: group.displayName }, true)
    }
  }
})
</script>

<style lang="scss">
#groups-filter {
  width: 16rem;
}

.highlight-mark {
  font-weight: 600;
}
</style>
