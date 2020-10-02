<template>
  <div class="uk-text-center">
    <oc-progress :value="quota.relative" :max="100" size="small" class="oc-mb-xs" />
    <translate
      class="oc-light"
      :translate-params="{ used: usedQuota, total: quota.definition }"
      translate-comment="Information about how much space has been used from users quota"
    >
      %{used} of %{total}
    </translate>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getResourceSize } from '../helpers/resources'

export default {
  name: 'SidebarQuota',

  computed: {
    ...mapGetters('Files', ['quota']),

    usedQuota() {
      return getResourceSize(this.quota.used)
    }
  }
}
</script>
