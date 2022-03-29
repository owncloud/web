<template>
  <trash-bin :breadcrumbs="breadcrumbs" />
</template>

<script>
import { bus } from 'web-pkg/src/instance'
import { useCapabilitySpacesEnabled } from 'web-pkg/src/composables'

import TrashBin from '../components/TrashBin.vue'

export default {
  components: { TrashBin },
  setup() {
    return {
      hasSpaces: useCapabilitySpacesEnabled()
    }
  },
  computed: {
    breadcrumbs() {
      const personalRouteName = this.hasSpaces
        ? this.$gettext('Personal')
        : this.$gettext('All files')

      return [
        {
          text: this.$gettext('Deleted files'),
          to: '/files/trash'
        },
        {
          text: personalRouteName,
          onClick: () => bus.publish('app.files.list.load')
        }
      ]
    }
  }
}
</script>
