<template>
  <div id="oc-no-selection" class="oc-text-center oc-mt-xl">
    <oc-icon size="xxlarge" name="drag-drop" fill-type="line" />
    <p data-testid="selectedFilesText" v-text="selectedFilesString" />
  </div>
</template>
<script>
import Mixins from '../../mixins'
import MixinResources from '../../mixins/resources'

export default {
  name: 'NoSelection',
  mixins: [Mixins, MixinResources],
  title: ($gettext) => {
    return $gettext('Details')
  },
  computed: {
    selectedFilesString() {
      return this.$gettext('Select a file or folder to view details.')
    }
  }
}
</script>
