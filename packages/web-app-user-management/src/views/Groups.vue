<template>
  <div>
    <main class="oc-flex oc-flex-column oc-height-1-1 oc-p-m">
      <list-loader v-if="loadResourcesTask.isRunning" />
      <template v-else>
        <div class="oc-app-bar">
          <oc-breadcrumb :items="breadcrumbs" />
        </div>
        <no-content-message
          v-if="!groups.length"
          id="user-management-users-empty"
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
    </main>
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
import { bus } from 'web-pkg/src/instance'

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
      const response = yield graphClient.groups.listGroups('displayName')
      groups.value = response.data.value || []
    })

    return {
      groups,
      loadResourcesTask
    }
  },

  computed: {
    breadcrumbs() {
      return [
        { text: this.$gettext('User management'), to: { path: '/user-management' } },
        {
          text: this.$gettext('Groups'),
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
