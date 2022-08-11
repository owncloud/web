<template>
  <trash-bin
    :breadcrumbs="breadcrumbs"
    :no-content-message="$gettext('Space has no deleted files')"
  />
</template>

<script lang="ts">
import TrashBin from '../../components/TrashBin.vue'
import { bus } from 'web-pkg/src/instance'
import { useRouteParam } from 'web-pkg/src/composables'
import { defineComponent, ref, unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { buildSpace } from 'web-client/src/helpers'

import { mapGetters } from 'vuex'
import { useGraphClient } from 'web-client/src/composables'

export default defineComponent({
  components: { TrashBin },

  setup() {
    const space = ref({})
    const currentStorageId = useRouteParam('storageId')
    const { graphClient } = useGraphClient()

    const loadResourcesTask = useTask(function* (signal, ref) {
      const response = yield unref(graphClient).drives.getDrive(unref(currentStorageId))
      const loadedSpace = response.data || {}
      space.value = buildSpace(loadedSpace)
    })

    return {
      space,
      loadResourcesTask
    }
  },

  computed: {
    ...mapGetters(['configuration']),

    breadcrumbs() {
      return [
        {
          text: this.$gettext('Deleted files'),
          to: '/files/trash'
        },
        {
          allowContextActions: true,
          text: this.space?.name,
          onClick: () => bus.publish('app.files.list.load')
        }
      ]
    }
  },

  async mounted() {
    await this.loadResourcesTask.perform(this)
    document.title = `${this.$router.currentRoute.meta.title} - ${this.space.name} - ${this.configuration.currentTheme.general.name}`
  }
})
</script>
