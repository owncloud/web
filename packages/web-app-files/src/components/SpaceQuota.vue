<template>
  <div class="space-quota">
    <p class="oc-mb-s oc-mt-rm" v-text="spaceStorageDetailsLabel" />
    <oc-progress
      :value="parseInt(quotaUsagePercent)"
      :max="100"
      size="small"
      :variation="quotaProgressVariant"
    />
  </div>
</template>

<script>
import filesize from 'filesize'

export default {
  name: 'SpaceQuota',
  props: {
    spaceQuota: {
      type: Object,
      required: true
    }
  },
  computed: {
    spaceStorageDetailsLabel() {
      return this.$gettextInterpolate(
        this.$gettext('%{used} of %{total} used (%{percentage}% used)'),
        {
          used: this.quotaUsed,
          total: this.quotaTotal,
          percentage: this.quotaUsagePercent
        }
      )
    },
    quotaTotal() {
      return filesize(this.spaceQuota.total)
    },
    quotaUsed() {
      return filesize(this.spaceQuota.used)
    },
    quotaUsagePercent() {
      return ((this.spaceQuota.used / this.spaceQuota.total) * 100).toFixed(1)
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
}
</script>
