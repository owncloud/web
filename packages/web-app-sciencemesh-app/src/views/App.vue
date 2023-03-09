<template>
  <div class="sciencemesh">
    <div class="oc-flex oc-flex-column sciencemesh-wrapper">
      <div class="oc-flex sciencemesh-top">
        <div id="sciencemesh-invite" class="oc-width-1-2 oc-height-1-2">
          <outgoing-invitations />
        </div>
        <div id="sciencemesh-accept-invites" class="oc-width-1-2 oc-height-1-2">
          <incoming-invitations @highlightNewConnections="highlightNewConnections" />
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
import { defineComponent } from 'vue'
import Connections from './Connections.vue'
import IncomingInvitations from './IncomingInvitations.vue'
import OutgoingInvitations from './OutgoingInvitations.vue'
import { mapActions } from 'vuex'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'

export default defineComponent({
  components: {
    IncomingInvitations,
    OutgoingInvitations,
    Connections
  },

  setup() {
    const { scrollToResource } = useScrollTo()
    return { scrollToResource }
  },
  data: () => {
    return {
      connections: [],
      newConnections: [],
      highlightedConnections: [],
      highlightNewConnectionsInterval: null,
      loadingConnections: true
    }
  },

  computed: {},

  async mounted() {
    await this.findAcceptedUsers()
    this.loadingConnections = false
    const callback = this.highlightNewConnections()
    this.highlightNewConnectionsInterval = setInterval(() => {
      this.highlightNewConnections()
    }, 10 * 1000)
  },

  destoyed() {
    clearInterval(this.highlightNewConnectionsInterval)
  },

  methods: {
    ...mapActions(['showMessage']),
    async highlightNewConnections() {
      let oldConnections = [...this.connections]
      await this.findAcceptedUsers()
      if (oldConnections.length < this.connections.length) {
        this.highlightedConnections = this.connections.filter(
          (connection) => !oldConnections.map((c) => c.id).includes(connection.id)
        )

        if (this.highlightedConnections.length === 1) {
          this.scrollToResource({
            id: this.highlightedConnections[0].id
          })
          this.showMessage({
            title: 'New federated connection',
            status: 'success',
            desc: `You can share with and recieve shares from ${this.highlightedConnections[0].user} now`
          })
        } else if (this.highlightedConnections.length > 1) {
          let newConnections

          this.highlightedConnections.forEach((c) => (newConnections += c.user + ', '))
          newConnections.slice(0, -2)
          this.showMessage({
            title: 'New federated connections',
            status: 'success',
            desc: `You can share with and recieve shares from ${newConnections} now`
          })
        }
      }
    },
    async findAcceptedUsers() {
      const url = '/sciencemesh/find-accepted-users'

      const accessToken = this.$store.getters['runtime/auth/accessToken']
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + accessToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')

      //local test
      // let random = Math.random()
      // this.connections.push({
      //   id: 'Bob Doe' + random,
      //   user: 'Bob Doe' + random,
      //   mail: 'bob.doe@nextcloud.com',
      //   institution: 'NextCloud'
      // })

      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      if (!response.ok) {
        this.connections = []
        this.loadingConnections = false
      } else {
        this.loadingConnections = false
        this.acceptedUsers = await response.json()
        this.acceptedUsers.forEach((u) => {
          this.newConnections.push({
            id: u.mail + u.id.idp,
            user: u.display_name,
            mail: u.mail,
            institution: u.id.idp
          })
        })
        this.connections = [...this.newConnections]
        this.newConnections = []
      }
    }
  }
})
</script>
      
<style lang="scss" scoped>
.sciencemesh {
  overflow-y: auto;
  //background-color: var(--oc-color-background-hover);
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