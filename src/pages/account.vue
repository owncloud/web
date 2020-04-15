<template>
  <div>
    <oc-loader v-if="loading" />
    <div v-if="!loading" class="uk-width-3-4@m uk-container uk-padding">
      <div class="uk-flex uk-flex-between uk-flex-middle">
        <h1 id="account-page-title" v-translate class="oc-page-title">Account</h1>
        <oc-button
          class="account-logout-button"
          icon="exit_to_app"
          @click="$_oc_settingsAccount_logout"
          ><translate>Log out</translate></oc-button
        >
      </div>
      <hr />
      <div class="uk-text-bold uk-margin-bottom"><translate>Account Information</translate></div>
      <div class="uk-flex uk-flex-wrap">
        <div class="uk-width-1-2@s uk-margin-bottom">
          <div class="uk-text-meta"><translate>Username:</translate></div>
          {{ user.id }}
        </div>
        <div class="uk-width-1-2@s uk-margin-bottom">
          <div class="uk-text-meta"><translate>Display name:</translate></div>
          {{ user.displayname }}
        </div>
        <div class="uk-width-1-2@s uk-margin-bottom">
          <div class="uk-text-meta"><translate>Email:</translate></div>
          <template v-if="user.email">{{ user.email }}</template>
          <span v-else v-translate>No email has been set up</span>
        </div>
        <div class="uk-width-1-2@s uk-margin-bottom" @click="$_oc_settingsAccount_getGroup">
          <div class="uk-text-meta"><translate>Groups membership:</translate></div>
          <template v-if="groups.length > 0">
            <span v-for="(group, index) in groups" :key="index">
              {{ group
              }}<template v-if="index + 1 < groups.length"
                >,
              </template>
            </span>
          </template>
          <span v-else v-translate>You are not part of any group</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'Personal',
  data() {
    return {
      loading: true,
      groups: []
    }
  },
  computed: {
    ...mapGetters(['user'])
  },
  mounted() {
    this.$_oc_settingsAccount_getGroup()
  },
  methods: {
    ...mapActions(['logout']),
    $_oc_settingsAccount_getGroup() {
      this.$client.users.getUserGroups(this.user.id).then(groups => {
        this.groups = groups
        this.loading = false
      })
    },
    $_oc_settingsAccount_logout() {
      this.logout()
    }
  }
}
</script>
