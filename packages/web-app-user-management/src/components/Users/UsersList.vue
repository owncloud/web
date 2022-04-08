<template>
  <oc-table
    :sort-by="sortBy"
    :sort-dir="sortDir"
    :fields="fields"
    :data="data"
    :highlighted="highlighted"
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
    <template #role="{ item }"> {{ getUserRole(item) }} </template>
    <template #actions="{ item }">
      <oc-button v-oc-tooltip="$gettext('Details')" @click="$emit('clickDetails', item)">
        <oc-icon size="small" name="information" />
      </oc-button>
      <oc-button v-oc-tooltip="$gettext('Edit')" class="oc-ml-s" @click="$emit('clickEdit', item)">
        <oc-icon size="small" name="pencil" />
      </oc-button>
    </template>
    <template #footer>
      <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
        <p class="oc-text-muted">{{ footerText }}</p>
      </div>
    </template>
  </oc-table>
</template>

<script>
export default {
  name: 'UsersList',
  props: {
    users: {
      type: Array,
      required: true
    },
    userRoles: {
      type: Object,
      required: true
    },
    selectedUsers: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      sortBy: 'onPremisesSamAccountName',
      sortDir: 'asc'
    }
  },
  computed: {
    allUsersSelected() {
      return this.users.length === this.selectedUsers.length
    },
    footerText() {
      const translated = this.$gettext('%{userCount} users in total')
      return this.$gettextInterpolate(translated, { userCount: this.users.length })
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
          title: this.$gettext('Fist and last name'),
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
          name: 'status',
          title: this.$gettext('Status'),
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
      return this.orderBy(this.users, this.sortBy, this.sortDir === 'desc')
    },
    highlighted() {
      return this.selectedUsers.map((user) => user.id)
    }
  },
  methods: {
    orderBy(list, prop, desc) {
      return [...list].sort((user1, user2) => {
        if (prop === 'role') {
          const role1 = this.getUserRole(user1)
          const role2 = this.getUserRole(user2)
          return desc ? role2.localeCompare(role1) : role1.localeCompare(role2)
        }

        const a = user1[prop] || ''
        const b = user2[prop] || ''

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
    },
    getUserRole(user) {
      return user.id in this.userRoles ? this.userRoles[user.id].displayName : ''
    }
  }
}
</script>
