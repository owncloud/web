<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="!users.length"
        id="user-management-users-empty"
        class="files-empty"
        icon="team"
      >
        <template #message>
          <span v-translate>No users in here</span>
        </template>
      </no-content-message>
      <div v-else>
        <UsersList :users="users" />
      </div>
    </template>
  </div>
</template>

<script>
import UsersList from '../components/Users/UsersList.vue'
import ListLoader from '../../../web-app-files/src/components/FilesList/ListLoader.vue'
import NoContentMessage from '../../../web-app-files/src/components/FilesList/NoContentMessage.vue'
import { useStore } from 'web-pkg/src/composables'
import { ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'

export default {
  components: { UsersList, ListLoader, NoContentMessage },

  setup() {
    const store = useStore()
    const users = ref([])
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadResourcesTask = useTask(function* (signal, ref) {
      const response = yield graphClient.users.listUsers()
      users.value = response.data.value || []
    })

    return {
      users,
      loadResourcesTask
    }
  },

  async mounted() {
    await this.loadResourcesTask.perform(this)
  }
}
</script>
