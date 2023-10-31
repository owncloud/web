<template>
  <div class="sciencemesh-app">
    <div>
      <div class="oc-flex oc-flex-between">
        <div class="oc-flex oc-flex-middle oc-px-m oc-py-s">
          <oc-icon name="contacts-book" />
          <h2 class="oc-px-s" v-text="$gettext('Federated connections')" />
          <oc-contextual-helper class="oc-pl-xs" v-bind="helperContent" />
        </div>
        <div id="shares-links" class="oc-flex oc-flex-middle oc-mr-m">
          <label v-text="$gettext('Federated shares')" />
          <oc-button
            :aria-current="$gettext('Federated shares with me')"
            appearance="raw"
            class="oc-ml-l"
            @click="toSharedWithMe"
          >
            <oc-icon name="share-forward" />
            <span v-text="$gettext('with me')" />
          </oc-button>
          <oc-button
            :aria-current="$gettext('Federated shares with me')"
            appearance="raw"
            class="oc-ml-l"
            @click="toSharedWithOthers"
          >
            <oc-icon name="reply" />
            <span v-text="$gettext('with others')" />
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
            <span v-text="$gettext('You have no sharing connections')" />
          </template>
        </no-content-message>
        <oc-table v-else :fields="fields" :data="connections" :highlighted="highlightedConnections">
        </oc-table>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { NoContentMessage, AppLoadingSpinner, useRouter } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

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
    const router = useRouter()
    const { $gettext } = useGettext()

    const fields = computed(() => {
      return [
        {
          name: 'user',
          title: $gettext('User'),
          alignH: 'left'
        },
        {
          name: 'mail',
          title: $gettext('Email'),
          alignH: 'right'
        },
        {
          name: 'institution',
          title: $gettext('Institution'),
          alignH: 'right'
        }
      ]
    })

    const helperContent = computed(() => {
      return {
        text: $gettext(
          'Federated conections for mutual sharing. To share, go to "Files" app, select the resource click "Share" in the context menu and select account type "federated".'
        )
      }
    })

    const toSharedWithMe = () => {
      router.push({ name: 'files-shares-with-me', query: { filterSM: 'true' } })
    }
    const toSharedWithOthers = () => {
      router.push({ name: 'files-shares-with-others', query: { filterSM: 'true' } })
    }

    return { helperContent, toSharedWithOthers, toSharedWithMe, fields }
  }
})
</script>

<style lang="scss" scoped>
#accepted-invitations-empty {
  height: 10vh;
}

#shares-links {
  @media (max-width: 850px) {
    visibility: none;
  }
}
</style>
