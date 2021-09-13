<template>
  <div id="oc-no-selection" class="uk-text-center oc-mt-xl">
    <oc-icon size="xxlarge" name="select_items" />
    <p data-testid="selectedFilesText" v-text="selectedFilesString" />
  </div>
</template>
<script>
import Mixins from '../../mixins'
import MixinResources from '../../mixins/resources'
import MixinRoutes from '../../mixins/routes'

export default {
  name: 'NoSelection',
  mixins: [Mixins, MixinResources, MixinRoutes],
  title: $gettext => {
    return $gettext('Details')
  },
  computed: {
    selectedFilesString() {
      return this.$gettext('Select a file or folder to view details.')
    }
  }
}
</script>
