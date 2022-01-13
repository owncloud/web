<template>
  <span :id="`files-role-${role.name}`" class="roles-select-role-item">
    <span class="oc-text-bold oc-display-block oc-width-1-1" v-text="$gettext(role.label)" />
    <span class="oc-m-rm" v-text="$gettext(role.description(allowSharePermission))" />
  </span>
</template>

<script>
import { ShareRole } from '../../../helpers/share'

export default {
  name: 'RoleItem',
  props: {
    role: {
      type: ShareRole,
      required: true
    },
    allowSharePermission: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.roles-select-role-item {
  text-align: left;
}
</style>
