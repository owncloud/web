<template>
  <div id="oc-notification" class="uk-navbar-item">
    <oc-icon id="oc-notification-bell" class="oc-cursor-pointer" name="bell" variation="inverted" ariaLabel="Notifications" />
    <oc-drop id="oc-notification-drop" toggle="#oc-notification-bell" boundary="#oc-notification" class="uk-overflow-auto uk-height-large uk-width-large">
      <div v-for="(el, index) in activeNotifications" :key="index" class="uk-width-1-1 uk-background-muted uk-padding-small uk-display-inline-block">
        <h5 class="uk-h4">
          {{ el.subject }}
        </h5>
        <p v-if="el.message" class="uk-text-small">
          {{ el.message }}
        </p>
        <p>
          <a v-if="el.link" :href="el.link" class="uk-link" target="_blank">{{el.link}}</a>
        </p>
        <div class="uk-button-group uk-float-right">
          <template v-if="el.actions.length!==0" class="uk-text-small">
            <button v-for="(action, index) in sortedActions(el.actions)" :key="index" class="uk-button uk-button-small" :class="[action.primary ? 'uk-button-primary' : 'uk-button-default']" @click.prevent="executeRequest(el.app, action.link, action.type)">{{ action.label }}</button>
          </template>
          <button id="resolve-notification-button" class="uk-button uk-button-default uk-button-small" @click.prevent.once="deleteNotification({ client: $client, notification: el.notification_id })">Mark as read</button>
        </div>
      </div>
    </oc-drop>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['activeNotifications'])
  },
  methods: {
    ...mapActions(['deleteNotification']),
    sortedActions (actions) {
      actions.sort((x, y) => x.primary === y.primary ? 0 : x.primary ? -1 : 1)
    },
    executeRequest (app, link, type) {
      this.$client.requests.ocs({
        service: 'apps/' + app,
        action: link,
        method: type
      })
    }
  }
}
</script>

<style scoped>
div > div > div:nth-of-type(n+2) { margin-top: 20px; }
</style>
