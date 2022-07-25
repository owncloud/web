<template>
  <div>
    <oc-loader v-if="loading" :aria-label="$gettext('Loading list of shares')" />
    <template v-else>
      <space-members v-if="showSpaceMembers" class="oc-background-highlight oc-p-m oc-mb-m" />
      <file-shares v-else ref="peopleShares" class="oc-background-highlight oc-p-m oc-mb-m" />
      <file-links v-if="showLinks" ref="linkShares" class="oc-background-highlight oc-p-m" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import FileLinks from './FileLinks.vue'
import FileShares from './FileShares.vue'
import SpaceMembers from './SpaceMembers.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import { dirname } from 'path'
import { useGraphClient } from 'web-client/src/composables'

export default defineComponent({
  name: 'SharesPanel',
  components: {
    FileLinks,
    FileShares,
    SpaceMembers
  },
  props: {
    showSpaceMembers: { type: Boolean, default: false },
    showLinks: { type: Boolean, default: false }
  },
  setup() {
    return {
      ...useGraphClient()
    }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'currentFileOutgoingSharesLoading']),
    ...mapState('Files/sidebar', ['activePanel']),
    ...mapState('Files', ['incomingSharesLoading', 'sharesTreeLoading']),

    loading() {
      return (
        this.currentFileOutgoingSharesLoading ||
        this.sharesTreeLoading ||
        this.incomingSharesLoading
      )
    }
  },
  watch: {
    loading: {
      handler: function () {
        if (this.loading) {
          return
        }

        const [panelName, ref] = this.activePanel.split('#')
        if (!ref) {
          return
        }

        this.$nextTick(() => {
          if (!this.$refs[ref]) {
            return
          }

          this.$emit('scrollToElement', { element: this.$refs[ref].$el, panelName })
        })
      }
    },
    highlightedFile: {
      handler: function (newItem, oldItem) {
        if (oldItem !== newItem) {
          this.$_reloadShares()
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('Files', [
      'loadCurrentFileOutgoingShares',
      'loadSharesTree',
      'loadIncomingShares'
    ]),
    $_reloadShares() {
      this.loadCurrentFileOutgoingShares({
        client: this.$client,
        graphClient: this.graphClient,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        storageId: this.highlightedFile.fileId,
        resource: this.highlightedFile
      })
      this.loadIncomingShares({
        client: this.$client,
        path: this.highlightedFile.path,
        $gettext: this.$gettext,
        storageId: this.highlightedFile.fileId
      })
      this.loadSharesTree({
        client: this.$client,
        path: this.highlightedFile.path === '' ? '/' : dirname(this.highlightedFile.path),
        $gettext: this.$gettext,
        storageId: this.highlightedFile.fileId
      })
    }
  }
})
</script>
