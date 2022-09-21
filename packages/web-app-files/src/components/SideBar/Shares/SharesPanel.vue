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
import { computed, defineComponent, unref } from '@vue/composition-api'
import FileLinks from './FileLinks.vue'
import FileShares from './FileShares.vue'
import SpaceMembers from './SpaceMembers.vue'
import { useStore } from 'web-pkg/src/composables'
import { useIncomingParentShare } from '../../../composables/parentShare'

export default defineComponent({
  name: 'SharesPanel',
  components: {
    FileLinks,
    FileShares,
    SpaceMembers
  },
  inject: ['activePanel', 'displayedItem'],
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
      sharesLoading
    }
  },
  watch: {
    sharesLoading: {
      handler: function (sharesLoading, old) {
        if (!sharesLoading) {
          this.loadIncomingParentShare.perform(this.displayedItem.value)
        }
        // FIXME: !old can be removed as soon as https://github.com/owncloud/web/issues/7621 has been fixed
        if (this.loading || !unref(this.activePanel) || !old) {
          return
        }
        this.$nextTick(() => {
          const [panelName, ref] = unref(this.activePanel).split('#')

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
