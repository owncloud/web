<template>
  <div class="oc-mb-s oc-width-1-1 oc-mb-l">
    <h4
      class="oc-text-truncate oc-text-normal oc-files-file-link-name oc-my-rm"
      v-text="$gettext('Link')"
    />
    <div class="oc-flex oc-flex-middle oc-flex-between oc-width-1-1 oc-p-xs link-name-container">
      <div class="oc-flex oc-flex-middle oc-text-truncate">
        <oc-icon name="link" fill-type="line" />
        <p
          class="oc-files-file-link-url oc-ml-s oc-text-truncate oc-my-rm"
          v-text="$gettext('No link')"
        />
      </div>
      <oc-button
        v-oc-tooltip="$gettext('Create link')"
        class="oc-ml-s create-quicklink-button"
        size="small"
        :aria-label="$gettext('Create link')"
        @click="$emit('createPublicLink')"
      >
        <span v-text="$gettext('Create link')" />
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CreateQuickLink',
  emits: ['createPublicLink']
})
</script>
