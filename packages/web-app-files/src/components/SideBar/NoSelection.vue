<template>
  <div id="oc-no-selection" class="oc-text-center oc-mt-xl">
    <oc-icon size="xxlarge" name="drag-drop" fill-type="line" />
    <p data-testid="selectedFilesText" v-text="selectedFilesString" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import Mixins from '../../mixins'
import MixinResources from '../../mixins/resources'

export default defineComponent({
  name: 'NoSelection',
  mixins: [Mixins, MixinResources],
  computed: {
    selectedFilesString() {
      return this.$gettext('Select a file or folder to view details.')
    }
  }
})
</script>
