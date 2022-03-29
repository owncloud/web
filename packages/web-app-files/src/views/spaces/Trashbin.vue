<template>
  <trash-bin
    :breadcrumbs="breadcrumbs"
    :no-content-message="$gettext('Space has no deleted files')"
  />
</template>

<script lang="ts">
import TrashBin from '../../components/TrashBin.vue'
import { bus } from 'web-pkg/src/instance'
import { useStore } from 'web-pkg/src/composables'
import { defineComponent, ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'
import { buildSpace } from '../../helpers/resources'
import { mapGetters } from 'vuex'

export default defineComponent({
  components: { TrashBin },

  setup() {
    const store = useStore()
    const space = ref({})
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadResourcesTask = useTask(function* (signal, ref) {
      const response = yield graphClient.drives.getDrive(ref.$router.currentRoute.params.storageId)
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
