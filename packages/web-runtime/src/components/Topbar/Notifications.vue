<template>
  <div id="oc-notification" class="oc-flex oc-flex-middle">
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
    <oc-drop
      id="oc-notification-drop"
      drop-id="notifications-dropdown"
      toggle="#oc-notification-bell"
      mode="click"
      :options="{ pos: 'bottom-right', delayHide: 0 }"
      class="oc-overflow-auto oc-width-3-4 oc-width-large@s"
      padding-size="small"
    >
      <div v-for="(el, index) in activeNotifications" :key="index" class="oc-width-1-1">
        <h4 v-text="el.subject" />
        <p v-if="el.message" class="oc-text-small">{{ el.message }}</p>
        <p>
          <a v-if="shouldDisplayLink(el)" :href="el.link" target="_blank">{{ el.link }}</a>
        </p>
        <div class="oc-width-1-1 oc-flex-right">
          <template v-if="el.actions.length !== 0">
            <oc-button
              v-for="(action, actionIndex) in el.actions"
              :key="index + '-' + actionIndex"
              size="small"
              :variation="action.primary ? 'primary' : 'passive'"
              appearance="filled"
              class="oc-ml-s"
              @click.prevent="executeRequest(el.app, action.link, action.type, el.notification_id)"
              >{{ action.label }}</oc-button
            >
          </template>
          <oc-button
            v-else
            id="resolve-notification-button"
            size="small"
            @click.prevent.once="
              deleteNotification({ client: $client, notification: el.notification_id })
            "
          >
            Mark as read
          </oc-button>
        </div>
        <hr v-if="index + 1 !== activeNotifications.length" />
      </div>
    </oc-drop>
  </div>
</template>
<script lang="ts">
import { mapGetters, mapActions } from 'vuex'
import { bus } from 'web-pkg/src/instance'
import { ShareStatus } from 'web-client/src/helpers/share'

export default {
  computed: {
    ...mapGetters(['activeNotifications', 'configuration']),

    notificationsLabel() {
      return this.$gettext('Notifications')
    }
  },
  methods: {
    ...mapActions(['deleteNotification', 'showMessage']),

    executeRequest(app, link, type, notificationId) {
      this.$client.requests
        .ocs({
          service: 'apps/' + app,
          action: link.slice(link.lastIndexOf('api')),
          method: type
        })
        .then((res) => {
          this.deleteNotification({
            client: this.$client,
            notification: notificationId
          })
          res.json().then((json) => {
            json.ocs.data.forEach((item) => {
              const currentPath = this.$route.params.item ? `/${this.$route.params.item}` : '/'
              const { state, path, file_target: fileTarget } = item

              // accepted federated share
              if (state === ShareStatus.accepted && fileTarget) {
                bus.publish('app.files.list.load')
                return
              }

              if (path) {
                const itemPath = path.slice(0, path.lastIndexOf('/') + 1)
                if (itemPath === currentPath) bus.publish('app.files.list.load')
              }
            })
          })
        })
    },
    shouldDisplayLink(notification) {
      return notification.link && notification.object_type !== 'local_share'
    }
  }
}
</script>

<style scoped>
div > div > div:nth-of-type(n + 2) {
  margin-top: 20px;
}
</style>
