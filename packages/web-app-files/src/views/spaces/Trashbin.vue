<template><trash-bin :no-content-message="$gettext('Space has no deleted files')" /></template>

<script>
import TrashBin from '../../components/TrashBin.vue'
import { useStore } from 'web-pkg/src/composables'
import { ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'
import { buildSpace } from '../../helpers/resources'
import { mapGetters } from 'vuex'

export default {
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
    ...mapGetters(['configuration'])
  },

  async mounted() {
    await this.loadResourcesTask.perform(this)
    document.title = `${this.$router.currentRoute.meta.title} - ${this.space.name} - ${this.configuration.currentTheme.general.name}`
  }
}
</script>
