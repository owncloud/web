<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="!groups.length"
        id="user-management-groups-empty"
        class="files-empty"
        icon="team"
      >
        <template #message>
          <span v-translate>No groups in here</span>
        </template>
      </no-content-message>
      <div v-else>
        <GroupList :groups="groups" />
      </div>
    </template>
  </div>
</template>

<script>
import ListLoader from '../../../web-app-files/src/components/FilesList/ListLoader.vue'
import NoContentMessage from '../../../web-app-files/src/components/FilesList/NoContentMessage.vue'
import { useStore } from 'web-pkg/src/composables'
import { ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'
import GroupList from '../components/Groups/GroupsList.vue'

export default {
  components: { GroupList, ListLoader, NoContentMessage },

  setup() {
    const store = useStore()
    const groups = ref([])
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadResourcesTask = useTask(function* (signal, ref) {
      const response = yield graphClient.groups.listGroups()
      groups.value = response.data.value || []
    })

    return {
      groups,
      loadResourcesTask
    }
  },

  async mounted() {
    await this.loadResourcesTask.perform(this)
  }
}
</script>
