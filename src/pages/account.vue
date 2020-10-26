<template>
  <div>
    <oc-loader v-if="loading" />
    <div v-if="!loading" class="uk-width-3-4@m uk-container oc-p">
      <div class="uk-flex uk-flex-between uk-flex-middle">
        <h1 id="account-page-title" v-translate class="oc-page-title">Account</h1>
        <oc-button v-if="editUrl" variation="primary" type="a" :href="editUrl">
          <oc-icon name="edit" aria-hidden="true" />
          <translate>Edit</translate>
        </oc-button>
        <oc-button v-else-if="editRoute" variation="primary" type="router-link" :to="editRoute">
          <oc-icon name="edit" aria-hidden="true" />
          <translate>Edit</translate>
        </oc-button>
      </div>
      <hr />
      <div class="oc-text-bold oc-mb"><translate>Account Information</translate></div>
      <div class="uk-flex uk-flex-wrap">
        <div class="uk-width-1-2@s oc-mb">
          <div class="uk-text-meta"><translate>Username:</translate></div>
          {{ user.username || user.id }}
        </div>
        <div v-if="user.username && user.id" class="uk-width-1-2@s oc-mb">
          <div class="uk-text-meta"><translate>User ID:</translate></div>
          {{ user.id }}
        </div>
        <div class="uk-width-1-2@s oc-mb">
          <div class="uk-text-meta"><translate>Display name:</translate></div>
          {{ user.displayname }}
        </div>
        <div class="uk-width-1-2@s oc-mb">
          <div class="uk-text-meta"><translate>Email:</translate></div>
          <template v-if="user.email">{{ user.email }}</template>
          <span v-else v-translate>No email has been set up</span>
        </div>
        <div class="uk-width-1-2@s oc-mb" @click="$_oc_settingsAccount_getGroup">
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
