<template>
  <div class="uk-width-1-1 uk-container oc-p">
    <div v-if="loading" class="uk-flex uk-flex-between uk-flex-middle">
      <h1 class="oc-page-title">{{ pageTitle }}</h1>
      <oc-loader />
    </div>
    <template v-else>
      <div class="uk-flex uk-flex-between uk-flex-middle">
        <h1 id="account-page-title" v-translate class="oc-page-title">Account</h1>
        <oc-button v-if="editUrl" variation="primary" type="a" :href="editUrl">
          <oc-icon name="edit" />
          <translate>Edit</translate>
        </oc-button>
        <oc-button v-else-if="editRoute" variation="primary" type="router-link" :to="editRoute">
          <oc-icon name="edit" />
          <translate>Edit</translate>
        </oc-button>
      </div>
      <hr />
      <div class="oc-text-bold oc-mb"><translate>Account Information</translate></div>
      <div class="uk-flex uk-flex-wrap account-page-info">
        <div class="uk-width-1-2@s oc-mb account-page-info-username">
          <div class="oc-text-muted"><translate>Username</translate></div>
          {{ user.username || user.id }}
        </div>
        <div v-if="user.username && user.id" class="uk-width-1-2@s oc-mb account-page-info-userid">
          <div class="oc-text-muted"><translate>User ID</translate></div>
          {{ user.id }}
        </div>
        <div class="uk-width-1-2@s oc-mb account-page-info-displayname">
          <div class="oc-text-muted"><translate>Display name</translate></div>
          {{ user.displayname }}
        </div>
        <div class="uk-width-1-2@s oc-mb account-page-info-email">
          <div class="oc-text-muted"><translate>Email</translate></div>
          <template v-if="user.email">{{ user.email }}</template>
          <span v-else v-translate>No email has been set up</span>
        </div>
        <div
          class="uk-width-1-2@s oc-mb account-page-info-groups"
          @click="$_oc_settingsAccount_getGroup"
        >
          <div class="oc-text-muted"><translate>Group memberships</translate></div>
          <span v-if="groupNames">{{ groupNames }}</span>
          <span v-else v-translate>You are not part of any group</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'Personal',
  data() {
    return {
      loading: true,
      groups: []
    }
  },
  computed: {
    ...mapGetters(['user', 'configuration', 'getNavItemsByExtension', 'isOcis']),
    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },
    editUrl() {
      if (this.isOcis) {
        return null
      }
      return this.configuration.server.replace(/\/$/, '') + '/index.php/settings/personal'
    },
    editRoute() {
      const navItems = this.getNavItemsByExtension('settings')
      if (navItems.length > 0) {
        return navItems[0].route || {}
      }
      return null
    },
    groupNames() {
      return this.groups.join(', ')
    }
  },
  mounted() {
    this.$_oc_settingsAccount_getGroup()
  },
  methods: {
    $_oc_settingsAccount_getGroup() {
      this.$client.users.getUserGroups(this.user.id).then(groups => {
        this.groups = groups
        this.loading = false
      })
    }
  }
}
</script>
