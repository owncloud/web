<template>
  <oc-notifications>
    <oc-notification-message
            v-for="(item, index) in activeNotifications"
            :key="index"
            :title="item.title"
            :message="item.desc"
            :status="item.status"
            @close="deleteNotification(item)"
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
