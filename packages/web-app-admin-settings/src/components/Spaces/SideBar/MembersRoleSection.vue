<template>
  <ul class="oc-list">
    <li
      v-for="(member, index) in members"
      :key="index"
      class="oc-flex oc-flex-middle oc-mb-s"
      data-testid="space-members-list"
    >
      <oc-avatar
        v-if="groupMembers || (spaceMembers && member.kind === 'user')"
        :user-name="member.displayName"
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
      {{ member.displayName }}
    </li>
  </ul>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { ShareTypes } from 'web-client/src/helpers/share'
import { SpaceRole, User } from 'web-client/src/helpers'

export default defineComponent({
  name: 'MembersRoleSection',
  props: {
    spaceMembers: {
      type: Array as PropType<SpaceRole[]>,
      required: false
    },
    groupMembers: {
      type: Array as PropType<User[]>,
      required: false
    }
  },
  setup(props) {
    const groupIcon = computed(() => {
      return ShareTypes.group.icon
    })
    const members = computed(() => {
      return unref(props.spaceMembers) || unref(props.groupMembers)
    })
    return { groupIcon, members }
  }
})
</script>
