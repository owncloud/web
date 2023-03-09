<template>
  <div class="sciencemesh-app">
    <div>
      <div class="oc-flex oc-flex-between">
        <div class="oc-flex oc-flex-middle oc-px-m oc-py-s">
          <oc-icon name="contacts-book" />
          <h2 class="oc-px-s">Federated connections</h2>
          <oc-contextual-helper class="oc-pl-xs" v-bind="helperContent" />
        </div>
        <div id="shares-links" class="oc-flex oc-flex-middle oc-mr-m">
          <label>Federated shares:</label>
          <oc-button
            :aria-current="'Federated shares with me'"
            appearance="raw"
            class="oc-ml-l"
            @click="toSharedWithMe"
          >
            <oc-icon name="share-forward" />
            <span>with me</span>
          </oc-button>
          <oc-button
            :aria-current="'Federated shares with me'"
            appearance="raw"
            class="oc-ml-l"
            @click="toSharedWithOthers"
          >
            <oc-icon name="reply" />
            <span>with others</span>
          </oc-button>
        </div>
      </div>
      <br />
      <app-loading-spinner v-if="loading" />
      <template v-else>
        <no-content-message
          v-if="!connections?.length"
          id="accepted-invitations-empty"
          class="files-empty"
          icon="contacts-book"
        >
          <template #message>
            <span v-translate>You have no sharing connections</span>
          </template>
        </no-content-message>
        <oc-table v-else :fields="fields" :data="connections" :highlighted="highlightedConnections">
        </oc-table>
      </template>
    </div>
  </div>
</template>
    
    <script lang="ts">
import { defineComponent } from 'vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'

export default defineComponent({
  components: {
    NoContentMessage,
    AppLoadingSpinner
  },

  props: {
    /**
     * Accepted connections
     */
    connections: {
      type: Array,
      required: true
    },
    /**
     * Highlighted connections
     */
    highlightedConnections: {
      type: Array,
      required: false,
      default: () => []
    },
    /**
     * Loading
     */
    loading: {
      type: Boolean,
      required: false,
      default: () => true
    }
  },
  setup() {
    return {}
  },
  data: () => {
    return {
      token: [],
      provider: true,
      data: []
    }
  },

  computed: {
    fields() {
      return [
        {
          name: 'user',
          title: 'User',
          alignH: 'left'
        },
        {
          name: 'mail',
          title: 'Email',
          alignH: 'right'
        },
        {
          name: 'institution',
          title: 'Institution',
          alignH: 'right'
        }
      ]
    },
    helperContent() {
      return {
        text: 'Federated conections for mutual sharing. To share, go to "Files" app, select the resource click "Share" in the context menu and select account type "federated".'
      }
    }
  },
  methods: {
    toSharedWithMe() {
      this.$router.push({ name: 'files-shares-with-me', query: { filterSM: 'true' } })
    },
    toSharedWithOthers() {
      this.$router.push({ name: 'files-shares-with-others', query: { filterSM: 'true' } })
    }
  }
})
</script>
    
    <style lang="scss" scoped>
#accepted-invitations-empty {
  height: 10vh;
}
.sciencemesh-app {
}

#shares-links {
  @media (max-width: 850px) {
    visibility: none;
  }
}
</style>