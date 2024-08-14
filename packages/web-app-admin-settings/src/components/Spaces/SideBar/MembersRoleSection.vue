<template>
  <ul class="oc-list">
    <li
      v-for="(m, index) in members"
      :key="index"
      class="oc-flex oc-flex-middle oc-mb-s"
      data-testid="space-members-list"
    >
      <oc-avatar
        v-if="m.grantedTo.user"
        :user-name="m.grantedTo.user.displayName"
        :width="36"
        class="oc-mr-s"
      /><oc-avatar-item
        v-else
        :width="36"
        icon-size="medium"
        :icon="groupIcon"
        name="group"
        class="oc-mr-s"
      />
      {{ (m.grantedTo.user || m.grantedTo.group).displayName }}
    </li>
  </ul>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ShareTypes, SpaceMember } from '@ownclouders/web-client'

export default defineComponent({
  name: 'MembersRoleSection',
  props: {
    members: {
      type: Array as PropType<SpaceMember[]>,
      required: true
    }
  },
  setup() {
    const groupIcon = computed(() => {
      return ShareTypes.group.icon
    })
    return { groupIcon }
  }
})
</script>
