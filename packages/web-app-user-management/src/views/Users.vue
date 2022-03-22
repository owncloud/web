<template>
  <div>
    <main class="oc-flex oc-flex-column oc-height-1-1 oc-p-m">
      <list-loader v-if="loadResourcesTask.isRunning" />
      <template v-else>
        <div class="oc-app-bar">
          <oc-breadcrumb :items="breadcrumbs" />
        </div>
        <no-content-message
          v-if="!users.length"
          id="user-management-users-empty"
          class="files-empty"
          icon="user"
        >
          <template #message>
            <span v-translate>No users in here</span>
          </template>
        </no-content-message>
        <div v-else>
          <UsersList :users="users" />
        </div>
      </template>
    </main>
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
import { bus } from 'web-pkg/src/instance'

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
      const response = yield graphClient.users.listUsers('displayName')
      users.value = response.data.value || []
    })

    return {
      users,
      loadResourcesTask
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { text: this.$gettext('User management'), to: { path: '/user-management' } },
        {
          text: this.$gettext('Users'),
          onClick: () => bus.publish('app.user-management.list.load')
        }
      ]
    }
  },

  async mounted() {
    await this.loadResourcesTask.perform(this)

    const loadResourcesEventToken = bus.subscribe('app.user-management.list.load', () => {
      this.loadResourcesTask.perform(this)
    })

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('app.user-management.list.load', loadResourcesEventToken)
    })
  }
}
</script>
