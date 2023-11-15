<template>
  <div class="sciencemesh">
    <div class="oc-flex oc-flex-column sciencemesh-wrapper">
      <div class="oc-flex sciencemesh-top">
        <div id="sciencemesh-invite" class="oc-width-1-2">
          <outgoing-invitations />
        </div>
        <div id="sciencemesh-accept-invites" class="oc-width-1-2">
          <incoming-invitations @highlight-new-connections="highlightNewConnections" />
        </div>
      </div>
      <div id="sciencemesh-connections">
        <connections-panel
          v-model:connections="connections"
          :highlighted-connections="highlightedConnections.map((c) => c.id)"
          :loading="loadingConnections"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, unref, Ref } from 'vue'
import ConnectionsPanel from './ConnectionsPanel.vue'
import IncomingInvitations from './IncomingInvitations.vue'
import OutgoingInvitations from './OutgoingInvitations.vue'
import { useClientService, useScrollTo, useStore, FederatedConnection } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'
import { buildConnection } from '../functions'

export default defineComponent({
  components: {
    IncomingInvitations,
    OutgoingInvitations,
    ConnectionsPanel
  },
  setup() {
    const store = useStore()
    const { scrollToResource } = useScrollTo()
    const clientSerivce = useClientService()
    const { $gettext } = useGettext()

    const connections: Ref<FederatedConnection[]> = ref([])
    const highlightedConnections: Ref<FederatedConnection[]> = ref([])
    const highlightNewConnectionsInterval = ref(null)
    const loadingConnections = ref(true)

    const findAcceptedUsers = async () => {
      try {
        const { data: acceptedUsers } = await clientSerivce.httpAuthenticated.get<
          FederatedConnection[]
        >('/sciencemesh/find-accepted-users')
        loadingConnections.value = false
        connections.value = acceptedUsers.map(buildConnection)
      } catch (error) {
        connections.value = []
        loadingConnections.value = false
      }
    }

    const highlightNewConnections = async () => {
      let oldConnections = [...unref(connections)]
      await findAcceptedUsers()
      if (oldConnections.length < unref(connections).length) {
        highlightedConnections.value = unref(connections).filter(
          (connection) => !oldConnections.map((c) => c.id).includes(connection.id)
        )
        if (unref(highlightedConnections).length === 1) {
          scrollToResource(unref(highlightedConnections)[0].id)
          store.dispatch('showMessage', {
            title: $gettext('New federated connection'),
            status: 'success',
            desc: $gettext('You can share with and recieve shares from %{user} now', {
              user: unref(highlightedConnections)[0].display_name
            })
          })
        } else if (unref(highlightedConnections).length > 1) {
          const newConnections = unref(highlightedConnections)
            .map((c) => c.display_name)
            .join(', ')

          store.dispatch('showMessage', {
            title: $gettext('New federated connections'),
            status: 'success',
            desc: $gettext('You can share with and receive shares from %{ connections } now', {
              connections: newConnections
            })
          })
        }
      }
    }

    onMounted(async () => {
      await findAcceptedUsers()
      loadingConnections.value = false
      highlightNewConnectionsInterval.value = setInterval(() => {
        highlightNewConnections()
      }, 10 * 1000)
    })

    onUnmounted(() => {
      clearInterval(unref(highlightNewConnectionsInterval))
    })

    return {
      highlightNewConnections,
      connections,
      highlightedConnections,
      loadingConnections
    }
  }
})
</script>

<style lang="scss" scoped>
.sciencemesh {
  background-color: var(--oc-color-background-hover);
}
.sciencemesh-wrapper {
  height: 100%;
}
.sciencemesh-top {
  height: 360px;
  overflow: hidden;
  @media (max-width: 1000px) {
    flex-direction: column;
    height: auto;
  }
}
#sciencemesh-invite,
#sciencemesh-accept-invites {
  margin: var(--oc-space-small);
  overflow-y: auto;
}
#sciencemesh-invite,
#sciencemesh-accept-invites,
#sciencemesh-connections {
  margin: var(--oc-space-small);
  background-color: var(--oc-color-background-default);
  border-radius: 15px;
  padding: var(--oc-space-small);
  @media (max-width: 1000px) {
    width: auto;
  }
}
#sciencemesh-connections {
  flex: 1;
}
#sciencemesh-invite {
  @media (max-width: 1000px) {
    margin-bottom: var(--oc-space-small);
  }
}
</style>
