<template>
  <oc-button
      id="oc-notification-bell"
      v-oc-tooltip="notificationsLabel"
      appearance="raw"
      variation="inverse"
      :aria-label="notificationsLabel"
    >
    <oc-icon
      class="oc-cursor-pointer oc-flex oc-flex-middle"
      name="notification-3"
      fill-type="line"
    />
  </oc-button>
</template>
<script lang="ts">
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'

export default {
  setup() {
    const { $gettext } = useGettext()
    const notificationsLabel = computed(() => $gettext('Notifications'))
    return {
      notificationsLabel
    }
  }
}
</script>

<style scoped>

</style>
