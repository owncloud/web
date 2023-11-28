<template>
  <ul class="oc-list">
    <li
      v-for="(member, index) in members"
      :key="index"
      class="oc-flex oc-flex-middle oc-mb-s"
      data-testid="space-members-list"
    >
      <oc-avatar
        v-if="member.kind === 'user'"
        :user-name="member.displayName"
        :width="36"
        class="oc-mr-s"
      />
      <oc-avatar-item
        v-else
        :width="36"
        icon-size="medium"
        :icon="groupIcon"
        name="group"
        class="oc-mr-s"
      />
      <span v-oc-browser-translate-off v-text="member.displayName" />
    </li>
  </ul>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { ShareTypes } from '@ownclouders/web-client/src/helpers/share'
import { SpaceRole } from '@ownclouders/web-client/src/helpers'

export default defineComponent({
  name: 'MembersRoleSection',
  props: {
    members: {
      type: Array as PropType<SpaceRole[]>,
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
