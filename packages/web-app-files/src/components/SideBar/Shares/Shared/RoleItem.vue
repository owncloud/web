<template>
  <span :id="`files-role-${role.name}`" class="roles-select-role-item">
    <span class="oc-text-bold oc-display-block oc-width-1-1" v-text="$gettext(role.label)" />
    <span
      class="oc-m-rm oc-text-small oc-display-block"
      v-text="$gettext(role.description(allowSharePermission))"
    />
  </span>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ShareRole } from '@ownclouders/web-client/src/helpers/share'

export default defineComponent({
  name: 'RoleItem',
  props: {
    role: {
      type: Object as PropType<ShareRole>,
      required: true
    },
    allowSharePermission: {
      type: Boolean,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.roles-select-role-item {
  text-align: left;

  span {
    line-height: 1.3;
  }
}
</style>
