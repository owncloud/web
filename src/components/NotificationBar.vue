<template>
  <oc-notifications>
    <oc-notification-message
            v-for="(item, index) in activeNotifications"
            :key="index"
            :message="item.title"
            :status="item.status"
            @close="deleteNotification(item.id)"
    />
  </oc-notifications>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['showNotification', 'deleteNotification'])
  },
  computed: {
    ...mapGetters(['activeNotifications'])
  }
}
</script>
