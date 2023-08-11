<template>
  <div id="user-list">
    <oc-text-input
      id="users-filter"
      v-model="filterTerm"
      class="oc-ml-m oc-my-s"
      :label="$gettext('Search')"
      autocomplete="off"
    />
    <slot name="filter" />
    <no-content-message v-if="!users.length" icon="user">
      <template #message>
        <span v-text="$gettext('No users in here')" />
      </template>
    </no-content-message>
    <oc-table
      v-else
      ref="tableRef"
      class="users-table"
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
          :label="$gettext('Select all users')"
          :model-value="allUsersSelected"
          hide-label
          @update:model-value="
            allUsersSelected ? $emit('unSelectAllUsers') : $emit('selectUsers', paginatedItems)
          "
        />
      </template>
      <template #select="{ item }">
        <oc-checkbox
          class="oc-ml-s"
          size="large"
          :model-value="isUserSelected(item)"
          :option="item"
          :label="getSelectUserLabel(item)"
          hide-label
          @update:model-value="toggleUser(item)"
          @click.stop="rowClicked([item, $event])"
        />
      </template>
      <template #avatar="{ item }">
        <avatar-image :width="32" :userid="item.id" :user-name="item.displayName" />
      </template>
      <template #role="{ item }">
        <template v-if="item.appRoleAssignments">{{ getRoleDisplayNameByUser(item) }}</template>
      </template>
      <template #accountEnabled="{ item }">
        <span v-if="item.accountEnabled === false" class="oc-flex oc-flex-middle">
          <oc-icon name="stop-circle" fill-type="line" class="oc-mr-s" /><span
            v-text="$gettext('Forbidden')"
          />
        </span>
        <span v-else class="oc-flex oc-flex-middle">
          <oc-icon name="play-circle" fill-type="line" class="oc-mr-s" /><span
            v-text="$gettext('Allowed')"
          />
        </span>
      </template>
      <template #actions="{ item }">
        <oc-button
          v-oc-tooltip="$gettext('Details')"
          appearance="raw"
          class="oc-mr-xs quick-action-button oc-p-xs users-table-btn-details"
          @click="showDetails(item)"
        >
          <oc-icon name="information" fill-type="line" /></oc-button
        ><oc-button
          v-oc-tooltip="$gettext('Edit')"
          appearance="raw"
          class="oc-mr-xs quick-action-button oc-p-xs users-table-btn-edit"
          @click="showEditPanel(item)"
        >
          <oc-icon name="pencil" fill-type="line" />
        </oc-button>
        <context-menu-quick-action
          ref="contextMenuButtonRef"
          :item="item"
          class="users-table-btn-action-dropdown"
          @quick-action-clicked="showContextMenuOnBtnClick($event, item)"
        >
          <template #contextMenu>
            <slot name="contextMenu" :user="item" />
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
import { useGettext } from 'vue3-gettext'
import {
  defineComponent,
  PropType,
  ref,
  unref,
  ComponentPublicInstance,
  watch,
  computed
} from 'vue'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import { defaultFuseOptions, displayPositionedDropdown, eventBus, SortDir } from 'web-pkg'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { AppRole, User } from 'web-client/src/generated'
import ContextMenuQuickAction from 'web-pkg/src/components/ContextActions/ContextMenuQuickAction.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useFileListHeaderPosition, usePagination } from 'web-pkg/src/composables'
import Pagination from 'web-pkg/src/components/Pagination.vue'
import { perPageDefault, perPageStoragePrefix } from 'web-app-admin-settings/src/defaults'
import {
  useKeyboardTableNavigation,
  useKeyboardTableMouseActions
} from 'web-app-admin-settings/src/composables/keyboardActions'
import { useKeyboardActions } from 'web-pkg/src/composables/keyboardActions'
import { findIndex } from 'lodash-es'

export default defineComponent({
  name: 'UsersList',
  components: { ContextMenuQuickAction, NoContentMessage, Pagination },
  props: {
    users: {
      type: Array as PropType<User[]>,
      required: true
    },
    roles: {
      type: Array as PropType<AppRole[]>,
      required: true
    },
    selectedUsers: {
      type: Array as PropType<User[]>,
      required: true
    }
  },
  emits: ['unSelectAllUsers', 'selectUsers', 'toggleSelectUser'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()

    const contextMenuButtonRef = ref(undefined)
    const filterTerm = ref<string>('')
    const sortBy = ref<string>('onPremisesSamAccountName')
    const sortDir = ref<string>(SortDir.Asc)
    const { y: fileListHeaderY } = useFileListHeaderPosition('#admin-settings-app-bar')

    const lastSelectedUserIndex = ref(0)
    const lastSelectedUserId = ref(null)

    const isUserSelected = (user) => {
      return props.selectedUsers.some((s) => s.id === user.id)
    }
    const selectUser = (user) => {
      emit('unSelectAllUsers')
      emit('toggleSelectUser', user)
    }

    const showDetails = (user) => {
      if (!isUserSelected(user)) {
        selectUser(user)
      }
      eventBus.publish(SideBarEventTopics.open)
    }

    const showEditPanel = (user) => {
      if (!isUserSelected(user)) {
        selectUser(user)
      }
      eventBus.publish(SideBarEventTopics.openWithPanel, 'EditPanel')
    }

    const showGroupAssigmentPanel = (user) => {
      if (!isUserSelected(user)) {
        selectUser(user)
      }
      eventBus.publish(SideBarEventTopics.openWithPanel, 'GroupAssignmentsPanel')
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
      toggleUser(resource, true)
    }
    const showContextMenuOnBtnClick = (data, user) => {
      const { dropdown, event } = data
      if (dropdown?.tippy === undefined) {
        return
      }
      if (!isUserSelected(user)) {
        selectUser(user)
      }
      displayPositionedDropdown(dropdown.tippy, event, unref(contextMenuButtonRef))
    }
    const showContextMenuOnRightClick = (row, event, user) => {
      event.preventDefault()
      const dropdown = row.$el.getElementsByClassName('users-table-btn-action-dropdown')[0]
      if (dropdown === undefined) {
        return
      }
      if (!isUserSelected(user)) {
        selectUser(user)
      }
      displayPositionedDropdown(dropdown._tippy, event, unref(contextMenuButtonRef))
    }

    const filter = (users: User[], filterTerm: string) => {
      if (!(filterTerm || '').trim()) {
        return users
      }
      const usersSearchEngine = new Fuse(users, {
        ...defaultFuseOptions,
        keys: ['displayName', 'mail', 'onPremisesSamAccountName', 'role.displayName']
      })

      return usersSearchEngine.search(filterTerm).map((r) => r.item)
    }

    const getRoleDisplayNameByUser = (user: User) => {
      const assignedRole = user.appRoleAssignments[0]

      return (
        $gettext(
          props.roles.find((role) => role.id === assignedRole?.appRoleId)?.displayName || ''
        ) || '-'
      )
    }

    const orderBy = (list, prop, desc) => {
      return [...list].sort((user1, user2) => {
        let a, b

        switch (prop) {
          case 'role':
            a = getRoleDisplayNameByUser(user1)
            b = getRoleDisplayNameByUser(user2)
            break
          case 'accountEnabled':
            a = ('accountEnabled' in user1 ? user1.accountEnabled : true).toString()
            b = ('accountEnabled' in user2 ? user2.accountEnabled : true).toString()
            break
          default:
            a = user1[prop] || ''
            b = user2[prop] || ''
        }

        return desc ? b.localeCompare(a) : a.localeCompare(b)
      })
    }

    const items = computed(() => {
      return orderBy(
        filter(props.users, unref(filterTerm)),
        unref(sortBy),
        unref(sortDir) === SortDir.Desc
      )
    })

    const {
      items: paginatedItems,
      page: currentPage,
      total: totalPages
    } = usePagination({ items, perPageDefault, perPageStoragePrefix })

    watch(currentPage, () => {
      emit('unSelectAllUsers')
    })

    const keyActions = useKeyboardActions()
    useKeyboardTableNavigation(
      keyActions,
      paginatedItems,
      props.selectedUsers,
      lastSelectedUserIndex,
      lastSelectedUserId
    )
    useKeyboardTableMouseActions(
      keyActions,
      paginatedItems,
      props.selectedUsers,
      lastSelectedUserIndex,
      lastSelectedUserId
    )

    const toggleUser = (user, deselect = false) => {
      lastSelectedUserIndex.value = findIndex(props.users, (u) => u.id === user.id)
      lastSelectedUserId.value = user.id
      keyActions.resetSelectionCursor()
      emit('toggleSelectUser', user, deselect)
    }

    return {
      showDetails,
      showEditPanel,
      showGroupAssigmentPanel,
      isUserSelected,
      rowClicked,
      toggleUser,
      contextMenuButtonRef,
      showContextMenuOnBtnClick,
      showContextMenuOnRightClick,
      fileListHeaderY,
      getRoleDisplayNameByUser,
      items,
      filterTerm,
      sortBy,
      sortDir,
      paginatedItems,
      currentPage,
      totalPages,
      filter,
      orderBy
    }
  },
  data() {
    return {
      markInstance: null
    }
  },
  computed: {
    allUsersSelected() {
      return this.paginatedItems.length === this.selectedUsers.length
    },
    footerTextTotal() {
      return this.$gettext('%{userCount} users in total', {
        userCount: this.users.length.toString()
      })
    },
    footerTextFilter() {
      return this.$gettext('%{userCount} matching users', {
        userCount: this.items.length.toString()
      })
    },
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
          name: 'onPremisesSamAccountName',
          title: this.$gettext('User name'),
          sortable: true
        },
        {
          name: 'displayName',
          title: this.$gettext('First and last name'),
          sortable: true
        },
        {
          name: 'mail',
          title: this.$gettext('Email'),
          sortable: true
        },
        {
          name: 'role',
          title: this.$gettext('Role'),
          type: 'slot',
          sortable: true
        },
        {
          name: 'accountEnabled',
          title: this.$gettext('Login'),
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
    highlighted() {
      return this.selectedUsers.map((user) => user.id)
    }
  },
  watch: {
    async filterTerm() {
      if (!this.$refs.tableRef) {
        return
      }

      await this.$router.push({ ...this.$route, query: { ...this.$route.query, page: '1' } })
      this.markInstance = new Mark((this.$refs.tableRef as ComponentPublicInstance).$el)
      this.markInstance.unmark()
      this.markInstance.mark(this.filterTerm, {
        element: 'span',
        className: 'highlight-mark',
        exclude: ['th *', 'tfoot *']
      })
    }
  },
  methods: {
    handleSort(event) {
      this.sortBy = event.sortBy
      this.sortDir = event.sortDir
    },
    getSelectUserLabel(user) {
      return this.$gettext('Select %{ user }', { user: user.displayName }, true)
    }
  }
})
</script>

<style lang="scss">
#users-filter {
  width: 16rem;
}

.highlight-mark {
  font-weight: 600;
}

.users-table {
  .oc-table-header-cell-actions,
  .oc-table-data-cell-actions {
    white-space: nowrap;
  }

  .oc-table-header-cell-role,
  .oc-table-data-cell-role,
  .oc-table-header-cell-accountEnabled,
  .oc-table-data-cell-accountEnabled {
    display: none;

    @media only screen and (min-width: 1200px) {
      display: table-cell;
    }
  }

  .oc-table-header-cell-displayName,
  .oc-table-data-cell-displayName {
    display: none;

    @media only screen and (min-width: 1000px) {
      display: table-cell;
    }
  }

  &-squashed {
    .oc-table-header-cell-role,
    .oc-table-data-cell-role,
    .oc-table-header-cell-accountEnabled,
    .oc-table-data-cell-accountEnabled {
      display: none;

      @media only screen and (min-width: 1600px) {
        display: table-cell;
      }
    }

    .oc-table-header-cell-displayName,
    .oc-table-data-cell-displayName {
      display: none;

      @media only screen and (min-width: 1400px) {
        display: table-cell;
      }
    }

    .oc-table-header-cell-mail,
    .oc-table-data-cell-mail {
      display: none;

      @media only screen and (min-width: 1200px) {
        display: table-cell;
      }
    }
  }
}
</style>
