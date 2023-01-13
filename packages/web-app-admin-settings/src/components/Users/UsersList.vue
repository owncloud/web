<template>
  <div>
    <oc-text-input
      id="users-filter"
      v-model="filterTerm"
      class="oc-ml-m oc-my-s"
      :label="$gettext('Filter users')"
      autocomplete="off"
    />
    <oc-table
      ref="table"
      class="users-table"
      :sort-by="sortBy"
      :sort-dir="sortDir"
      :fields="fields"
      :data="data"
      :highlighted="highlighted"
      :sticky="true"
      :header-position="headerPosition"
      @sort="handleSort"
    >
      <template #selectHeader>
        <oc-checkbox
          size="large"
          class="oc-ml-s"
          :label="$gettext('Select all users')"
          :value="allUsersSelected"
          hide-label
          @input="$emit('toggleSelectAllUsers')"
        />
      </template>
      <template #select="{ item }">
        <oc-checkbox
          class="oc-ml-s"
          size="large"
          :value="selectedUsers"
          :option="item"
          :label="getSelectUserLabel(item)"
          hide-label
          @input="$emit('toggleSelectUser', item)"
        />
      </template>
      <template #avatar="{ item }">
        <avatar-image :width="32" :userid="item.id" :user-name="item.displayName" />
      </template>
      <template #role="{ item }">
        <template v-if="item.role">{{ item.role.displayName }}</template>
      </template>
      <template #actions="{ item }">
        <oc-button
          v-oc-tooltip="$gettext('Details')"
          appearance="raw"
          class="oc-mr-xs quick-action-button oc-p-xs"
          @click="$emit('showPanel', { user: item, panel: 'DetailsPanel' })"
        >
          <oc-icon name="information" fill-type="line" /></oc-button
        ><oc-button
          v-oc-tooltip="$gettext('Group assignments')"
          appearance="raw"
          class="oc-mr-xs quick-action-button oc-p-xs"
          @click="$emit('showPanel', { user: item, panel: 'GroupAssignmentsPanel' })"
        >
          <oc-icon name="group-2" fill-type="line" /></oc-button
        ><oc-button
          v-oc-tooltip="$gettext('Edit')"
          appearance="raw"
          class="oc-mr-xs quick-action-button oc-p-xs"
          @click="$emit('showPanel', { user: item, panel: 'EditPanel' })"
        >
          <oc-icon name="pencil" fill-type="line" />
        </oc-button>
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
import { defineComponent } from 'vue'

import Fuse from 'fuse.js'
import Mark from 'mark.js'

export default defineComponent({
  name: 'UsersList',
  props: {
    users: {
      type: Array,
      required: true
    },
    selectedUsers: {
      type: Array,
      required: true
    },
    headerPosition: {
      type: Number,
      required: true
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
      const translated = this.$gettext('%{userCount} users in total')
      return this.$gettextInterpolate(translated, { userCount: this.users.length })
    },
    footerTextFilter() {
      const translated = this.$gettext('%{userCount} matching users')
      return this.$gettextInterpolate(translated, { userCount: this.data.length })
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
          name: 'actions',
          title: this.$gettext('Actions'),
          sortable: false,
          type: 'slot',
          alignH: 'right'
        }
      ]
    },
    data() {
      const orderedUsers = this.orderBy(this.users, this.sortBy, this.sortDir === 'desc')
      return this.filter(orderedUsers, this.filterTerm)
    },
    highlighted() {
      return this.selectedUsers.map((user) => user.id)
    }
  },
  watch: {
    filterTerm() {
      if (!this.markInstance) {
        return
      }
      this.markInstance.unmark()
      this.markInstance.mark(this.filterTerm, {
        element: 'span',
        className: 'highlight-mark',
        exclude: ['th *', 'tfoot *']
      })
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.markInstance = new Mark(this.$refs.table.$el)
    })
  },
  methods: {
    filter(users, filterTerm) {
      if (!(filterTerm || '').trim()) {
        return users
      }
      const usersSearchEngine = new Fuse(users, {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.3,
        keys: ['displayName', 'mail', 'onPremisesSamAccountName', 'role.displayName']
      })

      return usersSearchEngine.search(filterTerm).map((r) => r.item)
    },
    orderBy(list, prop, desc) {
      return [...list].sort((user1, user2) => {
        let a, b

        if (prop === 'role') {
          a = user1.role?.displayName || ''
          b = user2.role?.displayName || ''
        } else {
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
      const translated = this.$gettext('Select %{ user }')

      return this.$gettextInterpolate(translated, { user: user.displayName }, true)
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
  .oc-table-data-cell-role {
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
    .oc-table-data-cell-role {
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
