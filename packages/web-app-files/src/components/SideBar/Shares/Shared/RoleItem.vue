<template>
  <span :id="`files-role-${roleName}`" class="roles-select-role-item">
    <span
      class="oc-text-bold oc-display-block oc-width-1-1"
      v-text="$gettext((role as ShareRole).displayName)"
    />
    <span
      class="oc-m-rm oc-text-small oc-display-block"
      v-text="$gettext((role as ShareRole).description)"
    />
  </span>
</template>

<script lang="ts">
import { ShareRole } from '@ownclouders/web-client/src/helpers'
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'RoleItem',
  props: {
    role: {
      type: Object as PropType<ShareRole>,
      required: true
    }
  },
  setup(props) {
    // FIXME: only needed for e2e and acceptance tests, map id to human readable element id
    const roleName = computed(() => {
      const map = {
        'b1e2218d-eef8-4d4c-b82d-0f1a1b48f3b5': 'viewer',
        'a8d5fe5e-96e3-418d-825b-534dbdf22b99': 'viewer',
        '2d00ce52-1fc2-4dbc-8b95-a73b73395f5a': 'editor',
        'fb6c3e19-e378-47e5-b277-9732f9de6e21': 'editor',
        '58c63c02-1d89-4572-916a-870abc5a1b7d': 'editor',
        '312c0871-5ef7-4b3a-85b6-0e4074c64049': 'manager',
        '1c996275-f1c9-4e71-abdf-a42f6495e960': 'uploader'
      }

      return map[(props.role as ShareRole).id]
    })

    return { roleName }
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
