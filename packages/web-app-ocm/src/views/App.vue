<template>
  <div class="sciencemesh">
    <div class="oc-flex oc-flex-column sciencemesh-wrapper">
      <div class="oc-flex sciencemesh-top">
        <div id="sciencemesh-invite" class="oc-width-1-2 oc-height-1-2">
          <outgoing-invitations />
        </div>
        <div id="sciencemesh-accept-invites" class="oc-width-1-2 oc-height-1-2">
          <incoming-invitations @highlight-new-connections="highlightNewConnections" />
        </div>
      </div>
      <div id="sciencemesh-connections" class="oc-width-1-1 oc-height-1-2">
        <connections
          :connections="connections"
          :highlighted-connections="highlightedConnections.map((c) => c.id)"
          :loading="loadingConnections"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, unref } from 'vue'
import Connections from './Connections.vue'
import IncomingInvitations from './IncomingInvitations.vue'
import OutgoingInvitations from './OutgoingInvitations.vue'
import { useClientService, useScrollTo, useStore } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  components: {
    IncomingInvitations,
    OutgoingInvitations,
    Connections
  },
  setup() {
    const store = useStore()
    const { scrollToResource } = useScrollTo()
    const clientSerivce = useClientService()
    const { $gettext } = useGettext()

    const connections = ref([])
    const newConnections = ref([])
    const highlightedConnections = ref([])
    const highlightNewConnectionsInterval = ref(null)
    const loadingConnections = ref(true)

    const findAcceptedUsers = async () => {
      try {
        const { data: acceptedUsers } = await clientSerivce.httpAuthenticated.get(
          '/sciencemesh/find-accepted-users'
        )
        loadingConnections.value = false
        acceptedUsers.forEach((u) => {
          newConnections.value.push({
            id: u.mail + u.id.idp,
            user: u.display_name,
            mail: u.mail,
            institution: u.id.idp
          })
        })
        connections.value = [...unref(newConnections)]
        newConnections.value = []
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
              user: unref(highlightedConnections)[0].user
            })
          })
        } else if (unref(highlightedConnections).length > 1) {
          let newConnections
          unref(highlightedConnections).forEach((c) => (newConnections += c.user + ', '))
          newConnections.slice(0, -2)
          store.dispatch('showMessage', {
            title: $gettext('New federated connections'),
            status: 'success',
            desc: $gettext('You can share with and recieve shares from %{newConnections} now', {
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
  overflow-y: auto;
  background-image: linear-gradient(
    to right,
    var(--oc-color-background-default) 0%,
    var(--oc-color-background-hover) 1%
  );
}
.sciencemesh-wrapper {
  margin: var(--oc-space-small);
}
.sciencemesh-top {
  margin-bottom: var(--oc-space-small);
  @media (max-width: 1000px) {
    flex-direction: column;
  }
}
#sciencemesh-invite {
  margin-right: var(--oc-space-small);
  overflow-y: auto;
}
#sciencemesh-invite,
#sciencemesh-accept-invites,
#sciencemesh-connections {
  background-color: var(--oc-color-background-default);
  border-radius: 15px;
  min-height: 40vh;
  padding: var(--oc-space-small);
  @media (max-width: 1000px) {
    width: 100%;
  }
}
#sciencemesh-invite {
  @media (max-width: 1000px) {
    margin-bottom: var(--oc-space-small);
  }
}
#sciencemesh-invite {
  height: 40vh;
}
#sciencemesh-connections {
  min-height: 52vh;
}
</style>
