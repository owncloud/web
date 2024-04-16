<template>
  <div class="oc-flex group-info oc-mb-l">
    <avatar-image class="oc-mb-m" :width="80" :userid="_group.id" :user-name="_group.displayName" />
    <span class="oc-text-muted group-info-display-name" v-text="_group.displayName"></span>
    <span class="oc-text-muted" v-text="groupMembersText"></span>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, unref } from 'vue'
import { Group } from '@ownclouders/web-client/graph/generated'
import { useGettext } from 'vue3-gettext'
export default defineComponent({
  name: 'GroupInfoBox',
  props: {
    group: {
      type: Object as PropType<Group>,
      required: true
    }
  },
  setup(props) {
    const _group = computed<Group>(() => props.group)
    const { $ngettext } = useGettext()
    const groupMembersText = computed(() => {
      return $ngettext(
        '%{groupCount} member',
        '%{groupCount} members',
        unref(_group).members.length,
        {
          groupCount: unref(_group).members.length.toString()
        }
      )
    })

    return {
      groupMembersText,
      _group
    }
  }
})
</script>
<style lang="scss">
.gr-info {
  align-items: center;
  flex-direction: column;
}
.group-info-display-name {
  font-size: 1.5rem;
}
</style>
