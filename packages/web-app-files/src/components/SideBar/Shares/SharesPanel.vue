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
import { useDebouncedRef, useStore } from 'web-pkg/src/composables'
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
    const currentFileOutgoingSharesLoading = computed(
      () => store.getters['Files/currentFileOutgoingSharesLoading']
    )
    const incomingSharesLoading = computed(() => store.state.Files.incomingSharesLoading)
    const sharesTreeLoading = computed(() => store.state.Files.sharesTreeLoading)
    const sharesLoading = useDebouncedRef(
      currentFileOutgoingSharesLoading.value ||
        incomingSharesLoading.value ||
        sharesTreeLoading.value,
      250
    )

    watch([currentFileOutgoingSharesLoading, incomingSharesLoading, sharesTreeLoading], () => {
      sharesLoading.value =
        currentFileOutgoingSharesLoading.value ||
        incomingSharesLoading.value ||
        sharesTreeLoading.value
    })

    return {
      ...useIncomingParentShare(),
      sharesLoading
    }
  },
  computed: {
    ...mapGetters('Files', ['currentFileOutgoingSharesLoading']),
    ...mapState('Files', ['incomingSharesLoading', 'sharesTreeLoading'])
  },
  watch: {
    sharesLoading: {
      handler: function (sharesLoading) {
        if (!sharesLoading) {
          this.loadIncomingParentShare.perform(this.displayedItem.value)
        }
        if (this.loading || !unref(this.activePanel)) {
          return
        }
        this.$nextTick(() => {
          const [panelName, ref] = unref(this.activePanel).split('#')

          if (!ref || !this.$refs[ref]) {
            return
          }
          console.log('wa',  this.$refs[ref].$el)
          this.$emit('scrollToElement', { element: this.$refs[ref].$el, panelName })
        })
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions('Files', ['loadCurrentFileOutgoingShares'])
  }
})
</script>
