<template>
  <div v-show="activeNotifications.length">
    <oc-alert
      v-for="notification in activeNotifications"
      :key="notification.id"
      variation="notification.type || 'primary'"
      @input="deleteNotification(notification.id)">
      <p>
        <oc-icon name="info" class="uk-float-left uk-margin-small-right" />
        {{notification.title}}
        <br>
        {{notification.desc}}
      </p>
    </oc-alert>
  </div>
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
