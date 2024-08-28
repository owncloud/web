<template>
  <div class="space-quota">
    <p class="oc-mb-s oc-mt-rm" v-text="spaceStorageDetailsLabel" />
    <oc-progress
      :value="quotaUsagePercent"
      :max="100"
      size="small"
      :variation="quotaProgressVariant"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { filesize, FileSizeOptionsString } from 'filesize'
import { Quota } from '@ownclouders/web-client/graph/generated'

export default defineComponent({
  name: 'SpaceQuota',
  props: {
    spaceQuota: {
      type: Object as PropType<Quota>,
      required: true,
      default: () => undefined as Quota // FIXME: hack because vue doesn't detect type
    }
  },
  computed: {
    spaceStorageDetailsLabel() {
      if (this.spaceQuota.total) {
        return this.$gettext('%{used} of %{total} used (%{percentage}% used)', {
          used: this.quotaUsed,
          total: this.quotaTotal,
          percentage: this.quotaUsagePercent.toString()
        })
      }

      return this.$gettext('%{used} used (no restriction)', {
        used: this.quotaUsed
      })
    },
    quotaTotal() {
      return filesize<FileSizeOptionsString>(this.spaceQuota.total)
    },
    quotaUsed() {
      return filesize<FileSizeOptionsString>(this.spaceQuota.used)
    },
    quotaUsagePercent() {
      return parseFloat(((this.spaceQuota.used / this.spaceQuota.total) * 100).toFixed(2))
    },
    quotaProgressVariant() {
      switch (this.spaceQuota.state) {
        case 'normal':
          return 'primary'
        case 'nearing':
          return 'warning'
        case 'critical':
          return 'warning'
        default:
          return 'danger'
      }
    }
  }
})
</script>
