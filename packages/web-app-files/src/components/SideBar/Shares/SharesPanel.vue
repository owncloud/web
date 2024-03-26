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
import { ComponentPublicInstance, defineComponent, inject, Ref } from 'vue'
import FileLinks from './FileLinks.vue'
import FileShares from './FileShares.vue'
import SpaceMembers from './SpaceMembers.vue'
import { useSharesStore } from '@ownclouders/web-pkg'
import { Resource } from '@ownclouders/web-client'
import { storeToRefs } from 'pinia'

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
  emits: ['scrollToElement'],
  setup() {
    const sharesStore = useSharesStore()
    const { loading: sharesLoading } = storeToRefs(sharesStore)

    return {
      sharesLoading,
      resource: inject<Ref<Resource>>('resource'),
      activePanel: inject<String>('activePanel')
    }
  },
  watch: {
    sharesLoading: {
      handler: function (sharesLoading, old) {
        // FIXME: !old can be removed as soon as https://github.com/owncloud/web/issues/7621 has been fixed
        if (!this.activePanel || !old) {
          return
        }
        this.$nextTick(() => {
          const [panelName, ref] = this.activePanel.split('#')

          if (!ref || !this.$refs[ref]) {
            return
          }
          this.$emit('scrollToElement', {
            element: (this.$refs[ref] as ComponentPublicInstance).$el,
            panelName
          })
        })
      },
      immediate: true
    }
  }
})
</script>
