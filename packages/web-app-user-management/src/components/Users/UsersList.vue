<template>
  <div>
    <oc-table-simple id="user-list" class="oc-mt-l">
      <oc-thead>
        <oc-tr>
          <oc-th shrink type="head" align-h="center">
            <oc-checkbox
              class="oc-ml-s"
              :value="true"
              :label="$gettext('Select all users')"
              hide-label
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
        <users-list-row v-for="user in users" :key="`user-list-row-${user.id}`" :user="user" />
      </oc-tbody>
    </oc-table-simple>
  </div>
</template>

<script>
import UsersListRow from './UsersListRow.vue'

export default {
  name: 'UsersList',
  components: { UsersListRow },
  props: {
    users: {
      type: Array,
      required: true
    }
  }
}
</script>
