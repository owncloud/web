<template>
  <div class="oc-flex user-info oc-mb-l">
    <avatar-image class="oc-mb-m" :width="80" :userid="user.id" :user-name="user.displayName" />
    <span v-oc-browser-translate-off v-text="user.onPremisesSamAccountName"></span>
    <span
      v-oc-browser-translate-off
      class="oc-text-muted user-info-display-name"
      v-text="user.displayName"
    ></span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserInfoBox',
  props: {
    user: {
      type: Object,
      required: true
    }
  }
})
</script>
<style lang="scss">
.user-info {
  align-items: center;
  flex-direction: column;
}

.user-info-display-name {
  font-size: 1.5rem;
}
</style>
