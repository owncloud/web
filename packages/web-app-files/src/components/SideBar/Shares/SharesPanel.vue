<template>
  <div>
    <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading list of shares')" />
    <template v-else>
      <space-members
        v-if="showSpaceMembers"
        ref="peopleShares"
        class="oc-background-highlight oc-p-m oc-mb-s"
      />
      <file-shares v-else ref="peopleShares" class="oc-background-highlight oc-p-m oc-mb-s" />
      <file-links v-if="showLinks" ref="linkShares" class="oc-background-highlight oc-p-m" />
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, unref, watch } from '@vue/composition-api'
import FileLinks from './FileLinks.vue'
import FileShares from './FileShares.vue'
import SpaceMembers from './SpaceMembers.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import { dirname } from 'path'
import { useGraphClient } from 'web-client/src/composables'
import { useTask } from 'vue-concurrency'
import { useDebouncedRef, useStore } from 'web-pkg/src/composables'

export default defineComponent({
  name: 'SharesPanel',
  components: {
    FileLinks,
    FileShares,
    SpaceMembers
  },
  inject: ['activePanel'],
  props: {
    showSpaceMembers: { type: Boolean, default: false },
    showLinks: { type: Boolean, default: false }
  },
  setup() {
    const store = useStore()
    const currentFileOutgoingSharesLoading = computed(
      () => store.getters['Files/currentFileOutgoingSharesLoading']
    )
    const incomingSharesLoading = computed(() => store.state.Files.incomingSharesLoading)
    const sharesTreeLoading = computed(() => store.state.Files.sharesTreeLoading)
    const sharesLoading = useDebouncedRef(true, 250)
    watch([currentFileOutgoingSharesLoading, incomingSharesLoading, sharesTreeLoading], () => {
      sharesLoading.value =
        currentFileOutgoingSharesLoading.value ||
        incomingSharesLoading.value ||
        sharesTreeLoading.value
    })

    const { graphClient } = useGraphClient()

    const loadSpaceMembersTask = useTask(function* (signal, ref) {
      yield ref.loadCurrentFileOutgoingShares({
        client: ref.$client,
        graphClient,
        path: ref.space.id,
        storageId: ref.space.id,
        resource: ref.space
      })
    })

    return { graphClient, loadSpaceMembersTask, sharesLoading }
  },
  computed: {
    ...mapGetters('Files', ['highlightedFile', 'currentFileOutgoingSharesLoading']),
    ...mapState('Files', ['incomingSharesLoading', 'sharesTreeLoading'])
  },
  watch: {
    sharesLoading: {
      handler: function () {
        if (this.loading || !unref(this.activePanel)) {
          return
        }
        this.$nextTick(() => {
          const [panelName, ref] = unref(this.activePanel).split('#')

          if (!ref || !this.$refs[ref]) {
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

          if (this.showSpaceMembers) {
            this.loadSpaceMembersTask.perform(this)
          }
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
