<template>
  <div>
    <oc-table-simple id="user-list" class="oc-mt-l">
      <oc-thead>
        <oc-tr>
          <oc-th shrink type="head" align-h="center">
            <oc-checkbox
              size="large"
              class="oc-ml-s"
              :label="$gettext('Select all users')"
              :value="allUsersSelected"
              hide-label
              @input="toggleSelectAllUsers"
            />
          </oc-th>
          <oc-th shrink type="head" />
          <oc-th type="head" v-text="$gettext('User name')" />
          <oc-th type="head" v-text="$gettext('Display name')" />
          <oc-th type="head" v-text="$gettext('Email')" />
          <oc-th type="head" v-text="$gettext('Role')" />
          <oc-th type="head" v-text="$gettext('Status')" />
        </oc-tr>
      </oc-thead>
      <oc-tbody>
        <users-list-row
          v-for="user in users"
          :key="`user-list-row-${user.id}`"
          :user="user"
          :selected-users="selectedUsers"
        />
      </oc-tbody>
    </oc-table-simple>
  </div>
</template>

<script>
import UsersListRow from './UsersListRow.vue'
import { bus } from 'web-pkg/src/instance'

export default {
  name: 'UsersList',
  components: { UsersListRow },
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
  computed: {
    allUsersSelected() {
      return this.users.length === this.selectedUsers.length
    }
  },
  methods: {
    toggleSelectAllUsers() {
      bus.publish('app.user-management.users.toggle.users')
    }
  }
}
</script>
