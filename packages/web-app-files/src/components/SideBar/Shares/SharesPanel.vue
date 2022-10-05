<template>
  <div>
    <oc-loader v-if="sharesLoading" :aria-label="$gettext('Loading list of shares')" />
    <template v-else>
      <space-members
        v-if="showSpaceMembers"
        ref="peopleShares"
        class="oc-background-highlight oc-p-m oc-mb-s"
        :space="space"
      />
      <file-shares
        v-else
        ref="peopleShares"
        class="oc-background-highlight oc-p-m oc-mb-s"
        :space="space"
      />
      <file-links
        v-if="showLinks"
        ref="linkShares"
        class="oc-background-highlight oc-p-m"
        :space="space"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject } from '@vue/composition-api'
import FileLinks from './FileLinks.vue'
import FileShares from './FileShares.vue'
import SpaceMembers from './SpaceMembers.vue'
import { useStore } from 'web-pkg/src/composables'
import { useIncomingParentShare } from '../../../composables/parentShare'
import { Resource } from 'web-client'

export default defineComponent({
  name: 'SharesPanel',
  components: {
    FileLinks,
    FileShares,
    SpaceMembers
  },
  provide() {
    return {
      incomingParentShare: computed(() => this.incomingParentShare)
    }
  },
  props: {
    showSpaceMembers: { type: Boolean, default: false },
    showLinks: { type: Boolean, default: false }
  },
  setup() {
    const store = useStore()
    const sharesLoading = computed(() => store.getters['Files/sharesTreeLoading'])

    return {
      ...useIncomingParentShare(),
      sharesLoading,
      space: inject<ComputedRef<Resource>>('displayedSpace'),
      file: inject<ComputedRef<Resource>>('displayedItem'),
      activePanel: inject<ComputedRef<String>>('activePanel')
    }
  },
  watch: {
    sharesLoading: {
      handler: function (sharesLoading, old) {
        if (!sharesLoading) {
          this.loadIncomingParentShare.perform(this.file)
        }
        // FIXME: !old can be removed as soon as https://github.com/owncloud/web/issues/7621 has been fixed
        if (this.loading || !this.activePanel || !old) {
          return
        }
        this.$nextTick(() => {
          const [panelName, ref] = this.activePanel.split('#')

          if (!ref || !this.$refs[ref]) {
            return
          }
          this.$emit('scrollToElement', { element: this.$refs[ref].$el, panelName })
        })
      },
      immediate: true
    }
  }
})
</script>
