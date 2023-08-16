<template>
  <ul class="commands-list">
    <li>
      <oc-button size="small" :aria-label="$gettext('Close')" @click="$emit('close')">
        <oc-icon name="close" size="small" />
      </oc-button>
    </li>
    <oc-button :aria-label="$gettext('Download image')" size="small" @click="$emit('download')">
      <oc-icon name="download-2" size="small" />
    </oc-button>
    <li>
      <oc-button
        v-if="isImage && isSaveable"
        size="small"
        :aria-label="$gettext('Save')"
        @click="$emit('save')"
      >
        <oc-icon name="save" size="small" fill-type="line" />
      </oc-button>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'QuickCommands',
  props: {
    isImage: {
      type: Boolean,
      default: false
    },
    isSaveable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'delete', 'save', 'download'],
  setup(props, { emit }) {
    const { $gettext } = useGettext()
    return {
      $gettext
    }
  }
})
</script>

<style lang="scss" scoped>
.commands-list {
  list-style-type: none;
  padding: 0;
  padding-top: 16px;
  gap: $oc-space-small;
  width: 3rem;

  & li {
    margin-right: $oc-space-medium;
  }

  & > :not(:first-child) {
    margin-top: $oc-space-small;
  }
}
</style>
