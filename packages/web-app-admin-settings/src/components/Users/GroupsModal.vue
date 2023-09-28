<template>
  <oc-modal
    :title="title"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Confirm')"
    :button-confirm-disabled="!selectedOptions.length"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm', { users, groups: selectedOptions })"
  >
    <template #content>
      <group-select
        :selected-groups="selectedOptions"
        :group-options="groups"
        @selected-option-change="changeSelectedGroupOption"
      />
    </template>
  </oc-modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { Group, User } from '@ownclouders/web-client/src/generated'
import GroupSelect from './GroupSelect.vue'

export default defineComponent({
  name: 'GroupsModal',
  components: { GroupSelect },
  props: {
    title: {
      type: String,
      required: true
    },
    groups: {
      type: Array as PropType<Group[]>,
      required: true
    },
    users: {
      type: Array as PropType<User[]>,
      required: true
    }
  },
  emits: ['confirm', 'cancel'],
  setup() {
    const selectedOptions = ref([])
    const changeSelectedGroupOption = (options: Group[]) => {
      selectedOptions.value = options
    }
    return {
      selectedOptions,
      changeSelectedGroupOption
    }
  }
})
</script>
