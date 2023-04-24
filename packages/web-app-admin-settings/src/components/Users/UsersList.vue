<template>
  <div>
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
      :data="data"
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
          @update:model-value="$emit('toggleSelectAllUsers')"
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
          @update:model-value="$emit('toggleSelectUser', item)"
          @click.stop
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
        <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
          <p class="oc-text-muted">{{ footerTextTotal }}</p>
          <p v-if="filterTerm" class="oc-text-muted">{{ footerTextFilter }}</p>
        </div>
      </template>
    </oc-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, unref, ComponentPublicInstance } from 'vue'
import Fuse from 'fuse.js'
import Mark from 'mark.js'
import { defaultFuseOptions, displayPositionedDropdown, eventBus } from 'web-pkg'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { AppRole, User } from 'web-client/src/generated'
import ContextMenuQuickAction from 'web-pkg/src/components/ContextActions/ContextMenuQuickAction.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useFileListHeaderPosition } from 'web-pkg/src/composables'

export default defineComponent({
  name: 'UsersList',
  components: { ContextMenuQuickAction, NoContentMessage },
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
  emits: ['unSelectAllUsers', 'toggleSelectAllUsers', 'toggleSelectUser'],
  setup(props, { emit }) {
    const contextMenuButtonRef = ref(undefined)
    const { y: fileListHeaderY } = useFileListHeaderPosition('#admin-settings-app-bar')
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
      const user = data[0]
      if (!isUserSelected(user)) {
        selectUser(user)
      }
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

    return {
      showDetails,
      showEditPanel,
      showGroupAssigmentPanel,
      isUserSelected,
      rowClicked,
      contextMenuButtonRef,
      showContextMenuOnBtnClick,
      showContextMenuOnRightClick,
      fileListHeaderY
    }
  },
  data() {
    return {
      sortBy: 'onPremisesSamAccountName',
      sortDir: 'asc',
      markInstance: null,
      filterTerm: ''
    }
  },
  computed: {
    allUsersSelected() {
      return this.users.length === this.selectedUsers.length
    },
    footerTextTotal() {
      return this.$gettext('%{userCount} users in total', {
        userCount: this.users.length.toString()
      })
    },
    footerTextFilter() {
      return this.$gettext('%{userCount} matching users', {
        userCount: this.data.length.toString()
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
    data() {
      return this.orderBy(
        this.filter(this.users, this.filterTerm),
        this.sortBy,
        this.sortDir === 'desc'
      )
    },
    highlighted() {
      return this.selectedUsers.map((user) => user.id)
    }
  },
  watch: {
    filterTerm() {
      if (this.$refs.tableRef) {
        this.markInstance = new Mark((this.$refs.tableRef as ComponentPublicInstance).$el)
        this.markInstance.unmark()
        this.markInstance.mark(this.filterTerm, {
          element: 'span',
          className: 'highlight-mark',
          exclude: ['th *', 'tfoot *']
        })
      }
    }
  },
  methods: {
    filter(users, filterTerm) {
      if (!(filterTerm || '').trim()) {
        return users
      }
      const usersSearchEngine = new Fuse(users, {
        ...defaultFuseOptions,
        keys: ['displayName', 'mail', 'onPremisesSamAccountName', 'role.displayName']
      })

      return usersSearchEngine.search(filterTerm).map((r) => r.item)
    },
    orderBy(list, prop, desc) {
      return [...list].sort((user1, user2) => {
        let a, b

        switch (prop) {
          case 'role':
            a = this.getRoleDisplayNameByUser(user1)
            b = this.getRoleDisplayNameByUser(user2)
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
    },
    handleSort(event) {
      this.sortBy = event.sortBy
      this.sortDir = event.sortDir
    },
    getSelectUserLabel(user) {
      return this.$gettext('Select %{ user }', { user: user.displayName }, true)
    },
    getRoleDisplayNameByUser(user) {
      const assignedRole = user.appRoleAssignments[0]

      return (
        this.$gettext(
          this.roles.find((role) => role.id === assignedRole?.appRoleId)?.displayName || ''
        ) || '-'
      )
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
