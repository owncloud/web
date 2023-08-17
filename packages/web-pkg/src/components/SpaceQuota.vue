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
import { defineComponent } from 'vue'

import filesize from 'filesize'

export default defineComponent({
  name: 'SpaceQuota',
  props: {
    spaceQuota: {
      type: Object,
      required: true
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
      return filesize(this.spaceQuota.total)
    },
    quotaUsed() {
      return filesize(this.spaceQuota.used)
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
