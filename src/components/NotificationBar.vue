<template>
  <div v-show="activeNotifications.length">
      <v-snackbar
      v-for="notification in activeNotifications"
      :key="notification.id"
      :value="true" :multi-line="true"
      :timeout="4000"
      top="top" vertical="vertical"
      :color="notification.type || 'info'"
      @input="deleteNotification(notification.id)">
      <span heading>
        {{notification.title}}
      </span>
      <span content>
        {{notification.desc}}
      </span>
    </v-snackbar>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  methods: {
    ...mapActions(['showNotification', 'deleteNotification'])
  },
  computed: {
    ...mapGetters(['activeNotifications']),
  }
}
</script>
