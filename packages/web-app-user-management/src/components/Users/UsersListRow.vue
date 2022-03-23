<template>
  <oc-tr>
    <oc-td align-h="center">
      <oc-checkbox
        class="oc-ml-s"
        size="large"
        :value="selectedUsers"
        :option="user"
        :label="selectUserLabel"
        hide-label
        @input="toggleSelectedUser"
      />
    </oc-td>
    <oc-td>
      <avatar-image :width="32" :userid="user.id" :user-name="user.displayName" />
    </oc-td>
    <oc-td v-text="user.onPremisesSamAccountName" />
    <oc-td v-text="user.displayName || '-'" />
    <oc-td v-text="user.mail" />
    <oc-td></oc-td>
    <oc-td></oc-td>
  </oc-tr>
</template>

<script>
import { bus } from 'web-pkg/src/instance'

export default {
  name: 'UserListRow',

  props: {
    user: {
      type: Object,
      required: true
    },
    selectedUsers: {
      type: Array,
      required: true
    }
  },
  computed: {
    selectUserLabel() {
      const translated = this.$gettext('Select %{ user }')

      return this.$gettextInterpolate(translated, { group: this.user.displayName }, true)
    }
  },
  methods: {
    toggleSelectedUser() {
      bus.publish('app.user-management.users.toggle', this.user)
    }
  }
}
</script>
