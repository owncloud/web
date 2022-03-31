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
    <template #role="{ item }"> {{ getUserRole(item.id) }} </template>
    <template #footer>
      <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
        <p class="oc-text-muted">{{ footerText }}</p>
      </div>
    </template>
  </oc-table>
</template>

<script>
const orderBy = (list, prop, desc) => {
  return [...list].sort((a, b) => {
    a = a[prop]
    b = b[prop]
    return desc ? b.localeCompare(a) : a.localeCompare(b)
  })
}

export default {
  name: 'UsersList',
  props: {
    users: {
      type: Array,
      required: true
    },
    roles: {
      type: Array,
      required: true
    },
    userAssignments: {
      type: Array,
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
          title: this.$gettext('Display name'),
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
        }
      ]
    },
    data() {
      return orderBy([...this.users], this.sortBy, this.sortDir === 'desc')
    },
    highlighted() {
      return this.selectedUsers.map((user) => user.id)
    }
  },
  methods: {
    handleSort(event) {
      this.sortBy = event.sortBy
      this.sortDir = event.sortDir
    },
    getSelectUserLabel(user) {
      const translated = this.$gettext('Select %{ user }')

      return this.$gettextInterpolate(translated, { user: user.displayName }, true)
    },
    getUserRole(user) {
      const userAssignmentList = this.userAssignments.find(
        (assignment) => assignment.accountUuid === user.id
      )

      if (!userAssignmentList) {
        return ''
      }

      const userRoleAssignment = userAssignmentList.find((assignment) => 'roleId' in assignment)

      if (!userRoleAssignment) {
        return ''
      }

      const role = this.roles.find((role) => role.id === userRoleAssignment.roleId)

      if (!role) {
        return ''
      }

      return role.displayName
    }
  }
}
</script>
