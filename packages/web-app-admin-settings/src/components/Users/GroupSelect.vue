<template>
  <div id="user-group-select-form">
    <oc-select
      :model-value="selectedOption"
      class="oc-mb-s"
      multiple
      :options="groupOptions"
      option-label="displayName"
      :label="$gettext('Groups')"
      :fix-message-line="true"
      @update:model-value="onUpdate"
    >
      <template #selected-option="{ displayName, id }">
        <span class="oc-flex oc-flex-center">
          <avatar-image
            class="oc-flex oc-align-self-center oc-mr-s"
            :width="16.8"
            :userid="id"
            :user-name="displayName"
          />
          <span>{{ displayName }}</span>
        </span>
      </template>
      <template #option="{ displayName, id }">
        <div class="oc-flex">
          <span class="oc-flex oc-flex-center">
            <avatar-image
              class="oc-flex oc-align-self-center oc-mr-s"
              :width="16.8"
              :userid="id"
              :user-name="displayName"
            />
            <span>{{ displayName }}</span>
          </span>
        </div>
      </template>
    </oc-select>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref, unref, watch } from 'vue'
import { computed } from 'vue'
import { Group } from 'web-client/src/generated'

export default defineComponent({
  name: 'GroupSelect',
  props: {
    selectedGroups: {
      type: Array as PropType<Group[]>,
      required: true
    },
    groupOptions: {
      type: Array as PropType<Group[]>,
      required: true
    }
  },
  emits: ['selectedOptionChange'],
  setup(props, { emit }) {
    const selectedOption = ref(props.selectedGroups)
    const onUpdate = (event) => {
      selectedOption.value = event
      emit('selectedOptionChange', unref(selectedOption))
    }

    const currentGroups = computed(() => props.selectedGroups)
    watch(currentGroups, () => {
      selectedOption.value = props.selectedGroups
    })

    return { selectedOption, onUpdate }
  }
})
</script>
