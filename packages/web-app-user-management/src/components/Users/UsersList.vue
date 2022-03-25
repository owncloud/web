<template>
  <div>
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
          @input="$emit('toggleSelectAllUser')"
        />
      </template>
      <template #select="rowData">
        <oc-checkbox
          class="oc-ml-s"
          size="large"
          :value="selectedUsers"
          :option="rowData.item"
          :label="getSelectUserLabel(rowData.item)"
          hide-label
          @input="$emit('toggleSelectUser', rowData.item)"
        />
      </template>
      <template #avatar="rowData">
        <avatar-image :width="32" :userid="rowData.item.id" :user-name="rowData.item.displayName" />
      </template>
      <template #footer>
        <div class="oc-text-nowrap oc-text-center oc-width-1-1 oc-my-s">
          <p class="oc-text-muted">{{ footerText }}</p>
        </div>
      </template>
    </oc-table>
  </div>
</template>

<script>
const orderBy = (list, prop, desc) => {
  return [...list].sort((a, b) => {
    a = a[prop]
    b = b[prop]

    if (a === b) return 0
    return (desc ? a > b : a < b) ? -1 : 1
  })
}

export default {
  name: 'UsersList',
  props: {
    users: {
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
    }
  }
}
</script>
