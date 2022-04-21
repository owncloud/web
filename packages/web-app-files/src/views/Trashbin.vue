<template>
  <trash-bin :breadcrumbs="breadcrumbs" />
</template>

<script>
import { bus } from 'web-pkg/src/instance'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'

import TrashBin from '../components/TrashBin.vue'

export default {
  components: { TrashBin },
  setup() {
    return {
      hasShareJail: useCapabilityShareJailEnabled()
    }
  },
  computed: {
    breadcrumbs() {
      const personalRouteName = this.$route.query?.name
        ? this.$route.query.name
        : this.hasShareJail
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
