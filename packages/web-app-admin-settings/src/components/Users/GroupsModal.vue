<template>
  <oc-modal
    :title="title"
    :message="message"
    :button-cancel-text="$gettext('Cancel')"
    :button-confirm-text="$gettext('Confirm')"
    :button-confirm-disabled="!selectedOptions.length"
    focus-trap-initial="#create-user-input-display-name"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm', { users, groups: selectedOptions })"
  >
    <template #content>
      <oc-select
        v-model="selectedOptions"
        :label="$gettext('Groups')"
        multiple
        option-label="displayName"
        :options="groups"
      />
    </template>
  </oc-modal>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { Group, User } from 'web-client/src/generated'

export default defineComponent({
  name: 'GroupsModal',
  props: {
    title: {
      type: String,
      required: true
    },
    message: {
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

    return {
      selectedOptions
    }
  }
})
</script>
