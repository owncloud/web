<template>
  <div id="oc-notification" class="uk-navbar-item">
    <oc-icon
      id="oc-notification-bell"
      class="oc-cursor-pointer"
      name="bell"
      variation="inverted"
      aria-label="Notifications"
    />
    <oc-drop
      id="oc-notification-drop"
      toggle="#oc-notification-bell"
      boundary="#oc-notification"
      class="uk-overflow-auto uk-height-large uk-width-large"
    >
      <div
        v-for="(el, index) in activeNotifications"
        :key="index"
        class="uk-width-1-1"
      >
        <h5 class="uk-h4">{{ el.subject }}</h5>
        <p v-if="el.message" class="uk-text-small">{{ el.message }}</p>
        <p>
          <a v-if="el.link" :href="el.link" class="uk-link" target="_blank">{{el.link}}</a>
        </p>
        <div class="uk-button-group uk-width-1-1 uk-flex-right">
          <template v-if="el.actions.length !== 0">
            <oc-button
              v-for="(action, index) in el.actions"
              :key="index"
              size="small"
              :variation="action.primary ? 'primary' : 'default'"
              @click.prevent="executeRequest(el.app, action.link, action.type, el.notification_id)"
            >{{ action.label }}</oc-button>
          </template>
          <oc-button
            v-else
            id="resolve-notification-button"
            size="small"
            @click.prevent.once="deleteNotification({ client: $client, notification: el.notification_id })"
          >Mark as read</oc-button>
        </div>
        <hr v-if="index + 1 !== activeNotifications.length" />
      </div>
    </oc-drop>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['activeNotifications', 'configuration'])
  },
  methods: {
    ...mapActions(['deleteNotification', 'showMessage']),
    ...mapActions('Files', ['loadFolder']),

    executeRequest (app, link, type, notificationId) {
      this.$client.requests.ocs({
        service: 'apps/' + app,
        action: link.substr(link.lastIndexOf('api')),
        method: type
      }).then(res => {
        this.deleteNotification({
          client: this.$client,
          notification: notificationId
        })
        res.json().then(json => {
          json.ocs.data.map(item => {
            const path = item.path.substr(0, item.path.lastIndexOf('/') + 1)
            const absolutePath = this.$route.params.item ? this.$route.params.item : '/'
            if (path === absolutePath) this.reloadFilesList(path)
          })
        })
      })
    },
    reloadFilesList (path) {
      this.loadFolder({
        client: this.$client,
        absolutePath: path,
        $gettext: this.$gettext,
        routeName: this.$route.name
      }).catch((error) => {
        this.showMessage({
          title: this.$gettext('Loading folder failed…'),
          desc: error.message,
          status: 'danger'
        })
      })
    }
  }
}
</script>

<style scoped>
div > div > div:nth-of-type(n + 2) {
  margin-top: 20px;
}
</style>
